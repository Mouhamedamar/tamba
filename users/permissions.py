from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """ Accès exclusif aux Administrateurs. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

class IsResponsable(permissions.BasePermission):
    """ Accès pour les Responsables de cellules. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_responsable)

class IsAgent(permissions.BasePermission):
    """ Accès pour les Agents de terrain. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_agent)

class IsAgentOrAbove(permissions.BasePermission):
    """ Accès pour les agents et au-dessus. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_responsable or request.user.is_agent
        ))

class IsAdminOrResponsable(permissions.BasePermission):
    """ Accès combiné pour Admin + Responsable """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_admin or request.user.is_responsable)
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """ Permission pour le propriétaire ou admin. """
    def has_object_permission(self, request, view, obj):
        return bool(request.user and (request.user.is_admin or obj == request.user))