from django.urls import path

from .views import UserLocationView


urlpatterns = [

    path(
        "location/",
        UserLocationView.as_view(),
        name="user-location"
    ),

]