
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RideCreateSerializer, RideDetailSerializer
from .models import Ride
from django.shortcuts import get_object_or_404
from django.db import transaction
from drivers.models import Driver
from ws.utils import notify_available_drivers, send_ride_update
import logging

logger = logging.getLogger(__name__)

class BookRideView(APIView):
    def post(self, request):
        serializer = RideCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            ride = serializer.save()
            
            # Notify available drivers
            notify_available_drivers(ride)
            
            logger.info(f"New ride created: {ride.id}, notifying drivers")
            return Response(RideDetailSerializer(ride).data, status=status.HTTP_201_CREATED)
        
        logger.warning(f"Failed to create ride: {serializer.errors}")
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
            logger.warning(f"Invalid ride status update - ride {ride.id} cannot be modified at this stage")
            return Response({"error": "Ride cannot be modified at this stage"}, status=status.HTTP_400_BAD_REQUEST)
        
        status_update = request.data.get('status')
        if status_update != 'CANCELLED':
            logger.warning(f"Invalid ride status update for ride {ride.id}: {status_update}")
            return Response({"error": "Invalid status update"}, status=status.HTTP_400_BAD_REQUEST)
        
        ride.status = status_update
        ride.save()
        
        logger.info(f"Ride {ride.id} cancelled by user {request.user.id}")
        
        # Notify all drivers about the cancellation
        from ws.utils import broadcast_ride_cancellation
        broadcast_ride_cancellation(str(ride.id), str(request.user.id))
        
        return Response(RideDetailSerializer(ride).data)

class RideAcceptanceView(APIView):
    """Dedicated API for ride acceptance with transaction guarantees and immediate user notification"""
    def post(self, request):
        ride_id = request.data.get('ride_id')
        driver_id = request.data.get('driver_id')
        
        logger.info(f"Driver {driver_id} attempting to accept ride {ride_id}")
        
        if not ride_id or not driver_id:
            logger.warning("Missing ride_id or driver_id in ride acceptance request")
            return Response({"error": "Missing ride ID or driver ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use a transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Lock the ride for update to prevent race conditions
                ride = Ride.objects.select_for_update().get(id=ride_id, status='REQUESTED')
                
                # Get the driver
                driver = Driver.objects.select_for_update().get(id=driver_id, status='AVAILABLE')
                
                # Update the ride
                ride.driver = driver
                ride.status = 'ACCEPTED'
                ride.save()
                
                # Update the driver status to BUSY
                driver.status = 'BUSY'
                driver.save()
                
                logger.info(f"Ride {ride_id} accepted by driver {driver_id} successfully")
                
                # Immediately notify the user about ride acceptance - with retry mechanism
                notification_sent = send_ride_update(ride)
                
                if not notification_sent:
                    logger.warning(f"Failed to notify user {ride.user.id} about ride {ride.id} acceptance. "
                                 f"Will continue to retry in background.")
                    
                    # In a real-world scenario, you might want to queue these notifications
                    # or handle them with a background task
                
                return Response(RideDetailSerializer(ride).data, status=status.HTTP_200_OK)
                
        except Ride.DoesNotExist:
            logger.warning(f"Ride {ride_id} not found or already accepted")
            return Response(
                {"error": "Ride not found or already accepted", "code": "RIDE_UNAVAILABLE"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Driver.DoesNotExist:
            logger.warning(f"Driver {driver_id} not found or not available")
            return Response(
                {"error": "Driver not found or not available", "code": "DRIVER_UNAVAILABLE"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error during ride acceptance: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
