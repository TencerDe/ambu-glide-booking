
from django.urls import path
from .views import DriverLoginView, DriverProfileView, DriverStatusView, AcceptRideView

urlpatterns = [
    path('driver/login/', DriverLoginView.as_view(), name='driver-login'),
    path('driver/profile/', DriverProfileView.as_view(), name='driver-profile'),
    path('driver/status/', DriverStatusView.as_view(), name='driver-status'),
    path('driver/accept-ride/', AcceptRideView.as_view(), name='driver-accept-ride'),
]
