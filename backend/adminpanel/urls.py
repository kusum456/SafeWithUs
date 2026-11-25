from django.urls import path

from .views import (
    AdminDashboardView,
    AdminUserListView,
    AdminGuardianListView,
    AdminTrustedContactListView,
    AdminEmergencyListView,
    AdminAlertListView,
)


urlpatterns = [

    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard"
    ),

    path(
        "users/",
        AdminUserListView.as_view(),
        name="admin-users"
    ),

    path(
        "guardians/",
        AdminGuardianListView.as_view(),
        name="admin-guardians"
    ),

    path(
        "trusted-contacts/",
        AdminTrustedContactListView.as_view(),
        name="admin-trusted-contacts"
    ),

    path(
        "emergencies/",
        AdminEmergencyListView.as_view(),
        name="admin-emergencies"
    ),

    path(
        "alerts/",
        AdminAlertListView.as_view(),
        name="admin-alerts"
    ),

]