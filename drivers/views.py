
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
                
                # Store latest driver status
                driver.save()  # This ensures updated_at is refreshed
                
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

class DriverStatusView(APIView):
    def post(self, request):
        try:
            driver = request.user.driver
            new_status = request.data.get('status')
            
            logger.info(f"Driver {driver.id} status update request: {new_status}")
            
            if new_status not in [choice[0] for choice in Driver.STATUS_CHOICES]:
                logger.warning(f"Invalid status update request: {new_status}")
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if driver is trying to set status to AVAILABLE but has active rides
            if new_status == 'AVAILABLE':
                # Check for any active rides
                active_rides = Ride.objects.filter(
                    driver=driver,
                    status__in=['ACCEPTED', 'EN_ROUTE', 'PICKED_UP']
                ).exists()
                
                if active_rides:
                    logger.warning(f"Driver {driver.id} attempted to set status to AVAILABLE with active rides")
                    return Response({
                        'error': 'Cannot set status to Available while you have active rides'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update driver status within transaction
            with transaction.atomic():
                # Get fresh instance with select_for_update to prevent race conditions
                driver_refresh = Driver.objects.select_for_update().get(id=driver.id)
                driver_refresh.status = new_status
                driver_refresh.is_available = (new_status == 'AVAILABLE')
                driver_refresh.save()
            
            logger.info(f"Driver {driver.id} status updated to {new_status}")
            
            # Return the complete updated driver data
            driver = Driver.objects.get(id=driver.id)  # Get fresh instance
            serializer = DriverSerializer(driver)
            return Response(serializer.data)
            
        except Driver.DoesNotExist:
            logger.error(f"Driver profile not found for user {request.user.id}")
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating driver status: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                
                # Check if the driver is available
                if driver.status != 'AVAILABLE':
                    logger.warning(f"Driver {driver.id} is not available (status: {driver.status})")
                    return Response({
                        'error': 'You must be available to accept rides',
                        'code': 'DRIVER_NOT_AVAILABLE'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Update the ride
                ride.driver = driver
                ride.status = 'ACCEPTED'
                ride.save()
                
                # Update the driver status
                driver.status = 'BUSY'
                driver.is_available = False
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
