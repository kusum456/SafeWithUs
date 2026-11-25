from django.urls import path

from .views import (
    GuardianProfileView,
    GuardianUserListCreateView,
    RegisterGuardianUserView,
    GuardianUserDeleteView,

    ProtectedUsersView,
    ProtectedUserAlertsView,
    ProtectedUserLocationView,
    ProtectedUserEmergenciesView,
    ProtectedUserTrustedContactsView,
)


urlpatterns = [

    # ========================================================
    # GUARDIAN PROFILE
    # ========================================================

    path(
        "profile/",
        GuardianProfileView.as_view(),
        name="guardian-profile"
    ),


    # ========================================================
    # GUARDIAN USERS
    # ========================================================

    path(
        "users/",
        GuardianUserListCreateView.as_view(),
        name="guardian-users"
    ),


    # ========================================================
    # REGISTER GUARDIAN
    # ========================================================

    path(
        "users/register/",
        RegisterGuardianUserView.as_view(),
        name="register-guardian-user"
    ),


    # ========================================================
    # DELETE GUARDIAN RELATIONSHIP
    # ========================================================

    path(
        "users/<int:pk>/",
        GuardianUserDeleteView.as_view(),
        name="delete-guardian-user"
    ),


    # ========================================================
    # PROTECTED USERS
    # ========================================================

    path(
        "protected-users/",
        ProtectedUsersView.as_view(),
        name="protected-users"
    ),


    # ========================================================
    # PROTECTED USER ALERTS
    # ========================================================

    path(
        "protected-users/<int:user_id>/alerts/",
        ProtectedUserAlertsView.as_view(),
        name="protected-user-alerts"
    ),


    # ========================================================
    # PROTECTED USER LOCATION
    # ========================================================

    path(
        "protected-users/<int:user_id>/location/",
        ProtectedUserLocationView.as_view(),
        name="protected-user-location"
    ),


    # ========================================================
    # PROTECTED USER EMERGENCIES
    # ========================================================

    path(
        "protected-users/<int:user_id>/emergencies/",
        ProtectedUserEmergenciesView.as_view(),
        name="protected-user-emergencies"
    ),


    # ========================================================
    # PROTECTED USER TRUSTED CONTACTS
    # ========================================================

    path(
        "protected-users/<int:user_id>/trusted-contacts/",
        ProtectedUserTrustedContactsView.as_view(),
        name="protected-user-trusted-contacts"
    ),

]