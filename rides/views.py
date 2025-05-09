
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RideCreateSerializer, RideDetailSerializer
from .models import Ride
from django.shortcuts import get_object_or_404
from ws.utils import notify_available_drivers, send_ride_update

class BookRideView(APIView):
    def post(self, request):
        serializer = RideCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            ride = serializer.save()
            
            # Notify available drivers
            notify_available_drivers(ride)
            
            return Response(RideDetailSerializer(ride).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserRidesView(APIView):
    def get(self, request):
        rides = request.user.rides.all().order_by('-created_at')
        serializer = RideDetailSerializer(rides, many=True)
        return Response(serializer.data)

class RideDetailView(APIView):
    def get(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id, user=request.user)
        serializer = RideDetailSerializer(ride)
        return Response(serializer.data)
    
    def put(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id, user=request.user)
        
        # Only allow status updates from REQUESTED to CANCELLED
        if ride.status != 'REQUESTED':
            return Response({"error": "Ride cannot be modified at this stage"}, status=status.HTTP_400_BAD_REQUEST)
        
        status_update = request.data.get('status')
        if status_update != 'CANCELLED':
            return Response({"error": "Invalid status update"}, status=status.HTTP_400_BAD_REQUEST)
        
        ride.status = status_update
        ride.save()
        
        return Response(RideDetailSerializer(ride).data)

class RideAcceptanceView(APIView):
    """Dedicated API for ride acceptance with transaction guarantees and immediate user notification"""
    def post(self, request):
        ride_id = request.data.get('ride_id')
        driver_id = request.data.get('driver_id')
        
        if not ride_id or not driver_id:
            return Response({"error": "Missing ride ID or driver ID"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Use a transaction to ensure atomicity
        from django.db import transaction
        
        try:
            with transaction.atomic():
                # Lock the ride for update to prevent race conditions
                ride = Ride.objects.select_for_update().get(id=ride_id, status='REQUESTED')
                
                # Get the driver
                from drivers.models import Driver
                driver = Driver.objects.select_for_update().get(id=driver_id, status='AVAILABLE')
                
                # Update the ride
                ride.driver = driver
                ride.status = 'ACCEPTED'
                ride.save()
                
                # Update the driver status to BUSY
                driver.status = 'BUSY'
                driver.save()
                
                # Immediately notify the user about ride acceptance - with retry mechanism
                for attempt in range(3):  # Try 3 times at most
                    try:
                        print(f"Sending ride update to user {ride.user.id} (attempt {attempt+1})")
                        send_ride_update(ride)
                        break  # Successfully sent notification, exit retry loop
                    except Exception as e:
                        if attempt == 2:  # Last attempt
                            print(f"Failed to notify user after 3 attempts: {str(e)}")
                        else:
                            import time
                            time.sleep(0.5)  # Wait half a second before retrying
                
                return Response(RideDetailSerializer(ride).data, status=status.HTTP_200_OK)
                
        except Ride.DoesNotExist:
            return Response({"error": "Ride not found or already accepted"}, status=status.HTTP_404_NOT_FOUND)
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found or not available"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
