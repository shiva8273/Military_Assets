from django.db import models

# Create your models here.
class EquipmentType(models.Model):
    
    class Category(models.TextChoices):
        WEAPON = "WEAPON","Weapon"
        VEHICLE = "VEHICLE", "Vehicle"
        AMMUNITION = "AMMUNITION", "Ammunition"
        
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
    )
    