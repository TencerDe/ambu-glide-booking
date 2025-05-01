
from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'user_type']
    list_filter = ['user_type']
    search_fields = ['email', 'username', 'first_name', 'last_name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'emergency_contact']
    search_fields = ['user__email', 'emergency_contact']
