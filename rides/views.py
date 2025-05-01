
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RideCreateSerializer, RideDetailSerializer
from .models import Ride
from django.shortcuts import get_object_or_404
from ws.utils import notify_available_drivers

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
