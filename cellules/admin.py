from django.contrib import admin
from .models import Cellule


@admin.register(Cellule)
class CelluleAdmin(admin.ModelAdmin):
    list_display = ['nom_cellule', 'quartier', 'commune', 'departement', 'responsable', 'created_at']
    list_filter = ['created_at', 'actif', 'commune', 'departement']
    search_fields = ['nom_cellule', 'quartier', 'commune', 'departement', 'description']
    raw_id_fields = ['responsable']
