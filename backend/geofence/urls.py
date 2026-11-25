from django.urls import path

from .views import (
    GeofenceListCreateView,
    GeofenceDetailView,
    GeofenceEventView,
)


urlpatterns = [

    # GET /api/geofence/
    # POST /api/geofence/

    path(
        "",
        GeofenceListCreateView.as_view(),
        name="geofence-list-create"
    ),


    # GET /api/geofence/1/
    # PATCH /api/geofence/1/
    # PUT /api/geofence/1/
    # DELETE /api/geofence/1/

    path(
        "<int:pk>/",
        GeofenceDetailView.as_view(),
        name="geofence-detail"
    ),


    # POST /api/geofence/1/event/

    path(
        "<int:pk>/event/",
        GeofenceEventView.as_view(),
        name="geofence-event"
    ),

]