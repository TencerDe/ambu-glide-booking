
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/driver/notifications/(?P<user_id>\w+)/$', consumers.DriverNotificationConsumer.as_async_consumer()),
    re_path(r'ws/user/ride-status/(?P<user_id>\w+)/$', consumers.UserRideStatusConsumer.as_async_consumer()),
]
