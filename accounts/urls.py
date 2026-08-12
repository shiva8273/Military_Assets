from django.urls import path
from .views import LoginView, CreateUserView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('users/', CreateUserView.as_view(),name="create-user")
]