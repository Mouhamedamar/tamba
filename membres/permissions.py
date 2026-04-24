from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission pour les administrateurs."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsResponsable(permissions.BasePermission):
    """Permission pour les responsables."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_responsable
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        if request.user.is_responsable:
            return obj.cellule_id == request.user.cellule_id
        return False


class IsAgentOrAbove(permissions.BasePermission):
    """Permission pour les agents et au-dessus."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_responsable or request.user.is_agent
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        if request.user.is_responsable:
            return obj.cellule_id == request.user.cellule_id
        return False