from django.db import models
from django.conf import settings


class Activite(models.Model):
    STATUT_CHOICES = [
        ('a_venir', 'A venir'),
        ('en_cours', 'En cours'),
        ('termine', 'Termine'),
        ('annule', 'Annule'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField(null=True, blank=True)
    lieu = models.CharField(max_length=200, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='a_venir')
    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activites_creees'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'activites'
        ordering = ['-date_debut']
        verbose_name = 'Activite'
        verbose_name_plural = 'Activites'

    def __str__(self):
        return self.titre
