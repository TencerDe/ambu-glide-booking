
from django.db import models
from users.models import User

class Driver(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('BUSY', 'Busy'),
        ('OFFLINE', 'Offline'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver')
    license_number = models.CharField(max_length=50)
    vehicle_number = models.CharField(max_length=20)
    vehicle_model = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OFFLINE')
    current_location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Driver: {self.user.email}"
