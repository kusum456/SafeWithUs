from rest_framework import serializers

from .models import Emergency


class EmergencySerializer(serializers.ModelSerializer):

    class Meta:
        model = Emergency

        fields = [
            "id",
            "emergency_type",
            "message",
            "latitude",
            "longitude",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

    def validate_emergency_type(self, value):

        value = value.lower().strip()

        valid_types = [
            "sos",
            "medical",
            "fire",
            "accident",
            "police",
            "other",
        ]

        if value not in valid_types:

            raise serializers.ValidationError(
                "Invalid emergency type. Use: sos, medical, fire, accident, police, or other."
            )

        return value

    def validate_latitude(self, value):

        if value is None:
            return value

        if not (-90 <= value <= 90):

            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )

        return round(value, 7)

    def validate_longitude(self, value):

        if value is None:
            return value

        if not (-180 <= value <= 180):

            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )

        return round(value, 7)