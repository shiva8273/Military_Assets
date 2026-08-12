from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AuditLog
from .serializers import AuditLogSerializer
from accounts.permissions import IsAdmin
class AuditLogView(APIView):

    permission_classes = [IsAdmin]
    
    def get(self, request):

        queryset = AuditLog.objects.select_related(
            "user"
        ).order_by(
            "-created_at"
        )

        serializer = AuditLogSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
        
        