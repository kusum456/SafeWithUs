from rest_framework import serializers

from accounts.models import User
from guardian.models import Guardian, GuardianUser
from emergency.models import Emergency
from alerts.models import Alert

try:
    from location.models import UserLocation
except ImportError:
    UserLocation = None


# ============================================================
# USER
# ============================================================

class AdminUserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
        ]


# ============================================================
# GUARDIAN
# ============================================================

class AdminGuardianSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    phone = serializers.CharField(
        source="user.phone",
        read_only=True
    )

    class Meta:

        model = Guardian

        fields = [
            "id",
            "user",
            "username",
            "email",
            "phone",
            "created_at",
        ]


# ============================================================
# GUARDIAN RELATIONSHIP
# ============================================================

class AdminGuardianUserSerializer(
    serializers.ModelSerializer
):

    guardian_username = serializers.CharField(
        source="guardian.user.username",
        read_only=True
    )

    user_username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:

        model = GuardianUser

        fields = [
            "id",
            "guardian",
            "guardian_username",
            "user",
            "user_username",
            "relationship",
            "priority",
            "created_at",
        ]


# ============================================================
# EMERGENCY
# ============================================================

class AdminEmergencySerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:

        model = Emergency

        fields = [
            "id",
            "user",
            "username",
            "emergency_type",
            "message",
            "latitude",
            "longitude",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]


# ============================================================
# ALERT
# ============================================================

class AdminAlertSerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    geofence_name = serializers.CharField(
        source="geofence.name",
        read_only=True
    )

    class Meta:

        model = Alert

        fields = [
            "id",
            "user",
            "username",
            "geofence",
            "geofence_name",
            "message",
            "latitude",
            "longitude",
            "created_at",
        ]