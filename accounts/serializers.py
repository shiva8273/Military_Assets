from rest_framework import serializers

from .models import User

class UserCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            'password',
            "role",
            "base",
        ]
        
        
        extra_kwargs = {
            "password": {
                "write_only":True
            }
        }
        
    def create(self,validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role = validated_data['role'],
            base =validated_data['base']
            
        )
        
        return user
    
    
class UserSerializer(serializers.ModelSerializer):
    base_name = serializers.CharField(
        source="base.name",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "base",
            "base_name",
        ]