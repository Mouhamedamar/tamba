from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import PrimoVotant
from .serializers import PrimoVotantSerializer

class PrimoVotantViewSet(viewsets.ModelViewSet):
    queryset = PrimoVotant.objects.all()
    serializer_class = PrimoVotantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nom", "prenom", "quartier", "telephone"]
    filterset_fields = ["quartier", "a_nin"]
    ordering_fields = ["date_inscription", "nom", "annee_naissance"]
