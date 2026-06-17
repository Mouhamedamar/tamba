from rest_framework import viewsets, filters
from django.db.models import ProtectedError
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.db import transaction
from membres.models import Membre
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

    def create(self, request, *args, **kwargs):
        """Créer une cellule avec création optionnelle du responsable en une seule requête."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extraire les données du responsable avant la sauvegarde
        responsable_data = serializer.validated_data.pop('responsable_data', None)

        with transaction.atomic():
            # 1. Créer la cellule sans responsable
            cellule = serializer.save(responsable=None)

            # 2. Si données responsable fournies → créer le membre responsable
            if responsable_data:
                responsable = Membre.objects.create(
                    nom=responsable_data['nom'],
                    prenom=responsable_data['prenom'],
                    telephone=responsable_data['telephone'],
                    quartier=responsable_data.get('quartier', ''),
                    role='responsable',
                    cellule=cellule,
                    cree_par=request.user,
                )
                # 3. Lier le responsable à la cellule
                cellule.responsable = responsable
                cellule.save(update_fields=['responsable'])

        cache.clear()
        output_serializer = self.get_serializer(cellule)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Mettre à jour une cellule avec mise à jour ou création du responsable."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Extraire les données du responsable
        responsable_data = serializer.validated_data.pop('responsable_data', None)

        with transaction.atomic():
            cellule = serializer.save()

            if responsable_data:
                if cellule.responsable:
                    # Mettre à jour le responsable existant
                    cellule.responsable.nom = responsable_data['nom']
                    cellule.responsable.prenom = responsable_data['prenom']
                    cellule.responsable.telephone = responsable_data['telephone']
                    if 'quartier' in responsable_data:
                        cellule.responsable.quartier = responsable_data['quartier']
                    cellule.responsable.save()
                else:
                    # Créer un nouveau responsable
                    responsable = Membre.objects.create(
                        nom=responsable_data['nom'],
                        prenom=responsable_data['prenom'],
                        telephone=responsable_data['telephone'],
                        quartier=responsable_data.get('quartier', ''),
                        role='responsable',
                        cellule=cellule,
                        cree_par=request.user,
                    )
                    cellule.responsable = responsable
                    cellule.save(update_fields=['responsable'])

        cache.clear()
        output_serializer = self.get_serializer(cellule)
        return Response(output_serializer.data)

    def perform_create(self, serializer):
        # Fallback (non utilisé quand create() est surchargé)
        serializer.save()
        cache.clear()

    def perform_update(self, serializer):
        # Fallback (non utilisé quand update() est surchargé)
        serializer.save()
        cache.clear()
