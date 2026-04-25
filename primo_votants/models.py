from django.db import models

class PrimoVotant(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    quartier = models.CharField(max_length=200)
    annee_naissance = models.IntegerField()
    telephone = models.CharField(max_length=20)
    a_nin = models.BooleanField(default=False)
    numero_nin = models.CharField(max_length=50, blank=True, null=True)
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "primo_votants"
        ordering = ["-date_inscription"]
        verbose_name = "Primo Votant"
        verbose_name_plural = "Primo Votants"

    def __str__(self):
        return f"{self.prenom} {self.nom}"
