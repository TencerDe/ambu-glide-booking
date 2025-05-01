
from rest_framework import serializers
from .models import Ride
from users.serializers import UserSerializer
from drivers.serializers import DriverSerializer

class RideCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = ['pickup_location', 'pickup_lat', 'pickup_lng', 'destination', 
                  'destination_lat', 'destination_lng', 'ride_type']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        # You might want to calculate estimated fare here based on distance
        return super().create(validated_data)

class RideDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    
    class Meta:
        model = Ride
        fields = '__all__'
