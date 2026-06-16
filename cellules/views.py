from rest_framework import viewsets, filters
from django.db.models import ProtectedError
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from .models import Cellule
from .serializers import CelluleSerializer, CelluleListSerializer
from .permissions import IsAdminOrResponsable, IsAdminOrReadOnly


class CelluleViewSet(viewsets.ModelViewSet):
    queryset = Cellule.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nom_cellule", "description", "quartier"]
    ordering_fields = ["nom_cellule", "quartier", "created_at"]
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.action == "list":
            return CelluleListSerializer
        return CelluleSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsAuthenticated(), IsAdminOrReadOnly()]
        if self.action in ["update", "partial_update"]:
            return [IsAuthenticated(), IsAdminOrResponsable()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Cellule.objects.all().select_related("responsable")
        if user.cellule_id:
            return Cellule.objects.filter(id=user.cellule_id).select_related("responsable")
        return Cellule.objects.none()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError as e:
            blocking_objs = [str(obj) for obj in e.protected_objects]
            detail = f"Suppression impossible : cette cellule est liee a des donnees ({', '.join(blocking_objs[:3])})."
            return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()
