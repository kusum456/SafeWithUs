from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from .models import Geofence
from .serializers import GeofenceSerializer

from guardian.models import GuardianUser

from notifications.notification_service import (
    create_notification
)

from alerts.models import Alert


# ============================================================
# LIST / CREATE SAFETY ZONES
# ============================================================

class GeofenceListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = GeofenceSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Geofence.objects.filter(
            user=self.request.user
        ).order_by(
            "-created_at"
        )

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            user=self.request.user
        )


# ============================================================
# UPDATE / DELETE SAFETY ZONE
# ============================================================

class GeofenceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = GeofenceSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Geofence.objects.filter(
            user=self.request.user
        )


# ============================================================
# GEOFENCE EVENT
# ============================================================
#
# POST:
#
# /api/geofence/<id>/event/
#
# Body:
#
# {
#     "event": "entered",
#     "latitude": 20.2961,
#     "longitude": 85.8245
# }
#
# OR
#
# {
#     "event": "exited",
#     "latitude": 20.2961,
#     "longitude": 85.8245
# }
#
# ============================================================

class GeofenceEventView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        pk
    ):

        # ====================================================
        # FIND GEOFENCE
        # ====================================================

        try:

            geofence = Geofence.objects.get(
                id=pk,
                user=request.user
            )

        except Geofence.DoesNotExist:

            return Response(

                {
                    "success": False,

                    "message":
                        "Geofence not found."
                },

                status=status.HTTP_404_NOT_FOUND

            )


        # ====================================================
        # GET EVENT
        # ====================================================

        event_type = request.data.get(
            "event"
        )


        if event_type not in [
            "entered",
            "exited"
        ]:

            return Response(

                {
                    "success": False,

                    "message":
                        "Event must be 'entered' or 'exited'."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ====================================================
        # GET LOCATION
        # ====================================================

        latitude = request.data.get(
            "latitude"
        )

        longitude = request.data.get(
            "longitude"
        )


        # ====================================================
        # VALIDATE LOCATION
        # ====================================================

        if latitude is None:

            return Response(

                {
                    "success": False,

                    "message":
                        "Latitude is required."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        if longitude is None:

            return Response(

                {
                    "success": False,

                    "message":
                        "Longitude is required."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ====================================================
        # CONVERT LOCATION
        # ====================================================

        try:

            latitude = float(
                latitude
            )

            longitude = float(
                longitude
            )

        except (
            TypeError,
            ValueError
        ):

            return Response(

                {
                    "success": False,

                    "message":
                        "Latitude and longitude must be valid numbers."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ====================================================
        # VALIDATE LATITUDE
        # ====================================================

        if not (
            -90 <= latitude <= 90
        ):

            return Response(

                {
                    "success": False,

                    "message":
                        "Latitude must be between -90 and 90."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ====================================================
        # VALIDATE LONGITUDE
        # ====================================================

        if not (
            -180 <= longitude <= 180
        ):

            return Response(

                {
                    "success": False,

                    "message":
                        "Longitude must be between -180 and 180."
                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ====================================================
        # ENTERED EVENT
        # ====================================================

        if event_type == "entered":

            title = (
                "📍 Safe Zone Entered"
            )

            message = (
                f"You have entered your safe zone "
                f"'{geofence.name}'."
            )

            priority = "low"


            alert_message = (
                f"You entered the safe zone "
                f"'{geofence.name}'."
            )


        # ====================================================
        # EXITED EVENT
        # ====================================================

        else:

            title = (
                "⚠️ Safe Zone Exited"
            )

            message = (
                f"You have left your safe zone "
                f"'{geofence.name}'."
            )

            priority = "high"


            alert_message = (
                f"You left the safe zone "
                f"'{geofence.name}'."
            )


        # ====================================================
        # CREATE ALERT
        # ====================================================
        #
        # THIS WAS MISSING FROM YOUR ORIGINAL CODE.
        #
        # ====================================================

        alert = Alert.objects.create(

            user=request.user,

            geofence=geofence,

            message=alert_message,

            latitude=latitude,

            longitude=longitude

        )


        # ====================================================
        # NOTIFY CURRENT USER
        # ====================================================

        create_notification(

            recipient=request.user,

            title=title,

            message=message,

            notification_type="geofence",

            priority=priority

        )


        # ====================================================
        # GET TRUSTED GUARDIANS
        # ====================================================

        guardian_users = (

            GuardianUser.objects

            .filter(
                user=request.user
            )

            .select_related(
                "guardian__user"
            )

        )


        # ====================================================
        # NOTIFY GUARDIANS ONLY ON EXIT
        # ====================================================

        if event_type == "exited":

            guardian_message = (

                f"{request.user.username} has left "

                f"the safe zone "

                f"'{geofence.name}'. "

                f"Location: "

                f"{latitude}, "

                f"{longitude}"

            )


            for guardian_user in guardian_users:

                guardian = (
                    guardian_user.guardian.user
                )


                create_notification(

                    recipient=guardian,

                    title="⚠️ Safe Zone Exit",

                    message=guardian_message,

                    notification_type="geofence",

                    priority="high"

                )


        # ====================================================
        # RETURN RESPONSE
        # ====================================================

        return Response(

            {

                "success":
                    True,

                "event":
                    event_type,

                "geofence":
                    geofence.name,

                "message":
                    message,

                "alert": {

                    "id":
                        alert.id,

                    "message":
                        alert.message,

                    "latitude":
                        alert.latitude,

                    "longitude":
                        alert.longitude,

                    "created_at":
                        alert.created_at

                }

            },

            status=status.HTTP_200_OK

        )