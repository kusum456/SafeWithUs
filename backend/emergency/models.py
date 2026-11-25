from django.conf import settings
from django.db import models


class Emergency(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("resolved", "Resolved"),
        ("cancelled", "Cancelled"),
    ]

    TYPE_CHOICES = [
        ("sos", "SOS"),
        ("medical", "Medical"),
        ("fire", "Fire"),
        ("accident", "Accident"),
        ("police", "Police"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="emergencies"
    )

    emergency_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="sos"
    )

    message = models.TextField(
        blank=True,
        null=True
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    resolved_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.emergency_type.upper()} - {self.user}"