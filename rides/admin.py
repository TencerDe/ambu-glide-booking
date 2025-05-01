
from django.contrib import admin
from .models import Ride

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'driver', 'pickup_location', 'destination', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'driver__user__email', 'pickup_location', 'destination']
    ordering = ['-created_at']
