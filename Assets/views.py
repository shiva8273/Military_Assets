from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializer import EquipmentTypeSerializer
from accounts.permissions import IsAdmin
# Create your views here.

class EquipmentTypeViewSet(APIView):
    permission_classes = [IsAdmin]
    
    def post(self,request):
        
        serializer = EquipmentTypeSerializer(data = request.data)
        
        if serializer.is_valid():
            
            equipment_type = serializer.save()
            
            return Response(
                {
                    "message":"Created Successfully",
                     "equipment": {
                        "id": equipment_type.id,
                        "name": equipment_type.name,
                        "category": equipment_type.category,
                    },
                },status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

