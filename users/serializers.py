from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """ Serializer pour la lecture/création des utilisateurs. """

    # Champ en écriture pour permettre la modification du rôle via PATCH/PUT.
    # (Même si get_role existe pour l'affichage, le rôle stocké reste `obj.role`.)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    # Robustesse: certains users peuvent avoir cellule = NULL.
    cellule_nom = serializers.SerializerMethodField(read_only=True)
    cellule_quartier = serializers.SerializerMethodField(read_only=True)

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Optionnel: label lisible (utile si l'UI veut afficher admin/responsable/agent).
    role_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_label', 'telephone', 'cellule', 'cellule_nom', 'cellule_quartier',
            'date_joined', 'password'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_role_label(self, obj):
        return 'admin' if obj.is_superuser else obj.get_role_display() if hasattr(obj, 'get_role_display') else obj.role

    def get_cellule_nom(self, obj):
        cellule = getattr(obj, 'cellule', None)
        return getattr(cellule, 'nom_cellule', None) if cellule else None

    def get_cellule_quartier(self, obj):
        cellule = getattr(obj, 'cellule', None)
        return getattr(cellule, 'quartier', None) if cellule else None



    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    """ Serializer pour la création d'utilisateurs avec validation renforcée. """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'telephone', 'cellule']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'agent'),
            telephone=validated_data.get('telephone', ''),
            cellule=validated_data.get('cellule', None)
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """ Serializer pour le changement de mot de passe. """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe actuel incorrect.')
        return value