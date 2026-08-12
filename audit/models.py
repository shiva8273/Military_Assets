from django.db import models
from django.conf import settings

# Create your models here.
class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50) 
    details = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)