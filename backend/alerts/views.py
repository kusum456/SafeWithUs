from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Alert
from .serializers import AlertSerializer


class AlertListView(generics.ListAPIView):

    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(
            user=self.request.user
        ).order_by("-created_at")