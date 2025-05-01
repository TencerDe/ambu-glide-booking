
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Driver

User = get_user_model()

class DriverUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number']

class DriverSerializer(serializers.ModelSerializer):
    user = DriverUserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True)
    
    class Meta:
        model = Driver
        fields = ['id', 'user', 'user_id', 'email', 'password', 'first_name', 'last_name', 
                  'phone_number', 'license_number', 'vehicle_number', 'vehicle_model', 
                  'status', 'current_location_lat', 'current_location_lng']
    
    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password', None)
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        phone_number = validated_data.pop('phone_number', '')
        
        user = User.objects.create(
            username=email.split('@')[0],
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            user_type='DRIVER'
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        
        driver = Driver.objects.create(user=user, **validated_data)
        return driver
