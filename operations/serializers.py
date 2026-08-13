from rest_framework import serializers

from .models import Purchase, Transfer, Assignment, Expenditure, OpeningBalance


class PurchaseSerializer(serializers.ModelSerializer):
    equipment_type_name = serializers.CharField( source="equipment_type.name", read_only=True )
    class Meta:
        model = Purchase
        fields = [
            "id",
            "base",
            "equipment_type",
            "equipment_type_name",
            "quantity",
            "date",
            "created_by",
        ]

        read_only_fields = [
            "id",
            "date",
            "created_by",
        ]

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


class TransferSerializer(serializers.ModelSerializer):
    equipment_type_name = serializers.CharField( source="equipment_type.name", read_only=True )

    class Meta:
        model = Transfer
        fields = [
            "id",
            "source_base",
            "destination_base",
            "equipment_type",
            "equipment_type_name",
            "quantity",
            "status",
            "timestamp",
            "initiated_by",
        ]

        read_only_fields = [
            "id",
            "status",
            "timestamp",
            "initiated_by",
        ]

    def validate(self, attrs):
        if attrs["source_base"] == attrs["destination_base"]:
            raise serializers.ValidationError(
                "Source and destination bases cannot be the same."
            )

        if attrs["quantity"] <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")

        return attrs


class AssignmentSerializer(serializers.ModelSerializer):
    equipment_type_name = serializers.CharField( source="equipment_type.name", read_only=True )

    class Meta:
        model = Assignment

        fields = [
            "id",
            "base",
            "equipment_type",
            "equipment_type_name",
            "quantity",
            "assigned_to",
            "assigned_on",
        ]

        read_only_fields = [
            "id",
            "assigned_on",
        ]

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")

        return value


class ExpenditureSerializer(serializers.ModelSerializer):
    equipment_type_name = serializers.CharField( source="equipment_type.name", read_only=True )

    class Meta:
        model = Expenditure

        fields = [
            "id",
            "base",
            "equipment_type",
            "equipment_type_name",
            "quantity",
            "reason",
            "expended_on",
        ]

        read_only_fields = [
            "id",
            "expended_on",
        ]

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")

        return value


class OpeningBalanceSerializer(serializers.ModelSerializer):
    
    equipment_type_name = serializers.CharField(
    source="equipment_type.name",
    read_only=True
    )
    


    class Meta:
        model = OpeningBalance

        fields = [
            "id",
            "base",
            "equipment_type",
            "equipment_type_name",
            "quantity",
            "created_by",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "equipment_type_name",
            "created_at",
        ]

    def validate_quantity(self, value):

        if value < 0:
            raise serializers.ValidationError("Opening balance cannot be negative.")

        return value
