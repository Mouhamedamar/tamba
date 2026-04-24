from rest_framework import serializers
from membres.models import Membre
from .models import Cellule


class CelluleSerializer(serializers.ModelSerializer):
    nombre_membres = serializers.IntegerField(read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    responsable = serializers.PrimaryKeyRelatedField(
        queryset=Membre.objects.filter(role="responsable", is_deleted=False),
        allow_null=True, required=False
    )

    class Meta:
        model = Cellule
        fields = ["id", "nom_cellule", "responsable", "responsable_nom",
                  "description", "quartier", "commune", "departement",
                  "actif", "nombre_membres", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_responsable_nom(self, obj):
        if not obj.responsable:
            return None
        return f"{obj.responsable.prenom} {obj.responsable.nom}"


class CelluleListSerializer(serializers.ModelSerializer):
    nombre_membres = serializers.IntegerField(read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    responsable = serializers.PrimaryKeyRelatedField(
        queryset=Membre.objects.filter(role="responsable", is_deleted=False),
        allow_null=True, required=False
    )

    class Meta:
        model = Cellule
        fields = ["id", "nom_cellule", "responsable", "responsable_nom",
                  "quartier", "commune", "departement", "actif", "nombre_membres"]

    def get_responsable_nom(self, obj):
        if not obj.responsable:
            return None
        return f"{obj.responsable.prenom} {obj.responsable.nom}"
