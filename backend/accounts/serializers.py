from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


# ============================================================
# REGISTER
# ============================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "phone",
            "password",
            "role",
        ]

        read_only_fields = [
            "role",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            phone=validated_data.get("phone", ""),
            password=validated_data["password"],
            role="user",
        )

        return user


# ============================================================
# EMAIL LOGIN
# ============================================================

class EmailTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    def validate(self, attrs):

        email = attrs.get("email")

        if not email:

            raise serializers.ValidationError(
                {
                    "email":
                    "Email is required."
                }
            )

        email = email.strip().lower()

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email":
                    "No account found with this email."
                }
            )

        # ----------------------------------------------------
        # CHECK PASSWORD
        # ----------------------------------------------------

        password = attrs.get("password")

        if not user.check_password(password):

            raise serializers.ValidationError(
                {
                    "password":
                    "Incorrect password."
                }
            )

        # ----------------------------------------------------
        # CHECK ACTIVE ACCOUNT
        # ----------------------------------------------------

        if not user.is_active:

            raise serializers.ValidationError(
                {
                    "detail":
                    "This account is inactive."
                }
            )

        # ----------------------------------------------------
        # CREATE JWT
        # ----------------------------------------------------

        refresh = self.get_token(user)

        return {
            "refresh":
                str(refresh),

            "access":
                str(refresh.access_token),

            "user": {
                "id":
                    user.id,

                "username":
                    user.username,

                "email":
                    user.email,

                "role":
                    user.role,
            }
        }