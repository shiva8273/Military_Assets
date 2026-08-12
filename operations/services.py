from django.db.models import Sum

from .models import (
    Purchase,
    Transfer,
    Assignment,
    Expenditure,
    OpeningBalance,
)


def get_inventory_balance(base, equipment_type):

    opening_balance = (
        OpeningBalance.objects.filter(
            base=base,
            equipment_type=equipment_type,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    purchases = (
        Purchase.objects.filter(
            base=base,
            equipment_type=equipment_type,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    transfers_in = (
        Transfer.objects.filter(
            destination_base=base,
            equipment_type=equipment_type,
            status=Transfer.Status.COMPLETED,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    transfers_out = (
        Transfer.objects.filter(
            source_base=base,
            equipment_type=equipment_type,
            status=Transfer.Status.COMPLETED,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    assignments = (
        Assignment.objects.filter(
            base=base,
            equipment_type=equipment_type,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    expenditures = (
        Expenditure.objects.filter(
            base=base,
            equipment_type=equipment_type,
        )
        .aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    closing_balance = (
        opening_balance
        + purchases
        + transfers_in
        - transfers_out
        - assignments
        - expenditures
    )

    return {
        "opening_balance": opening_balance,
        "purchases": purchases,
        "transfers_in": transfers_in,
        "transfers_out": transfers_out,
        "assignments": assignments,
        "expenditures": expenditures,
        "closing_balance": closing_balance,
    }