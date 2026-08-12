from django.urls import path
from .views import EquipmentTypeViewSet

urlpatterns = [
    path("eq_type/",EquipmentTypeViewSet.as_view(),name="eq_type")
]
