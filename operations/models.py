from django.db import models

# Create your models here.
from django.db import models
from bases.models import Base
from Assets.models import EquipmentType
from django.conf import settings


# Create your models here.


class Purchase(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE,related_name = "purchases")
    equipment_type = models.ForeignKey(EquipmentType,related_name="eq_type", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    

class Transfer(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        IN_TRANSIT = "IN_TRANSIT"
        COMPLETED = "COMPLETED"

    source_base = models.ForeignKey(
        Base,
        related_name="transfers_out",
        on_delete=models.CASCADE
    )

    destination_base = models.ForeignKey(
        Base,
        related_name="transfers_in",
        on_delete=models.CASCADE
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.COMPLETED
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

class Assignment(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    assigned_to = models.CharField(max_length=150) 
    assigned_on = models.DateTimeField(auto_now_add=True)

class Expenditure(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    expended_on = models.DateTimeField(auto_now_add=True)
    
class OpeningBalance(models.Model):

    base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name="opening_balances"
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["base", "equipment_type"],
                name="unique_opening_balance"
            )
        ]

