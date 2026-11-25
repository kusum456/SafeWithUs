from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):

    message = "Only administrators can access this resource."

    def has_permission(
        self,
        request,
        view
    ):

        if not request.user:
            return False

        if not request.user.is_authenticated:
            return False

        return (
            getattr(
                request.user,
                "role",
                None
            ) == "admin"
        )