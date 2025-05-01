
from django.urls import path
from .views import BookRideView, UserRidesView, RideDetailView

urlpatterns = [
    path('book-ride/', BookRideView.as_view(), name='book-ride'),
    path('user/rides/', UserRidesView.as_view(), name='user-rides'),
    path('user/rides/<int:ride_id>/', RideDetailView.as_view(), name='ride-detail'),
]
