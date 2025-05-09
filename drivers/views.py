
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import DriverSerializer
from .models import Driver
from rides.models import Ride
from django.shortcuts import get_object_or_404

class DriverLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        
        if user and user.user_type == 'DRIVER':
            refresh = RefreshToken.for_user(user)
            
            try:
                driver = user.driver
                driver_serializer = DriverSerializer(driver)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'driver': driver_serializer.data
                })
            except Driver.DoesNotExist:
                return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class DriverProfileView(APIView):
    def get(self, request):
        try:
            driver = request.user.driver
            serializer = DriverSerializer(driver)
            return Response(serializer.data)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        try:
            driver = request.user.driver
            serializer = DriverSerializer(driver, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

class DriverStatusView(APIView):
    def post(self, request):
        try:
            driver = request.user.driver
            new_status = request.data.get('status')
            
            if new_status not in [choice[0] for choice in Driver.STATUS_CHOICES]:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if driver is trying to set status to AVAILABLE but has active rides
            if new_status == 'AVAILABLE':
                # Check for any active rides
                active_rides = Ride.objects.filter(
                    driver=driver,
                    status__in=['ACCEPTED', 'EN_ROUTE', 'PICKED_UP']
                ).exists()
                
                if active_rides:
                    return Response({
                        'error': 'Cannot set status to Available while you have active rides'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update both status and is_available fields
            driver.status = new_status
            driver.is_available = (new_status == 'AVAILABLE')
            driver.save()
            
            # Return the complete updated driver data
            serializer = DriverSerializer(driver)
            return Response(serializer.data)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Add better error handling
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AcceptRideView(APIView):
    def post(self, request):
        ride_id = request.data.get('ride_id')
        
        try:
            driver = request.user.driver
            ride = get_object_or_404(Ride, id=ride_id, status='REQUESTED')
            
            ride.driver = driver
            ride.status = 'ACCEPTED'
            ride.save()
            
            # Automatically set driver status to BUSY when accepting a ride
            driver.status = 'BUSY'
            driver.is_available = False
            driver.save()
            
            # Notify user through WebSockets (implementation in ws app)
            from ws.utils import send_ride_update
            send_ride_update(ride)
            
            return Response({'message': 'Ride accepted successfully'})
        except Driver.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Add better error handling
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
