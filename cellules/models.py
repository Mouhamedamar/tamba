from django.db import models


class Cellule(models.Model):
    nom_cellule = models.CharField(max_length=200, unique=True)
    responsable = models.ForeignKey(
        "membres.Membre",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="cellules_dirigees",
        limit_choices_to={"role": "responsable", "is_deleted": False}
    )
    description = models.TextField(blank=True)
    quartier = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)
    departement = models.CharField(max_length=100, default="Tambacounda")
    couleur = models.CharField(max_length=7, default="#3B82F6")
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cellules"
        ordering = ["nom_cellule"]
        verbose_name = "Cellule"
        verbose_name_plural = "Cellules"

    def __str__(self):
        return self.nom_cellule

    @property
    def nombre_membres(self):
        return self.membres.filter(is_deleted=False).count()
