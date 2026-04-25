from rest_framework import serializers
from .models import Activite


class ActiviteSerializer(serializers.ModelSerializer):
    cree_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = Activite
        fields = ['id', 'titre', 'description', 'date_debut', 'date_fin',
                  'lieu', 'statut', 'cree_par', 'cree_par_nom', 'created_at']
        read_only_fields = ['id', 'cree_par', 'created_at']

    def get_cree_par_nom(self, obj):
        if not obj.cree_par:
            return None
        full = obj.cree_par.get_full_name().strip()
        return full if full else obj.cree_par.username
