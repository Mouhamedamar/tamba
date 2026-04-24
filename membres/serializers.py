from rest_framework import serializers
from .models import Membre
from cellules.models import Cellule


class MembreSerializer(serializers.ModelSerializer):
    """Serializer pour les membres."""

    cellule_nom = serializers.CharField(source='cellule.nom_cellule', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.get_full_name', read_only=True, allow_null=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'full_name', 'telephone', 'quartier', 'numero_identification',
            'inscrit_liste_electorale', 'numero_carte_electeur', 'date_expiration_carte',
            'centre_vote', 'bureau_vote', 'optin_pastef_infos',
            'cellule', 'cellule_nom', 'role', 'date_inscription',
            'cree_par', 'cree_par_nom', 'is_deleted'
        ]
        read_only_fields = ['id', 'date_inscription', 'cree_par', 'is_deleted', 'full_name', 'cellule_nom', 'cree_par_nom']

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le nom ne peut pas être vide.')
        return value.strip()

    def validate_prenom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le prénom ne peut pas être vide.')
        return value.strip()

    def validate_telephone(self, value):
        """Validation du numéro de téléphone."""
        if not value:
            raise serializers.ValidationError('Le téléphone est obligatoire.')
        
        # Nettoyage du numéro
        phone = value.replace(' ', '').replace('-', '')
        
        if len(phone) < 9:
            raise serializers.ValidationError('Numéro de téléphone invalide (minimum 9 chiffres).')
        
        return phone

    def update(self, instance, validated_data):
        """Mise à jour du membre sans perte de données."""
        # Pour les modifications partielles (PATCH), conserver les valeurs existantes
        # Pour les modifications complètes (PUT), tous les champs doivent être fournis
        
        # Liste des champs qui peuvent être None dans la base de données
        nullable_fields = [
            'date_expiration_carte', 'centre_vote', 'bureau_vote'
        ]
        
        # Liste des champs qui sont des chaînes vides autorisées
        empty_string_fields = [
            'numero_identification', 'numero_carte_electeur', 'quartier'
        ]
        
        # Pour chaque champ non fourni dans validated_data, conserver la valeur existante
        for field in self.Meta.fields:
            if field not in self.Meta.read_only_fields and field not in validated_data:
                current_value = getattr(instance, field, None)
                
                # Gérer les champs nullable
                if field in nullable_fields:
                    validated_data[field] = current_value
                # Gérer les champs qui peuvent être des chaînes vides
                elif field in empty_string_fields:
                    validated_data[field] = current_value if current_value is not None else ''
                # Gérer les autres champs
                else:
                    validated_data[field] = current_value
        
        return super().update(instance, validated_data)

    def validate_date_expiration_carte(self, value):
        if value is None or value == '':
            return None
        return value

    def validate_centre_vote(self, value):
        if value is None or value == '':
            return None
        return value.strip() if value else None

    def validate_bureau_vote(self, value):
        if value is None or value == '':
            return None
        return value.strip() if value else None

    def validate_numero_identification(self, value):
        if value is None or value == '':
            return ''
        return value.strip() if value else ''

    def validate_numero_carte_electeur(self, value):
        if value is None or value == '':
            return ''
        return value.strip() if value else ''

    def validate_quartier(self, value):
        if value is None or value == '':
            return ''
        return value.strip() if value else ''


class MembreCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de membres."""

    class Meta:
        model = Membre
        fields = [
            'nom', 'prenom', 'telephone', 'quartier', 'numero_identification',
            'inscrit_liste_electorale', 'numero_carte_electeur', 'date_expiration_carte',
            'centre_vote', 'bureau_vote', 'optin_pastef_infos',
            'cellule', 'role'
        ]

    def validate_telephone(self, value):
        phone = value.replace(' ', '').replace('-', '')
        if len(phone) < 9:
            raise serializers.ValidationError('Numéro de téléphone invalide.')
        return phone

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le nom ne peut pas être vide.')
        return value.strip()

    def validate_prenom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le prénom ne peut pas être vide.')
        return value.strip()

    def validate_cellule(self, value):
        request = self.context.get('request')
        if request and request.user.is_responsable:
            if value.id != request.user.cellule_id:
                raise serializers.ValidationError('Vous ne pouvez ajouter des membres qu\'à votre cellule.')
        return value

    def validate_date_expiration_carte(self, value):
        if value is None or value == '':
            return None
        return value

    def validate_centre_vote(self, value):
        if value is None or value == '':
            return None
        return value.strip() if value else None

    def validate_bureau_vote(self, value):
        if value is None or value == '':
            return None
        return value.strip() if value else None


class MembreBulkCreateSerializer(serializers.Serializer):
    """Serializer pour la création en lot de membres."""
    membres = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=100
    )

    def validate_membres(self, value):
        errors = []
        for idx, membre_data in enumerate(value):
            if not membre_data.get('nom') or not membre_data['nom'].strip():
                errors.append(f"Membre {idx + 1}: Le nom est obligatoire")
            if not membre_data.get('prenom') or not membre_data['prenom'].strip():
                errors.append(f"Membre {idx + 1}: Le prénom est obligatoire")
            if not membre_data.get('telephone'):
                errors.append(f"Membre {idx + 1}: Le téléphone est obligatoire")
            else:
                phone = membre_data['telephone'].replace(' ', '').replace('-', '')
                if len(phone) < 9:
                    errors.append(f"Membre {idx + 1}: Numéro de téléphone invalide")
        
        if errors:
            raise serializers.ValidationError({'errors': errors})
        return value


class MembreListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes."""

    cellule_nom = serializers.CharField(source='cellule.nom_cellule', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'full_name', 'telephone', 'quartier', 
            'numero_identification', 'inscrit_liste_electorale', 'numero_carte_electeur', 
            'date_expiration_carte', 'centre_vote', 'bureau_vote', 
            'cellule', 'cellule_nom', 'role', 'date_inscription', 'optin_pastef_infos'
        ]
