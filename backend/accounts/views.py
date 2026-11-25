from rest_framework import generics

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView
)

from .models import User

from .serializers import (
    RegisterSerializer,
    EmailTokenObtainPairSerializer,
)


# ============================================================
# REGISTER
# ============================================================

class RegisterView(
    generics.CreateAPIView
):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer


# ============================================================
# PROFILE
# ============================================================

class ProfileView(
    generics.RetrieveAPIView
):

    serializer_class = RegisterSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self):

        return self.request.user


# ============================================================
# EMAIL LOGIN
# ============================================================

class EmailLoginView(
    TokenObtainPairView
):

    serializer_class = (
        EmailTokenObtainPairSerializer
    )