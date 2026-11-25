from django.db import models
from django.conf import settings

class Geofence(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="geofences"
    )

    name = models.CharField(max_length=100)

    latitude = models.FloatField()

    longitude = models.FloatField()

    radius = models.IntegerField(default=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

# Create your models here.
