from rest_framework import serializers

from .models import Guardian, GuardianUser
from accounts.models import User


# ============================================================
# GUARDIAN PROFILE SERIALIZER
# ============================================================

class GuardianSerializer(serializers.ModelSerializer):

    class Meta:
        model = Guardian
        fields = "__all__"


# ============================================================
# GUARDIAN ↔ PROTECTED USER SERIALIZER
# ============================================================

class GuardianUserSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="guardian.user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="guardian.user.email",
        read_only=True
    )

    phone = serializers.CharField(
        source="guardian.user.phone",
        read_only=True
    )

    name = serializers.SerializerMethodField()

    initials = serializers.SerializerMethodField()

    class Meta:
        model = GuardianUser

        fields = [
            "id",
            "guardian",
            "user",
            "name",
            "username",
            "email",
            "phone",
            "relationship",
            "priority",
            "initials",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "guardian",
            "user",
            "name",
            "username",
            "email",
            "phone",
            "initials",
            "created_at",
        ]

    def get_name(self, obj):

        full_name = obj.guardian.user.get_full_name()

        if full_name:
            return full_name

        return obj.guardian.user.username

    def get_initials(self, obj):

        name = self.get_name(obj)

        return "".join(
            word[0]
            for word in name.split()
        )[:2].upper()


# ============================================================
# REGISTER GUARDIAN
# ============================================================

class RegisterGuardianUserSerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=150
    )

    username = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    phone = serializers.CharField(
        max_length=15
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    relationship = serializers.CharField(
        max_length=50
    )

    priority = serializers.ChoiceField(
        choices=[
            ("Primary", "Primary"),
            ("Secondary", "Secondary"),
            ("Emergency", "Emergency"),
        ],
        default="Primary"
    )

    def validate_email(self, email):

        if User.objects.filter(
            email__iexact=email
        ).exists():

            raise serializers.ValidationError(
                "A SafeWithUs account already exists with this email."
            )

        return email

    def validate_username(self, username):

        if User.objects.filter(
            username__iexact=username
        ).exists():

            raise serializers.ValidationError(
                "This username is already taken."
            )

        return username


# ============================================================
# PROTECTED USER
# ============================================================

class ProtectedUserSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "name",
        ]

    def get_name(self, obj):

        full_name = obj.get_full_name()

        if full_name:
            return full_name

        return obj.username