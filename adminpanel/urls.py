
from django.urls import path
from .views import AdminLoginView, CreateDriverView, ListDriversView, ListRidesView, DashboardView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/create-driver/', CreateDriverView.as_view(), name='admin-create-driver'),
    path('admin/drivers/', ListDriversView.as_view(), name='admin-list-drivers'),
    path('admin/rides/', ListRidesView.as_view(), name='admin-list-rides'),
    path('admin/dashboard/', DashboardView.as_view(), name='admin-dashboard'),
]
