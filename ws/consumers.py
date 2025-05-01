
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from drivers.models import Driver

User = get_user_model()

class DriverNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract driver ID from URL route or query param
        user_id = self.scope['url_route']['kwargs'].get('user_id')
        if not user_id:
            await self.close()
            return
        
        # Verify this is a driver
        is_driver = await self.is_user_driver(user_id)
        if not is_driver:
            await self.close()
            return
        
        self.driver_id = user_id
        self.notification_group_name = f'driver_{self.driver_id}_notifications'
        
        # Add to driver's notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'notification_group_name'):
            # Remove from driver's notification group
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'status_update':
            status = data.get('status')
            await self.update_driver_status(self.driver_id, status)
            
            await self.send(text_data=json.dumps({
                'type': 'status_updated',
                'status': status
            }))
    
    async def ride_notification(self, event):
        # Send ride notification to driver
        await self.send(text_data=json.dumps({
            'type': 'new_ride_request',
            'ride': event['ride']
        }))
    
    async def ride_cancelled(self, event):
        # Send cancellation notification
        await self.send(text_data=json.dumps({
            'type': 'ride_cancelled',
            'ride_id': event['ride_id']
        }))
    
    @database_sync_to_async
    def is_user_driver(self, user_id):
        try:
            user = User.objects.get(id=user_id)
            return user.user_type == 'DRIVER'
        except User.DoesNotExist:
            return False
    
    @database_sync_to_async
    def update_driver_status(self, user_id, status):
        try:
            driver = Driver.objects.get(user_id=user_id)
            if status in [choice[0] for choice in Driver.STATUS_CHOICES]:
                driver.status = status
                driver.save()
                return True
            return False
        except Driver.DoesNotExist:
            return False

class UserRideStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract user ID from URL route
        user_id = self.scope['url_route']['kwargs'].get('user_id')
        if not user_id:
            await self.close()
            return
        
        self.user_id = user_id
        self.ride_status_group_name = f'user_{self.user_id}_ride_status'
        
        # Add to user's ride status group
        await self.channel_layer.group_add(
            self.ride_status_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'ride_status_group_name'):
            # Remove from user's ride status group
            await self.channel_layer.group_discard(
                self.ride_status_group_name,
                self.channel_name
            )
    
    async def ride_status_update(self, event):
        # Send ride status update to user
        await self.send(text_data=json.dumps({
            'type': 'ride_status_update',
            'ride': event['ride']
        }))
