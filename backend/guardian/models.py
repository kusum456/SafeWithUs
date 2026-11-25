from django.db import models
from django.conf import settings


class Guardian(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.user.username


class GuardianUser(models.Model):

    guardian = models.ForeignKey(
        Guardian,
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="protected_users"
    )

    relationship = models.CharField(
        max_length=50,
        default="Trusted User"
    )

    priority = models.CharField(
        max_length=20,
        choices=[
            ("Primary", "Primary"),
            ("Secondary", "Secondary"),
            ("Emergency", "Emergency"),
        ],
        default="Primary"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "guardian",
            "user"
        )

    def __str__(self):
        return f"{self.guardian.user.username} → {self.user.username}"