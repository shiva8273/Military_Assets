from django.urls import path
from .views import AuditLogView

urlpatterns = [
      path(
        "auditlogs/",
        AuditLogView.as_view(),
        name="audit-logs"
    ),
]
