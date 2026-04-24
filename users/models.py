from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """ Modèle utilisateur étendu avec rôles """
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('responsable', 'Responsable'),
        ('agent', 'Agent'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='agent')
    telephone = models.CharField(max_length=20, blank=True)
    
    # ForeignKey vers cellule (Optionnel pour Admin et Agent, Obligatoire logiquement pour Responsable)
    cellule = models.ForeignKey(
        'cellules.Cellule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='utilisateurs'
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

    # Helpers utiles pour la logique métier
    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_responsable(self):
        return self.role == 'responsable'

    @property
    def is_agent(self):
        return self.role == 'agent'