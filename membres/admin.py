from django.contrib import admin
from .models import Membre


@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'numero_identification', 'telephone', 'quartier', 'inscrit_liste_electorale', 'numero_carte_electeur', 'cellule', 'role', 'optin_pastef_infos', 'date_inscription']
    list_filter = ['role', 'cellule', 'inscrit_liste_electorale', 'optin_pastef_infos', 'date_inscription']
    search_fields = ['nom', 'prenom', 'numero_identification', 'numero_carte_electeur', 'telephone', 'quartier', 'centre_vote']
    raw_id_fields = ['cellule', 'cree_par']
    ordering = ['-date_inscription']
