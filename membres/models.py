from django.db import models
from django.conf import settings
from cellules.models import Cellule


class Membre(models.Model):
    """Modèle pour les membres (militants)."""

    ROLE_CHOICES = [
        ('militant', 'Militant'),
        ('responsable', 'Responsable'),
    ]

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)
    quartier = models.CharField(max_length=200)
    cellule = models.ForeignKey(
        Cellule,
        on_delete=models.CASCADE,
        related_name='membres'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='militant')
    date_inscription = models.DateTimeField(auto_now_add=True)
    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='membres_crees'
    )
    is_deleted = models.BooleanField(default=False)
    numero_identification = models.CharField(max_length=50, null=True, blank=True)
    inscrit_liste_electorale = models.BooleanField(default=False)
    numero_carte_electeur = models.CharField(max_length=50, null=True, blank=True)
    date_expiration_carte = models.DateField(null=True, blank=True)
    centre_vote = models.CharField(max_length=200, null=True, blank=True)
    bureau_vote = models.CharField(max_length=100, null=True, blank=True)
    optin_pastef_infos = models.BooleanField(default=False, verbose_name="Recevoir infos PASTEF/élections")

    class Meta:
        db_table = 'membres'
        ordering = ['-date_inscription']
        verbose_name = 'Membre'
        verbose_name_plural = 'Membres'

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    @property
    def full_name(self):
        return f"{self.prenom} {self.nom}"