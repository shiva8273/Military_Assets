from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from accounts.permissions import (
    IsAdmin,
    IsAdminOrLogistics,IsAdminOrBaseCommander
 
)

from bases.models import Base
from Assets.models import EquipmentType
from .models import Transfer, Purchase, Assignment, Expenditure, OpeningBalance
from .serializers import (
    TransferSerializer,
    PurchaseSerializer,
    AssignmentSerializer,
    ExpenditureSerializer,
    OpeningBalanceSerializer,
)
from audit.models import AuditLog
from .services import get_inventory_balance


class PurchaseView(APIView):

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminOrLogistics()]

        return [IsAuthenticated()]

    def get(self, request):

        queryset = Purchase.objects.select_related(
            "base", "equipment_type", "created_by"
        )

        if request.user.role == "BASE_COMMANDER":
            queryset = queryset.filter(base=request.user.base)

        serializer = PurchaseSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, request):

        serializer = PurchaseSerializer(data=request.data)

        if serializer.is_valid():

            purchase = serializer.save(created_by=request.user)

            AuditLog.objects.create(
                user=request.user,
                action="PURCHASE_CREATED",
                details={
                    "purchase_id": purchase.id,
                    "base_id": purchase.base_id,
                    "equipment_type_id": purchase.equipment_type_id,
                    "quantity": purchase.quantity,
                },
            )

            return Response(
                PurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransferView(APIView):

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminOrLogistics()]

        return [IsAuthenticated()]

    def get(self, request):

        queryset = Transfer.objects.select_related(
            "source_base",
            "destination_base",
            "equipment_type",
            "initiated_by",
        ).order_by("-timestamp")

        if request.user.role == "BASE_COMMANDER":
            queryset = queryset.filter(
                Q(source_base=request.user.base) | Q(destination_base=request.user.base)
            )

        serializer = TransferSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):

        serializer = TransferSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        source_base = serializer.validated_data["source_base"]
        destination_base = serializer.validated_data["destination_base"]
        equipment_type = serializer.validated_data["equipment_type"]
        quantity = serializer.validated_data["quantity"]

        inventory = get_inventory_balance(
            source_base,
            equipment_type,
        )

        available_quantity = inventory["closing_balance"]

        if quantity > available_quantity:
            return Response(
                {
                    "error": "Insufficient inventory.",
                    "available_quantity": available_quantity,
                    "requested_quantity": quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transfer = serializer.save(
            initiated_by=request.user,
            status=Transfer.Status.COMPLETED,
        )

        AuditLog.objects.create(
            user=request.user,
            action="TRANSFER_CREATED",
            details={
                "transfer_id": transfer.id,
                "source_base_id": transfer.source_base_id,
                "destination_base_id": transfer.destination_base_id,
                "equipment_type_id": transfer.equipment_type_id,
                "quantity": transfer.quantity,
                "status": transfer.status,
            },
        )

        return Response(
            TransferSerializer(transfer).data, status=status.HTTP_201_CREATED
        )


class AssignmentView(APIView):

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminOrBaseCommander()]

        return [IsAuthenticated()]

    def get(self, request):

        queryset = Assignment.objects.select_related("base", "equipment_type").order_by(
            "-assigned_on"
        )

        if request.user.role == "BASE_COMMANDER":
            queryset = queryset.filter(base=request.user.base)

        serializer = AssignmentSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):

        serializer = AssignmentSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        source_base = serializer.validated_data["base"]
        equipment_type = serializer.validated_data["equipment_type"]
        quantity = serializer.validated_data["quantity"]

        inventory = get_inventory_balance(
            source_base,
            equipment_type,
        )

        available_quantity = inventory["closing_balance"]

        if quantity > available_quantity:
            return Response(
                {
                    "error": "Insufficient inventory.",
                    "available_quantity": available_quantity,
                    "requested_quantity": quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment = serializer.save()

        AuditLog.objects.create(
            user=request.user,
            action="ASSIGNMENT_CREATED",
            details={
                "assignment_id": assignment.id,
                "base_id": assignment.base_id,
                "equipment_type_id": assignment.equipment_type_id,
                "quantity": assignment.quantity,
                "assigned_to": assignment.assigned_to,
            },
        )

        return Response(
            AssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED
        )


class ExpenditureView(APIView):

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminOrBaseCommander()]

        return [IsAuthenticated()]

    def get(self, request):

        queryset = Expenditure.objects.select_related(
            "base", "equipment_type"
        ).order_by("-expended_on")

        if request.user.role == "BASE_COMMANDER":
            queryset = queryset.filter(base=request.user.base)

        serializer = ExpenditureSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):

        serializer = ExpenditureSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        source_base = serializer.validated_data["base"]
        equipment_type = serializer.validated_data["equipment_type"]
        quantity = serializer.validated_data["quantity"]

        inventory = get_inventory_balance(source_base,equipment_type,)

        available_quantity = inventory["closing_balance"]

        if quantity > available_quantity:
            return Response(
                {
                    "error": "Insufficient inventory.",
                    "available_quantity": available_quantity,
                    "requested_quantity": quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        expenditure = serializer.save()

        AuditLog.objects.create(
            user=request.user,
            action="EXPENDITURE_CREATED",
            details={
                "expenditure_id": expenditure.id,
                "base_id": expenditure.base_id,
                "equipment_type_id": expenditure.equipment_type_id,
                "quantity": expenditure.quantity,
                "reason": expenditure.reason,
            },
        )

        return Response(
            ExpenditureSerializer(expenditure).data, status=status.HTTP_201_CREATED
        )


class OpeningBalanceView(APIView):

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminOrBaseCommander()]

        return [IsAuthenticated()]

    def get(self, request):

        queryset = OpeningBalance.objects.select_related(
            "base", "equipment_type", "created_by"
        )
        if request.user.role == "BASE_COMMANDER":

            queryset = queryset.filter(base=request.user.base)

        serializer = OpeningBalanceSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):

        serializer = OpeningBalanceSerializer(data=request.data)

        if not serializer.is_valid():

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        opening_balance = serializer.save(created_by=request.user)

        AuditLog.objects.create(
            user=request.user,
            action="OPENING_BALANCE_CREATED",
            details={
                "opening_balance_id": opening_balance.id,
                "base_id": opening_balance.base_id,
                "equipment_type_id": (opening_balance.equipment_type_id),
                "quantity": opening_balance.quantity,
            },
        )

        return Response(
            OpeningBalanceSerializer(opening_balance).data,
            status=status.HTTP_201_CREATED,
        )


class InventoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        bases = Base.objects.all()

        equipment_types = EquipmentType.objects.all()

        result = []

        for base in bases:

            if (
                request.user.role == "BASE_COMMANDER"
                and request.user.base_id != base.id
            ):
                continue

            for equipment_type in equipment_types:

                inventory = get_inventory_balance(
                    base,
                    equipment_type,
                )

                result.append(
                    {
                        "base_id": base.id,
                        "base_name": base.name,
                        "equipment_type_id": equipment_type.id,
                        "equipment_name": equipment_type.name,
                        "opening_balance": inventory["opening_balance"],
                        "purchases": inventory["purchases"],
                        "transfers_in": inventory["transfers_in"],
                        "transfers_out": inventory["transfers_out"],
                        "assignments": inventory["assignments"],
                        "expenditures": inventory["expenditures"],
                        "closing_balance": inventory["closing_balance"],
                    }
                )

        return Response(result, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == "ADMIN":

            total_bases = Base.objects.count()
            total_equipment_types = EquipmentType.objects.count()
            total_purchases = Purchase.objects.count()
            total_transfers = Transfer.objects.count()
            total_assignments = Assignment.objects.count()
            total_expenditures = Expenditure.objects.count()

        elif request.user.role == "BASE_COMMANDER":

            base = request.user.base

            total_bases = 1
            total_equipment_types = EquipmentType.objects.count()

            total_purchases = Purchase.objects.filter(base=base).count()

            total_transfers = Transfer.objects.filter(
                Q(source_base=base) | Q(destination_base=base)
            ).count()

            total_assignments = Assignment.objects.filter(base=base).count()

            total_expenditures = Expenditure.objects.filter(base=base).count()

        elif request.user.role == "LOGISTICS_OFFICER":

            total_bases = Base.objects.count()
            total_equipment_types = EquipmentType.objects.count()
            total_purchases = Purchase.objects.count()
            total_transfers = Transfer.objects.count()
            total_assignments = Assignment.objects.count()
            total_expenditures = Expenditure.objects.count()

        else:

            return Response({"error": "Invalid user role."}, status=403)

        return Response(
            {
                "total_bases": total_bases,
                "total_equipment_types": total_equipment_types,
                "total_purchases": total_purchases,
                "total_transfers": total_transfers,
                "total_assignments": total_assignments,
                "total_expenditures": total_expenditures,
            }
        )
