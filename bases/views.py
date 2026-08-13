from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Base
from .serializers import BaseSerializer
from accounts.permissions import IsAdminOrLogistics

# Create your views here.


class BaseCreateView(APIView):
    
    permission_classes = [IsAdminOrLogistics]
    
    def get(self, request):

        bases = Base.objects.all()

        serializer = BaseSerializer(bases, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
    def post(self,request):
        
        serializer = BaseSerializer(data = request.data)
        
        if serializer.is_valid():
            base = serializer.save()
            
            return Response(
                {
                    "message":"Base Created Successfully"
                },status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
