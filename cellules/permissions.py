from rest_framework import permissions


class IsAdminOrResponsable(permissions.BasePermission):
    """Permission pour les administrateurs et responsables."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_responsable
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        if request.user.is_responsable:
            return obj.responsable_id == request.user.id
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Lecture pour tous, écriture pour admin uniquement."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin