from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        BASE_COMMANDER = "BASE_COMMANDER", "Base Commander"
        LOGISTICS_OFFICER = "LOGISTICS_OFFICER", "Logistics Officer"
        
    
    role = models.CharField(max_length=30,choices =Role.choices,default = Role.LOGISTICS_OFFICER )
    
    base = models.ForeignKey(
        "bases.Base",
        on_delete = models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )