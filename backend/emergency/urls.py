from django.urls import path

from .views import (
    EmergencyAPIView,
    EmergencyResolveAPIView,
    EmergencyCancelAPIView,
)


urlpatterns = [

    path(
        "",
        EmergencyAPIView.as_view(),
        name="emergency-list-create"
    ),

    path(
        "<int:pk>/resolve/",
        EmergencyResolveAPIView.as_view(),
        name="emergency-resolve"
    ),

    path(
        "<int:pk>/cancel/",
        EmergencyCancelAPIView.as_view(),
        name="emergency-cancel"
    ),

]