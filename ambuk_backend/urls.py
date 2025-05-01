
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('drivers.urls')),
    path('api/', include('adminpanel.urls')),
    path('api/', include('rides.urls')),
]
