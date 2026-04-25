from django.contrib import admin
from .models import Activite


@admin.register(Activite)
class ActiviteAdmin(admin.ModelAdmin):
    list_display = ['titre', 'statut', 'date_debut', 'lieu', 'cree_par']
    list_filter = ['statut']
    search_fields = ['titre', 'lieu']
