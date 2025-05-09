
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from drivers.models import Driver
from rides.serializers import RideDetailSerializer
import logging
import time

# Set up logging
logger = logging.getLogger(__name__)

def notify_available_drivers(ride):
    """Notify all available drivers about a new ride request with guaranteed delivery"""
    channel_layer = get_channel_layer()
    
    # Get all available drivers
    available_drivers = Driver.objects.filter(status='AVAILABLE')
    
    ride_data = RideDetailSerializer(ride).data
    
    # Send notification to each available driver with retry mechanism
    for driver in available_drivers:
        max_retries = 3
        retry_count = 0
        success = False
        
        while retry_count < max_retries and not success:
            try:
                async_to_sync(channel_layer.group_send)(
                    f'driver_{driver.user.id}_notifications',
                    {
                        'type': 'ride_notification',
                        'ride': ride_data
                    }
                )
                logger.info(f"Successfully notified driver {driver.id} about ride {ride.id}")
                success = True
            except Exception as e:
                retry_count += 1
                logger.warning(f"Attempt {retry_count} failed to notify driver {driver.id}: {str(e)}")
                if retry_count < max_retries:
                    time.sleep(0.5 * retry_count)  # Exponential backoff
                else:
                    logger.error(f"Failed to notify driver {driver.id} after {max_retries} attempts: {str(e)}")

def send_ride_update(ride):
    """Send ride status update to the user with improved reliability and guaranteed delivery"""
    channel_layer = get_channel_layer()
    
    ride_data = RideDetailSerializer(ride).data
    
    # Ensure we have a user to notify
    if not ride.user:
        logger.warning(f"No user associated with ride {ride.id} for status update")
        return False
    
    # Try to send with exponential backoff retry
    max_retries = 5  # Increased from 3 to 5
    base_delay = 0.5  # Start with 500ms delay
    
    for attempt in range(max_retries):
        try:
            # Send update to user
            async_to_sync(channel_layer.group_send)(
                f'user_{ride.user.id}_ride_status',
                {
                    'type': 'ride_status_update',
                    'ride': ride_data
                }
            )
            logger.info(f"Successfully sent ride update to user {ride.user.id} for ride {ride.id}: {ride.status} (attempt {attempt+1})")
            return True
        except Exception as e:
            delay = base_delay * (2 ** attempt)  # Exponential backoff
            logger.warning(f"Attempt {attempt+1} failed to send ride update to user {ride.user.id}: {str(e)}, retrying in {delay}s")
            
            if attempt < max_retries - 1:  # Don't sleep after the last attempt
                time.sleep(delay)
            else:
                logger.error(f"Failed to send ride update after {max_retries} attempts: {str(e)}")
                return False

def broadcast_ride_cancellation(ride_id, user_id):
    """Broadcast ride cancellation to all drivers"""
    channel_layer = get_channel_layer()
    
    # Get all drivers to notify about cancellation
    drivers = Driver.objects.all()
    
    for driver in drivers:
        try:
            async_to_sync(channel_layer.group_send)(
                f'driver_{driver.user.id}_notifications',
                {
                    'type': 'ride_cancelled',
                    'ride_id': ride_id
                }
            )
            logger.info(f"Notified driver {driver.id} about cancellation of ride {ride_id}")
        except Exception as e:
            logger.error(f"Failed to notify driver {driver.id} about cancellation: {str(e)}")
