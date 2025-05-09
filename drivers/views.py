
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import DriverSerializer
from .models import Driver
from rides.models import Ride
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class DriverLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"Driver login attempt for email: {email}")
        
        user = authenticate(username=email, password=password)
        
        if user and user.user_type == 'DRIVER':
            refresh = RefreshToken.for_user(user)
            
            try:
                driver = user.driver
                driver_serializer = DriverSerializer(driver)
                
                logger.info(f"Driver login successful: {driver.id}")
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'driver': driver_serializer.data
                })
            except Driver.DoesNotExist:
                logger.error(f"Driver profile not found for user {user.id}")
                return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        logger.warning(f"Invalid login credentials for: {email}")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class DriverProfileView(APIView):
    def get(self, request):
        try:
            driver = request.user.driver
            serializer = DriverSerializer(driver)
            return Response(serializer.data)
        except Driver.DoesNotExist:
            logger.error(f"Driver profile not found for user {request.user.id}")
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        try:
            driver = request.user.driver
            serializer = DriverSerializer(driver, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Driver profile updated: {driver.id}")
                return Response(serializer.data)
            
            logger.warning(f"Failed to update driver profile: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            logger.error(f"Driver profile not found for user {request.user.id}")
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

class AcceptRideView(APIView):
    def post(self, request):
        ride_id = request.data.get('ride_id')
        
        logger.info(f"Driver {request.user.id} attempting to accept ride {ride_id}")
        
        if not ride_id:
            logger.warning("Missing ride_id in ride acceptance request")
            return Response({'error': 'Missing ride ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use transaction to ensure atomicity
            with transaction.atomic():
                driver = Driver.objects.select_for_update().get(user=request.user)
                ride = Ride.objects.select_for_update().get(id=ride_id, status='REQUESTED')
                
                # Update the ride
                ride.driver = driver
                ride.status = 'ACCEPTED'
                ride.save()
                
                # Update the driver status
                driver.status = 'BUSY'
                driver.save()
                
                logger.info(f"Ride {ride_id} accepted by driver {driver.id} successfully")
            
            # Get fresh instances after the transaction
            updated_ride = Ride.objects.get(id=ride_id)
            
            # Notify user through WebSockets
            from ws.utils import send_ride_update
            notification_sent = send_ride_update(updated_ride)
            
            if not notification_sent:
                logger.warning(f"Failed to notify user {updated_ride.user.id} about ride acceptance")
            
            # Return detailed response
            return Response({
                'message': 'Ride accepted successfully',
                'ride': RideDetailSerializer(updated_ride).data
            })
            
        except Driver.DoesNotExist:
            logger.error(f"Driver profile not found for user {request.user.id}")
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Ride.DoesNotExist:
            logger.warning(f"Ride {ride_id} not found or already accepted")
            return Response({
                'error': 'Ride not found or already accepted',
                'code': 'RIDE_UNAVAILABLE'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error accepting ride: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Import at the top
from rides.serializers import RideDetailSerializer
