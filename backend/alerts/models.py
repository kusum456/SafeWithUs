from django.db import models
from django.conf import settings


class Alert(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    geofence = models.ForeignKey(
        "geofence.Geofence",
        on_delete=models.CASCADE
    )

    message = models.CharField(max_length=200)

    latitude = models.FloatField()

    longitude = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message