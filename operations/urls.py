from django.urls import path

from .views import PurchaseView,TransferView,AssignmentView,ExpenditureView,InventoryView,DashboardSummaryView,OpeningBalanceView


urlpatterns = [
    path(
        "purchases/",
        PurchaseView.as_view(),
        name="purchase-create"
    ),
      path(
        "transfers/",
        TransferView.as_view(),
        name="transfer-create"
    ),
      path(
        "assignments/",
        AssignmentView.as_view(),
        name="assignments"
    ),
        path(
        "expenditures/",
        ExpenditureView.as_view(),
        name="expenditures"
    ),
         path(
        "inventory/",
        InventoryView.as_view(),
        name="inventory"
    ),
    path(
    "opening-balances/",
    OpeningBalanceView.as_view(),
    name="opening-balances"
),
    path(
        "dashboard/summary/",
        DashboardSummaryView.as_view(),
        name="dashboard-summary"
    ),
]