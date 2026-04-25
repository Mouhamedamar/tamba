from django.contrib import admin
from .models import PrimoVotant

@admin.register(PrimoVotant)
class PrimoVotantAdmin(admin.ModelAdmin):
    list_display = ["nom", "prenom", "quartier", "annee_naissance", "telephone", "a_nin", "date_inscription"]
    search_fields = ["nom", "prenom", "quartier", "telephone"]
    list_filter = ["a_nin", "quartier"]
