from rest_framework import serializers
from membres.models import Membre
from .models import Cellule


class ResponsableDataSerializer(serializers.Serializer):
    """Serializer pour les données du responsable envoyées depuis le formulaire cellule."""
    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100)
    telephone = serializers.CharField(max_length=20)
    quartier = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')


class CelluleSerializer(serializers.ModelSerializer):
    nombre_membres = serializers.IntegerField(read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    responsable_prenom = serializers.SerializerMethodField()
    responsable_telephone = serializers.SerializerMethodField()
    responsable = serializers.PrimaryKeyRelatedField(
        queryset=Membre.objects.filter(role="responsable", is_deleted=False),
        allow_null=True, required=False
    )
    responsable_data = ResponsableDataSerializer(write_only=True, required=False)

    class Meta:
        model = Cellule
        fields = ["id", "nom_cellule", "responsable", "responsable_nom", "responsable_prenom",
                  "responsable_telephone", "responsable_data",
                  "description", "quartier", "commune", "departement",
                  "actif", "nombre_membres", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_responsable_nom(self, obj):
        if not obj.responsable:
            return None
        return obj.responsable.nom

    def get_responsable_prenom(self, obj):
        if not obj.responsable:
            return None
        return obj.responsable.prenom

    def get_responsable_telephone(self, obj):
        if not obj.responsable:
            return None
        return obj.responsable.telephone


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
