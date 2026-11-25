from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User

from guardian.models import (
    Guardian,
    GuardianUser,
)

from emergency.models import Emergency

from alerts.models import Alert

from .permissions import IsAdminUserRole

from .serializers import (
    AdminUserSerializer,
    AdminGuardianSerializer,
    AdminGuardianUserSerializer,
    AdminEmergencySerializer,
    AdminAlertSerializer,
)


# ============================================================
# ADMIN DASHBOARD
# ============================================================

class AdminDashboardView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    def get(self, request):

        total_users = User.objects.filter(
            role="user"
        ).count()

        total_guardians = User.objects.filter(
            role="guardian"
        ).count()

        total_accounts = User.objects.count()

        total_guardian_profiles = (
            Guardian.objects.count()
        )

        total_relationships = (
            GuardianUser.objects.count()
        )

        total_emergencies = (
            Emergency.objects.count()
        )

        active_emergencies = (
            Emergency.objects.filter(
                status="active"
            ).count()
        )

        resolved_emergencies = (
            Emergency.objects.filter(
                status="resolved"
            ).count()
        )

        cancelled_emergencies = (
            Emergency.objects.filter(
                status="cancelled"
            ).count()
        )

        total_alerts = (
            Alert.objects.count()
        )

        return Response(
            {
                "total_users":
                    total_users,

                "total_guardians":
                    total_guardians,

                "total_accounts":
                    total_accounts,

                "total_guardian_profiles":
                    total_guardian_profiles,

                "total_relationships":
                    total_relationships,

                "total_emergencies":
                    total_emergencies,

                "active_emergencies":
                    active_emergencies,

                "resolved_emergencies":
                    resolved_emergencies,

                "cancelled_emergencies":
                    cancelled_emergencies,

                "total_alerts":
                    total_alerts,
            },

            status=status.HTTP_200_OK
        )


# ============================================================
# ALL USERS
# ============================================================

class AdminUserListView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    serializer_class = AdminUserSerializer

    def get_queryset(self):

        return User.objects.all().order_by(
            "-id"
        )


# ============================================================
# ALL GUARDIANS
# ============================================================

class AdminGuardianListView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    serializer_class = AdminGuardianSerializer

    def get_queryset(self):

        return (
            Guardian.objects
            .select_related(
                "user"
            )
            .order_by(
                "-id"
            )
        )


# ============================================================
# ALL TRUSTED CONTACT RELATIONSHIPS
# ============================================================

class AdminTrustedContactListView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    serializer_class = (
        AdminGuardianUserSerializer
    )

    def get_queryset(self):

        return (
            GuardianUser.objects
            .select_related(
                "guardian__user",
                "user"
            )
            .order_by(
                "-id"
            )
        )


# ============================================================
# ALL EMERGENCIES
# ============================================================

class AdminEmergencyListView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    serializer_class = (
        AdminEmergencySerializer
    )

    def get_queryset(self):

        return (
            Emergency.objects
            .select_related(
                "user"
            )
            .order_by(
                "-created_at"
            )
        )


# ============================================================
# ALL ALERTS
# ============================================================

class AdminAlertListView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    serializer_class = (
        AdminAlertSerializer
    )

    def get_queryset(self):

        return (
            Alert.objects
            .select_related(
                "user",
                "geofence"
            )
            .order_by(
                "-created_at"
            )
        )