from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Emergency
from .serializers import EmergencySerializer

from guardian.models import GuardianUser

from notifications.notification_service import (
    create_notification
)


# ============================================================
# NOTIFY GUARDIANS
# ============================================================

def notify_emergency_guardians(
    emergency,
    title,
    message,
    priority="high"
):

    guardian_users = GuardianUser.objects.filter(
        user=emergency.user
    ).select_related(
        "guardian__user"
    )

    for guardian_user in guardian_users:

        guardian = guardian_user.guardian.user

        create_notification(
            recipient=guardian,
            title=title,
            message=message,
            notification_type="emergency",
            priority=priority
        )


# ============================================================
# EMERGENCY LIST / CREATE
# ============================================================

class EmergencyAPIView(APIView):

    permission_classes = [IsAuthenticated]

    # --------------------------------------------------------
    # GET /api/emergency/
    # --------------------------------------------------------

    def get(self, request):

        emergencies = Emergency.objects.filter(
            user=request.user
        )

        serializer = EmergencySerializer(
            emergencies,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # POST /api/emergency/
    # --------------------------------------------------------

    def post(self, request):

        print("EMERGENCY REQUEST DATA:")
        print(request.data)

        serializer = EmergencySerializer(
            data=request.data
        )

        if not serializer.is_valid():

            print("EMERGENCY VALIDATION ERROR:")
            print(serializer.errors)

            return Response(
                {
                    "success": False,
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CREATE EMERGENCY
        # ----------------------------------------------------

        emergency = serializer.save(
            user=request.user
        )

        # ----------------------------------------------------
        # NOTIFY USER
        # ----------------------------------------------------

        create_notification(
            recipient=request.user,
            title="Emergency Alert",
            message=(
                "Your emergency alert has been "
                "triggered successfully."
            ),
            notification_type="emergency",
            priority="critical"
        )

        # ----------------------------------------------------
        # FIND USER'S GUARDIANS
        # ----------------------------------------------------

        guardian_users = GuardianUser.objects.filter(
            user=request.user
        ).select_related(
            "guardian__user"
        )

        # ----------------------------------------------------
        # NOTIFY EACH GUARDIAN
        # ----------------------------------------------------

        for guardian_user in guardian_users:

            guardian = guardian_user.guardian.user

            location = ""

            if (
                emergency.latitude is not None
                and emergency.longitude is not None
            ):

                location = (
                    f" Location: "
                    f"{emergency.latitude}, "
                    f"{emergency.longitude}"
                )

            message = (
                f"{request.user.username} "
                f"has triggered an emergency alert. "
                f"Type: "
                f"{emergency.get_emergency_type_display()}. "
                f"{emergency.message or ''}"
                f"{location}"
            )

            create_notification(
                recipient=guardian,
                title="🚨 Emergency Alert",
                message=message,
                notification_type="emergency",
                priority="critical"
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            EmergencySerializer(
                emergency
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# RESOLVE EMERGENCY
# ============================================================

class EmergencyResolveAPIView(APIView):

    permission_classes = [IsAuthenticated]

    # --------------------------------------------------------
    # PATCH /api/emergency/<id>/resolve/
    # --------------------------------------------------------

    def patch(self, request, pk):

        try:

            emergency = Emergency.objects.get(
                id=pk,
                user=request.user
            )

        except Emergency.DoesNotExist:

            return Response(
                {
                    "message": "Emergency not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK STATUS
        # ----------------------------------------------------

        if emergency.status != "active":

            return Response(
                {
                    "message": (
                        "Emergency is already resolved "
                        "or cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # RESOLVE
        # ----------------------------------------------------

        emergency.status = "resolved"
        emergency.resolved_at = timezone.now()
        emergency.save()

        # ----------------------------------------------------
        # NOTIFY USER
        # ----------------------------------------------------

        create_notification(
            recipient=request.user,
            title="Emergency Resolved",
            message=(
                "Your emergency has been "
                "marked as resolved."
            ),
            notification_type="emergency",
            priority="medium"
        )

        # ----------------------------------------------------
        # NOTIFY GUARDIANS
        # ----------------------------------------------------

        notify_emergency_guardians(
            emergency=emergency,
            title="Emergency Resolved",
            message=(
                f"{request.user.username}'s "
                f"emergency has been resolved."
            ),
            priority="medium"
        )

        return Response(
            EmergencySerializer(
                emergency
            ).data,
            status=status.HTTP_200_OK
        )


# ============================================================
# CANCEL EMERGENCY
# ============================================================

class EmergencyCancelAPIView(APIView):

    permission_classes = [IsAuthenticated]

    # --------------------------------------------------------
    # PATCH /api/emergency/<id>/cancel/
    # --------------------------------------------------------

    def patch(self, request, pk):

        try:

            emergency = Emergency.objects.get(
                id=pk,
                user=request.user
            )

        except Emergency.DoesNotExist:

            return Response(
                {
                    "message": "Emergency not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK STATUS
        # ----------------------------------------------------

        if emergency.status != "active":

            return Response(
                {
                    "message": (
                        "Emergency is already resolved "
                        "or cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CANCEL
        # ----------------------------------------------------

        emergency.status = "cancelled"
        emergency.resolved_at = timezone.now()
        emergency.save()

        # ----------------------------------------------------
        # NOTIFY USER
        # ----------------------------------------------------

        create_notification(
            recipient=request.user,
            title="Emergency Cancelled",
            message=(
                "Your emergency has been "
                "cancelled."
            ),
            notification_type="emergency",
            priority="medium"
        )

        # ----------------------------------------------------
        # NOTIFY GUARDIANS
        # ----------------------------------------------------

        notify_emergency_guardians(
            emergency=emergency,
            title="Emergency Cancelled",
            message=(
                f"{request.user.username}'s "
                f"emergency has been cancelled."
            ),
            priority="medium"
        )

        return Response(
            EmergencySerializer(
                emergency
            ).data,
            status=status.HTTP_200_OK
        )