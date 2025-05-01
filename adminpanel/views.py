
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from drivers.serializers import DriverSerializer
from drivers.models import Driver
from rides.models import Ride
from rides.serializers import RideDetailSerializer

User = get_user_model()

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        
        if user and user.user_type == 'ADMIN':
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'admin': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                }
            })
        
        return Response({'error': 'Invalid admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class IsAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'ADMIN'

class CreateDriverView(APIView):
    permission_classes = [IsAdminPermission]
    
    def post(self, request):
        serializer = DriverSerializer(data=request.data)
        if serializer.is_valid():
            driver = serializer.save()
            return Response(DriverSerializer(driver).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListDriversView(APIView):
    permission_classes = [IsAdminPermission]
    
    def get(self, request):
        drivers = Driver.objects.all()
        serializer = DriverSerializer(drivers, many=True)
        return Response(serializer.data)

class ListRidesView(APIView):
    permission_classes = [IsAdminPermission]
    
    def get(self, request):
        rides = Ride.objects.all().order_by('-created_at')
        serializer = RideDetailSerializer(rides, many=True)
        return Response(serializer.data)

class DashboardView(APIView):
    permission_classes = [IsAdminPermission]
    
    def get(self, request):
        # Simple statistics for admin dashboard
        total_users = User.objects.filter(user_type='USER').count()
        total_drivers = Driver.objects.count()
        active_drivers = Driver.objects.filter(status='AVAILABLE').count()
        total_rides = Ride.objects.count()
        pending_rides = Ride.objects.filter(status='REQUESTED').count()
        completed_rides = Ride.objects.filter(status='COMPLETED').count()
        
        return Response({
            'total_users': total_users,
            'total_drivers': total_drivers,
            'active_drivers': active_drivers,
            'total_rides': total_rides,
            'pending_rides': pending_rides,
            'completed_rides': completed_rides
        })
