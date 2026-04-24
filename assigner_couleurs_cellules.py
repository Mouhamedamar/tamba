#!/usr/bin/env python
import os
import django
import random

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from cellules.models import Cellule

def assigner_couleurs_aleatoires():
    """Assigner des couleurs aléatoires aux cellules existantes."""
    
    # Palette de couleurs prédéfinies pour une bonne visibilité
    couleurs = [
        '#3B82F6',  # Bleu
        '#10B981',  # Vert
        '#F59E0B',  # Orange
        '#EF4444',  # Rouge
        '#8B5CF6',  # Violet
        '#EC4899',  # Rose
        '#06B6D4',  # Cyan
        '#84CC16',  # Vert lime
        '#F97316',  # Orange foncé
        '#6366F1',  # Indigo
        '#14B8A6',  # Teal
        '#A855F7',  # Violet clair
        '#0EA5E9',  # Sky blue
        '#22C55E',  # Vert émeraude
        '#F43F5E',  # Rose foncé
    ]
    
    cellules = Cellule.objects.all()
    couleurs_utilisees = set()
    
    print(f"Assignation de couleurs à {cellules.count()} cellules...")
    
    for i, cellule in enumerate(cellules):
        # Choisir une couleur qui n'est pas encore utilisée si possible
        couleurs_disponibles = [c for c in couleurs if c not in couleurs_utilisees]
        
        if couleurs_disponibles:
            couleur = random.choice(couleurs_disponibles)
            couleurs_utilisees.add(couleur)
        else:
            # Si toutes les couleurs ont été utilisées, en choisir une au hasard
            couleur = random.choice(couleurs)
        
        cellule.couleur = couleur
        cellule.save()
        
        print(f"✓ {cellule.nom_cellule}: {couleur}")
    
    print(f"\nAssignation terminée ! {cellules.count()} cellules mises à jour.")

if __name__ == '__main__':
    assigner_couleurs_aleatoires()
