from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import ProtectedError
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError as e:
            blocking_objs = [str(obj) for obj in e.protected_objects]
            detail = f"Suppression impossible : ce primo-votant est lie a des donnees ({', '.join(blocking_objs[:3])})."
            return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
