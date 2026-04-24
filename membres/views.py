from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Membre
from .serializers import MembreSerializer, MembreCreateSerializer, MembreListSerializer
from .permissions import IsAdmin, IsResponsable, IsAgentOrAbove


class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.all()
    permission_classes = [IsAuthenticated, IsAgentOrAbove]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nom", "prenom", "telephone", "quartier"]
    ordering_fields = ["date_inscription", "nom", "prenom"]
    filterset_fields = {
        "cellule": ["exact"],
        "quartier": ["icontains"],
        "role": ["exact"],
        "date_inscription": ["gte", "lte", "exact"],
    }

    def get_serializer_class(self):
        if self.action == "list":
            return MembreListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return MembreCreateSerializer
        return MembreSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsResponsable()]
        return [IsAuthenticated(), IsAgentOrAbove()]

    def get_queryset(self):
        user = self.request.user
        queryset = Membre.objects.filter(is_deleted=False)
        if user.is_admin:
            return queryset
        if user.cellule:
            return queryset.filter(cellule=user.cellule)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=["get"], url_path="responsables-list")
    def responsables_list(self, request):
        responsables = Membre.objects.filter(role="responsable", is_deleted=False)
        serializer = MembreListSerializer(responsables, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsResponsable])
    def restore(self, request, pk=None):
        membre = self.get_object()
        if not membre.is_deleted:
            return Response({"error": "Ce membre nest pas supprime."}, status=status.HTTP_400_BAD_REQUEST)
        membre.is_deleted = False
        membre.save()
        return Response({"message": "Membre restaure avec succes."})

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsResponsable])
    def deleted(self, request):
        queryset = Membre.objects.filter(is_deleted=True)
        user = request.user
        if not user.is_admin:
            if user.is_responsable and user.cellule:
                queryset = queryset.filter(cellule=user.cellule)
            else:
                queryset = queryset.none()
        serializer = MembreSerializer(queryset, many=True)
        return Response(serializer.data)
