from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import UserLocation
from .serializers import UserLocationSerializer

from geofence.models import Geofence
from geofence.utils import calculate_distance

from alerts.models import Alert

from notifications.notification_service import (
    create_notification
)

from guardian.models import GuardianUser


class UserLocationView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    # ========================================================
    # GET LOCATION
    # ========================================================

    def get(self, request):

        try:

            location = UserLocation.objects.get(
                user=request.user
            )


            serializer = UserLocationSerializer(
                location
            )


            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )


        except UserLocation.DoesNotExist:

            return Response(

                {
                    "message":
                        "Location not found"
                },

                status=status.HTTP_404_NOT_FOUND
            )


    # ========================================================
    # UPDATE LOCATION
    # ========================================================

    def put(self, request):

        latitude = request.data.get(
            "latitude"
        )

        longitude = request.data.get(
            "longitude"
        )


        if latitude is None or longitude is None:

            return Response(

                {
                    "error":
                        "Latitude and Longitude are required."
                },

                status=status.HTTP_400_BAD_REQUEST
            )


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
                    "error":
                        "Latitude and Longitude must be numbers."
                },

                status=status.HTTP_400_BAD_REQUEST
            )


        if latitude < -90 or latitude > 90:

            return Response(

                {
                    "error":
                        "Invalid latitude."
                },

                status=status.HTTP_400_BAD_REQUEST
            )


        if longitude < -180 or longitude > 180:

            return Response(

                {
                    "error":
                        "Invalid longitude."
                },

                status=status.HTTP_400_BAD_REQUEST
            )


        # ====================================================
        # SAVE LOCATION
        # ====================================================

        location, created = (
            UserLocation.objects.get_or_create(

                user=request.user,

                defaults={
                    "latitude": latitude,
                    "longitude": longitude,
                }
            )
        )


        if not created:

            location.latitude = latitude

            location.longitude = longitude

            location.save()


        serializer = UserLocationSerializer(
            location
        )


        # ====================================================
        # CHECK GEOFENCES
        # ====================================================

        geofences = Geofence.objects.filter(
            user=request.user
        )


        for fence in geofences:

            distance = calculate_distance(

                location.latitude,

                location.longitude,

                fence.latitude,

                fence.longitude

            )


            # ------------------------------------------------
            # USER IS OUTSIDE
            # ------------------------------------------------

            if distance > fence.radius:

                message = (
                    f"You left {fence.name}"
                )


                already_exists = (
                    Alert.objects.filter(

                        user=request.user,

                        geofence=fence,

                        message=message

                    ).exists()
                )


                if not already_exists:

                    # ----------------------------------------
                    # Create alert
                    # ----------------------------------------

                    Alert.objects.create(

                        user=request.user,

                        geofence=fence,

                        message=message,

                        latitude=location.latitude,

                        longitude=location.longitude
                    )


                    # ----------------------------------------
                    # Notify user
                    # ----------------------------------------

                    create_notification(

                        recipient=request.user,

                        title="⚠️ Safe Zone Exited",

                        message=(
                            f"You have left "
                            f"'{fence.name}'."
                        ),

                        notification_type="geofence",

                        priority="high"
                    )


                    # ----------------------------------------
                    # Notify guardians
                    # ----------------------------------------

                    guardian_users = (

                        GuardianUser.objects

                        .filter(
                            user=request.user
                        )

                        .select_related(
                            "guardian__user"
                        )
                    )


                    for guardian_user in guardian_users:

                        guardian = (
                            guardian_user
                            .guardian
                            .user
                        )


                        create_notification(

                            recipient=guardian,

                            title="⚠️ Safe Zone Exit",

                            message=(
                                f"{request.user.username} "
                                f"has left the safe zone "
                                f"'{fence.name}'."
                            ),

                            notification_type="geofence",

                            priority="high"
                        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(

            serializer.data,

            status=status.HTTP_200_OK
        )