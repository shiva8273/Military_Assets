from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EquipmentType

from .serializer import EquipmentTypeSerializer
from accounts.permissions import IsAdmin

# Create your views here.


class EquipmentTypeViewSet(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):

        serializer = EquipmentTypeSerializer(data=request.data)

        if serializer.is_valid():

            equipment_type = serializer.save()

            return Response(
                {
                    "message": "Created Successfully",
                    "equipment": {
                        "id": equipment_type.id,
                        "name": equipment_type.name,
                        "category": equipment_type.category,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        equipment_types = EquipmentType.objects.all()
        serializer = EquipmentTypeSerializer(equipment_types, many=True)
        return Response(
                   serializer.data,
                   status=status.HTTP_200_OK
               )