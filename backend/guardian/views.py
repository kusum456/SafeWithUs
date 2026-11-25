from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from accounts.models import User

from alerts.models import Alert
from alerts.serializers import AlertSerializer

from .models import Guardian, GuardianUser

from .serializers import (
    GuardianSerializer,
    GuardianUserSerializer,
    RegisterGuardianUserSerializer,
)


# ============================================================
# GUARDIAN PROFILE
# ============================================================

class GuardianProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = GuardianSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self):

        guardian, created = Guardian.objects.get_or_create(
            user=self.request.user
        )

        return guardian


# ============================================================
# USER → TRUSTED CONTACTS
# ============================================================
#
# GET:
# /api/guardian/users/
#
# IMPORTANT:
# user = logged-in USER
# guardian = trusted contact
#
# Example:
#
# Bunny (user)
#     ↓
# GuardianUser
#     ↓
# Demo (guardian)
#
# ============================================================

class GuardianUserListCreateView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = GuardianUserSerializer

    def get_queryset(self):

        return GuardianUser.objects.filter(

            # IMPORTANT FIX
            user=self.request.user

        ).select_related(

            "guardian",
            "guardian__user",
            "user"

        ).order_by(

            "priority",
            "created_at"

        )


# ============================================================
# REGISTER TRUSTED CONTACT
# ============================================================
#
# POST:
# /api/guardian/users/register/
#
# ============================================================

class RegisterGuardianUserView(
    generics.CreateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        RegisterGuardianUserSerializer
    )

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data


        # ====================================================
        # CREATE GUARDIAN ACCOUNT
        # ====================================================

        guardian_user_account = (
            User.objects.create_user(

                username=data["username"],

                email=data["email"],

                phone=data["phone"],

                password=data["password"],

                first_name=data["name"],

                role="guardian"

            )
        )


        # ====================================================
        # CREATE GUARDIAN PROFILE
        # ====================================================

        guardian = Guardian.objects.create(

            user=guardian_user_account

        )


        # ====================================================
        # CONNECT LOGGED-IN USER TO GUARDIAN
        # ====================================================

        guardian_user = (
            GuardianUser.objects.create(

                guardian=guardian,

                # IMPORTANT:
                # logged-in user is the protected user
                user=request.user,

                relationship=data[
                    "relationship"
                ],

                priority=data[
                    "priority"
                ]

            )
        )


        # ====================================================
        # RETURN CREATED CONTACT
        # ====================================================

        response_serializer = (
            GuardianUserSerializer(
                guardian_user
            )
        )


        return Response(

            response_serializer.data,

            status=status.HTTP_201_CREATED

        )


# ============================================================
# DELETE TRUSTED CONTACT
# ============================================================
#
# DELETE:
# /api/guardian/users/<id>/
#
# ============================================================

class GuardianUserDeleteView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = GuardianUserSerializer

    def get_queryset(self):

        return GuardianUser.objects.filter(

            # IMPORTANT FIX
            user=self.request.user

        ).select_related(

            "guardian",
            "guardian__user",
            "user"

        )

    def perform_destroy(
        self,
        instance
    ):

        instance.delete()


# ============================================================
# PROTECTED USERS
# ============================================================
#
# Guardian dashboard:
#
# GET:
# /api/guardian/protected-users/
#
# Here the logged-in account IS the guardian.
#
# ============================================================

class ProtectedUsersView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        *args,
        **kwargs
    ):

        guardian_users = (
            GuardianUser.objects.filter(

                # Here we WANT guardian
                guardian__user=request.user

            ).select_related(

                "user",
                "guardian",
                "guardian__user"

            )
        )

        data = []


        for guardian_user in guardian_users:

            protected_user = (
                guardian_user.user
            )


            # =================================================
            # DISPLAY NAME
            # =================================================

            full_name = (
                protected_user.get_full_name()
            )

            if full_name:

                name = full_name

            else:

                name = (
                    protected_user.username
                )


            # =================================================
            # INITIALS
            # =================================================

            initials = "".join(

                word[0]

                for word in name.split()

                if word

            )[:2].upper()


            # =================================================
            # RESPONSE
            # =================================================

            data.append({

                "id":
                    protected_user.id,

                "user":
                    protected_user.id,

                "user_id":
                    protected_user.id,

                "username":
                    protected_user.username,

                "user_name":
                    name,

                "name":
                    name,

                "email":
                    protected_user.email,

                "phone":
                    protected_user.phone,

                "relationship":
                    guardian_user.relationship,

                "priority":
                    guardian_user.priority,

                "initials":
                    initials,

                "guardian_user_id":
                    guardian_user.id,

            })


        return Response(

            data,

            status=status.HTTP_200_OK

        )


# ============================================================
# PROTECTED USER ALERTS
# ============================================================
#
# GET:
# /api/guardian/protected-users/<user_id>/alerts/
#
# ============================================================

class ProtectedUserAlertsView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = AlertSerializer

    def get_queryset(self):

        user_id = self.kwargs[
            "user_id"
        ]


        # ====================================================
        # CHECK GUARDIAN AUTHORIZATION
        # ====================================================

        guardian_user = (

            GuardianUser.objects.filter(

                guardian__user=self.request.user,

                user_id=user_id

            )

            .select_related(

                "guardian__user",
                "user"

            )

            .first()

        )


        if guardian_user is None:

            raise PermissionDenied(

                "You are not authorized to view this user's alerts."

            )


        # ====================================================
        # RETURN ALERTS
        # ====================================================

        return (

            Alert.objects.filter(

                user=guardian_user.user

            )

            .select_related(

                "user",
                "geofence"

            )

            .order_by(

                "-created_at"

            )

        )


# ============================================================
# PROTECTED USER LOCATION
# ============================================================
#
# GET:
# /api/guardian/protected-users/<user_id>/location/
#
# ============================================================

class ProtectedUserLocationView(
    generics.RetrieveAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        *args,
        **kwargs
    ):

        user_id = kwargs[
            "user_id"
        ]


        # ====================================================
        # CHECK GUARDIAN AUTHORIZATION
        # ====================================================

        guardian_user = (

            GuardianUser.objects.filter(

                guardian__user=request.user,

                user_id=user_id

            )

            .select_related(
                "user"
            )

            .first()

        )


        if guardian_user is None:

            raise PermissionDenied(

                "You are not authorized to view this user's location."

            )


        protected_user = (
            guardian_user.user
        )


        # ====================================================
        # GET USER LOCATION
        # ====================================================

        try:

            location = (
                protected_user.userlocation
            )

        except Exception:

            return Response(

                {
                    "message":
                        "No location has been shared by this user yet.",

                    "location_available":
                        False
                },

                status=status.HTTP_404_NOT_FOUND

            )


        # ====================================================
        # RETURN LOCATION
        # ====================================================

        return Response(

            {

                "id":
                    location.id,

                "user":
                    protected_user.id,

                "username":
                    protected_user.username,

                "latitude":
                    float(location.latitude),

                "longitude":
                    float(location.longitude),

                "updated_at":
                    location.updated_at,

                "location_available":
                    True

            },

            status=status.HTTP_200_OK

        )


# ============================================================
# PROTECTED USER EMERGENCIES
# ============================================================
#
# GET:
# /api/guardian/protected-users/<user_id>/emergencies/
#
# ============================================================

class ProtectedUserEmergenciesView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        *args,
        **kwargs
    ):

        user_id = kwargs[
            "user_id"
        ]


        # ====================================================
        # CHECK GUARDIAN AUTHORIZATION
        # ====================================================

        guardian_user = (

            GuardianUser.objects.filter(

                guardian__user=request.user,

                user_id=user_id

            )

            .select_related(
                "user"
            )

            .first()

        )


        if guardian_user is None:

            raise PermissionDenied(

                "You are not authorized to view this user's emergencies."

            )


        protected_user = (
            guardian_user.user
        )


        # ====================================================
        # GET EMERGENCIES
        # ====================================================

        emergencies = (

            protected_user.emergencies

            .all()

            .order_by(
                "-created_at"
            )

        )


        data = []


        for emergency in emergencies:

            data.append({

                "id":
                    emergency.id,

                "user":
                    protected_user.id,

                "username":
                    protected_user.username,

                "emergency_type":
                    emergency.emergency_type,

                "message":
                    emergency.message,

                "latitude":

                    (
                        float(
                            emergency.latitude
                        )

                        if emergency.latitude is not None

                        else None
                    ),

                "longitude":

                    (
                        float(
                            emergency.longitude
                        )

                        if emergency.longitude is not None

                        else None
                    ),

                "status":
                    emergency.status,

                "created_at":
                    emergency.created_at,

                "updated_at":
                    emergency.updated_at,

                "resolved_at":
                    emergency.resolved_at,

            })


        return Response(

            data,

            status=status.HTTP_200_OK

        )


# ============================================================
# PROTECTED USER TRUSTED CONTACTS
# ============================================================
#
# GET:
# /api/guardian/protected-users/<user_id>/trusted-contacts/
#
# This is for a GUARDIAN viewing another user's contacts.
#
# ============================================================

class ProtectedUserTrustedContactsView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        user_id = kwargs[
            "user_id"
        ]


        # ====================================================
        # CHECK AUTHORIZATION
        # ====================================================

        current_relationship = (

            GuardianUser.objects.filter(

                guardian__user=request.user,

                user_id=user_id

            )

            .select_related(

                "guardian__user",
                "user"

            )

            .first()

        )


        if current_relationship is None:

            raise PermissionDenied(

                "You are not authorized to view this user's trusted contacts."

            )


        # ====================================================
        # GET OTHER TRUSTED GUARDIANS
        # ====================================================

        trusted_contacts = (

            GuardianUser.objects.filter(

                user_id=user_id

            )

            .exclude(

                guardian__user=request.user

            )

            .select_related(

                "guardian",
                "guardian__user",
                "user"

            )

            .order_by(

                "priority",
                "created_at"

            )

        )


        data = []


        for guardian_user in trusted_contacts:

            guardian = (
                guardian_user.guardian.user
            )


            # =================================================
            # NAME
            # =================================================

            full_name = (
                guardian.get_full_name()
            )

            if full_name:

                name = full_name

            else:

                name = guardian.username


            # =================================================
            # INITIALS
            # =================================================

            initials = "".join(

                word[0]

                for word in name.split()

                if word

            )[:2].upper()


            # =================================================
            # RESPONSE
            # =================================================

            data.append({

                "id":
                    guardian_user.id,

                "user":
                    guardian.id,

                "guardian_id":
                    guardian.id,

                "name":
                    name,

                "username":
                    guardian.username,

                "email":
                    guardian.email,

                "phone":
                    guardian.phone,

                "relationship":
                    guardian_user.relationship,

                "priority":
                    guardian_user.priority,

                "initials":
                    initials,

                "is_current_guardian":
                    False,

                "created_at":
                    guardian_user.created_at,

            })


        return Response(

            data,

            status=status.HTTP_200_OK

        )