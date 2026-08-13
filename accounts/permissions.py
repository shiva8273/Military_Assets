
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    
    def has_permission(self, request, view):
        
        return(
            request.user.is_authenticated and request.user.role == "ADMIN"
        )
        
class IsAdminOrLogistics(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                "ADMIN",
                "LOGISTICS_OFFICER"
            ]
        )
        
class IsAdminOrBaseCommander(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [
                "ADMIN",
                "BASE_COMMANDER"
            ]
        )
        
class IsAdminOrLogisticsOrCommander(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                "ADMIN",
                "LOGISTICS_OFFICER",
                "BASE_COMMANDER",
            ]
        )