from rest_framework import serializers
from .models import PrimoVotant

class PrimoVotantSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimoVotant
        fields = ["id", "nom", "prenom", "quartier", "annee_naissance",
                  "telephone", "a_nin", "numero_nin", "date_inscription"]
        read_only_fields = ["id", "date_inscription"]
