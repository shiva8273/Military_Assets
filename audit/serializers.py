from .models import AuditLog
from rest_framework import serializers


class AuditLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action",
            "created_at",
            "details",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]