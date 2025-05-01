
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from drivers.models import Driver
from rides.serializers import RideDetailSerializer

def notify_available_drivers(ride):
    """Notify all available drivers about a new ride request"""
    channel_layer = get_channel_layer()
    
    # Get all available drivers
    available_drivers = Driver.objects.filter(status='AVAILABLE')
    
    ride_data = RideDetailSerializer(ride).data
    
    # Send notification to each available driver
    for driver in available_drivers:
        async_to_sync(channel_layer.group_send)(
            f'driver_{driver.user.id}_notifications',
            {
                'type': 'ride_notification',
                'ride': ride_data
            }
        )

def send_ride_update(ride):
    """Send ride status update to the user"""
    channel_layer = get_channel_layer()
    
    ride_data = RideDetailSerializer(ride).data
    
    # Send update to user
    async_to_sync(channel_layer.group_send)(
        f'user_{ride.user.id}_ride_status',
        {
            'type': 'ride_status_update',
            'ride': ride_data
        }
    )
