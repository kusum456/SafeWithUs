from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        )

        notification_type = request.query_params.get(
            "type"
        )

        if notification_type:
            notifications = notifications.filter(
                notification_type=notification_type
            )

        unread = request.query_params.get(
            "unread"
        )

        if unread == "true":
            notifications = notifications.filter(
                is_read=False
            )

        elif unread == "false":
            notifications = notifications.filter(
                is_read=True
            )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response({
            "count": notifications.count(),
            "notifications": serializer.data
        })

    def post(self, request):

        serializer = NotificationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            notification = serializer.save(
                recipient=request.user
            )

            return Response(
                NotificationSerializer(notification).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class UnreadNotificationCountView(APIView):

    permission_classes = [IsAuthenticated]

    # GET /api/notifications/unread-count/
    def get(self, request):

        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({
            "unread_count": count
        })


class MarkNotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    # PATCH /api/notifications/<id>/read/
    def patch(self, request, pk):

        try:

            notification = Notification.objects.get(
                id=pk,
                recipient=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "message": "Notification not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save()

        serializer = NotificationSerializer(
            notification
        )

        return Response(serializer.data)


class MarkAllNotificationsReadView(APIView):

    permission_classes = [IsAuthenticated]

    # PATCH /api/notifications/mark-all-read/
    def patch(self, request):

        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response({
            "message": "All notifications marked as read.",
            "updated_count": updated
        })


class DeleteNotificationView(APIView):

    permission_classes = [IsAuthenticated]

    # DELETE /api/notifications/<id>/
    def delete(self, request, pk):

        try:

            notification = Notification.objects.get(
                id=pk,
                recipient=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "message": "Notification not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()

        return Response({
            "message": "Notification deleted successfully."
        })