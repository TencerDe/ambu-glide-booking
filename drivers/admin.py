
from django.contrib import admin
from .models import Driver

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'vehicle_number', 'status']
    list_filter = ['status']
    search_fields = ['user__email', 'license_number', 'vehicle_number']
