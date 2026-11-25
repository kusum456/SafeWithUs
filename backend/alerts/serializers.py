from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):

    class Meta:

        model = Alert

        fields = [
            "id",
            "user",
            "geofence",
            "message",
            "latitude",
            "longitude",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "geofence",
            "message",
            "latitude",
            "longitude",
            "created_at",
        ]