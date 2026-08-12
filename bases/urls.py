from django.urls import path

from .views import BaseCreateView

urlpatterns = [
    path("bases/",BaseCreateView.as_view(),name="base_create")
]
