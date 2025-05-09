
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from drivers.models import Driver

User = get_user_model()
logger = logging.getLogger(__name__)

class DriverNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract driver ID from URL route or query param
        user_id = self.scope['url_route']['kwargs'].get('user_id')
        if not user_id:
            logger.warning("WebSocket connection attempt without user_id")
            await self.close()
            return
        
        # Verify this is a driver
        is_driver = await self.is_user_driver(user_id)
        if not is_driver:
            logger.warning(f"WebSocket connection attempt by non-driver user: {user_id}")
            await self.close()
            return
        
        self.driver_id = user_id
        self.notification_group_name = f'driver_{self.driver_id}_notifications'
        
        # Add to driver's notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        logger.info(f"Driver {user_id} connected to WebSocket")
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'notification_group_name'):
            # Remove from driver's notification group
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
            logger.info(f"Driver {self.driver_id} disconnected from WebSocket with code {close_code}")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Handle ping messages to keep connection alive
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
        except json.JSONDecodeError:
            logger.error(f"Driver {self.driver_id} sent invalid JSON")
        except Exception as e:
            logger.error(f"Error in WebSocket receive for driver {self.driver_id}: {str(e)}")
    
    async def ride_notification(self, event):
        # Send ride notification to driver
        try:
            await self.send(text_data=json.dumps({
                'type': 'new_ride_request',
                'ride': event['ride']
            }))
            logger.info(f"Sent ride notification to driver {self.driver_id}")
        except Exception as e:
            logger.error(f"Error sending ride notification to driver {self.driver_id}: {str(e)}")
    
    async def ride_cancelled(self, event):
        # Send cancellation notification
        try:
            await self.send(text_data=json.dumps({
                'type': 'ride_cancelled',
                'ride_id': event['ride_id']
            }))
            logger.info(f"Sent ride cancellation to driver {self.driver_id} for ride {event['ride_id']}")
        except Exception as e:
            logger.error(f"Error sending ride cancellation to driver {self.driver_id}: {str(e)}")
    
    @database_sync_to_async
    def is_user_driver(self, user_id):
        try:
            user = User.objects.get(id=user_id)
            return user.user_type == 'DRIVER'
        except User.DoesNotExist:
            logger.warning(f"User {user_id} not found when checking if driver")
            return False

class UserRideStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract user ID from URL route
        user_id = self.scope['url_route']['kwargs'].get('user_id')
        if not user_id:
            logger.warning("WebSocket connection attempt without user_id")
            await self.close()
            return
        
        self.user_id = user_id
        self.ride_status_group_name = f'user_{self.user_id}_ride_status'
        
        # Add to user's ride status group
        await self.channel_layer.group_add(
            self.ride_status_group_name,
            self.channel_name
        )
        
        logger.info(f"User {user_id} connected to ride status WebSocket")
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'ride_status_group_name'):
            # Remove from user's ride status group
            await self.channel_layer.group_discard(
                self.ride_status_group_name,
                self.channel_name
            )
            logger.info(f"User {self.user_id} disconnected from WebSocket with code {close_code}")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Handle ping messages to keep connection alive
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
        except json.JSONDecodeError:
            logger.error(f"User {self.user_id} sent invalid JSON")
        except Exception as e:
            logger.error(f"Error in WebSocket receive for user {self.user_id}: {str(e)}")
    
    async def ride_status_update(self, event):
        # Send ride status update to user
        try:
            await self.send(text_data=json.dumps({
                'type': 'ride_status_update',
                'ride': event['ride']
            }))
            logger.info(f"Sent ride status update to user {self.user_id}")
        except Exception as e:
            logger.error(f"Error sending ride status update to user {self.user_id}: {str(e)}")
