from rest_framework import serializers
from .models import EquipmentType


class EquipmentTypeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = EquipmentType
        fields = [
            "id",
            "name",
            "category"
        ]