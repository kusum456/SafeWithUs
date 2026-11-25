from rest_framework import serializers

from .models import Geofence


class GeofenceSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Geofence

        fields = [
            "id",
            "user",
            "name",
            "latitude",
            "longitude",
            "radius",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]


    def validate_latitude(self, value):

        if value < -90 or value > 90:

            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )

        return value


    def validate_longitude(self, value):

        if value < -180 or value > 180:

            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )

        return value


    def validate_radius(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Radius must be greater than 0 meters."
            )

        if value > 100000:

            raise serializers.ValidationError(
                "Radius cannot exceed 100000 meters."
            )

        return value