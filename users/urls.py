
from django.urls import path
from .views import SignupView, LoginView, UserProfileView

urlpatterns = [
    path('user/signup/', SignupView.as_view(), name='user-signup'),
    path('user/login/', LoginView.as_view(), name='user-login'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
]
