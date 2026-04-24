#!/usr/bin/env python
"""
Script de test pour valider les corrections de la modification des membres.
Ce script teste différentes scenarios de modification pour s'assurer qu'aucune donnée n'est perdue.
"""
import os
import django
import json
from datetime import date

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

def test_modification_partielle():
    """Test de modification partielle (PATCH) - seul un champ modifié."""
    print("=== Test 1: Modification partielle (PATCH) ===")
    
    try:
        from membres.models import Membre
        from membres.serializers import MembreSerializer
        from cellules.models import Cellule
        
        # Créer une cellule de test si nécessaire
        cellule, _ = Cellule.objects.get_or_create(
            nom_cellule="Cellule Test",
            defaults={
                'quartier': 'Test Quartier',
                'responsable': 'Test Responsable',
                'telephone_responsable': '22112345678',
                'couleur': '#FF0000'
            }
        )
        
        # Créer un membre de test avec toutes les informations
        membre = Membre.objects.create(
            nom='Diallo',
            prenom='Ali',
            telephone='22176543210',
            quartier='Pikine',
            cellule=cellule,
            role='militant',
            numero_identification='ID123456',
            inscrit_liste_electorale=True,
            numero_carte_electeur='CARTE789',
            date_expiration_carte=date(2025, 12, 31),
            centre_vote='Centre Test',
            bureau_vote='Bureau 1',
            optin_pastef_infos=True
        )
        
        print(f"Membre créé: {membre.full_name}")
        print(f"Données originales:")
        print(f"  - Téléphone: {membre.telephone}")
        print(f"  - Quartier: {membre.quartier}")
        print(f"  - N° Identification: {membre.numero_identification}")
        print(f"  - Centre vote: {membre.centre_vote}")
        
        # Test 1: Modification partielle - uniquement le téléphone
        serializer = MembreSerializer(membre, data={'telephone': '22111111111'}, partial=True)
        
        if serializer.is_valid():
            membre_modifie = serializer.save()
            print(f"\nModification partielle réussie:")
            print(f"  - Nouveau téléphone: {membre_modifie.telephone}")
            print(f"  - Quartier préservé: {membre_modifie.quartier}")
            print(f"  - N° Identification préservé: {membre_modifie.numero_identification}")
            print(f"  - Centre vote préservé: {membre_modifie.centre_vote}")
            
            # Vérifications
            assert membre_modifie.telephone == '22111111111', "Téléphone non modifié"
            assert membre_modifie.quartier == 'Pikine', "Quartier perdu"
            assert membre_modifie.numero_identification == 'ID123456', "N° Identification perdu"
            assert membre_modifie.centre_vote == 'Centre Test', "Centre vote perdu"
            
            print("  -> Test 1: OK")
            success = True
        else:
            print(f"Erreurs de validation: {serializer.errors}")
            success = False
            
        # Nettoyage
        membre.delete()
        return success
        
    except Exception as e:
        print(f"Erreur dans test_modification_partielle: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_modification_complete():
    """Test de modification complète (PUT) - tous les champs fournis."""
    print("\n=== Test 2: Modification complète (PUT) ===")
    
    try:
        from membres.models import Membre
        from membres.serializers import MembreSerializer
        from cellules.models import Cellule
        
        cellule = Cellule.objects.first()
        if not cellule:
            print("Aucune cellule trouvée, création d'une cellule de test")
            cellule = Cellule.objects.create(
                nom_cellule="Cellule Test 2",
                quartier='Test Quartier 2',
                responsable='Test Responsable 2',
                telephone_responsable='22187654321',
                couleur='#00FF00'
            )
        
        # Créer un membre de test
        membre = Membre.objects.create(
            nom='Fall',
            prenom='Fatou',
            telephone='22176543211',
            quartier='Guédiawaye',
            cellule=cellule,
            role='militant'
        )
        
        print(f"Membre créé: {membre.full_name}")
        
        # Test 2: Modification complète avec tous les champs
        data_complete = {
            'nom': 'Fall',
            'prenom': 'Fatou',
            'telephone': '22122222222',
            'quartier': 'Guédiawaye',
            'cellule': cellule.id,
            'role': 'militant',
            'numero_identification': 'ID789012',
            'inscrit_liste_electorale': True,
            'numero_carte_electeur': 'CARTE456',
            'date_expiration_carte': '2024-06-30',
            'centre_vote': 'Centre Modifié',
            'bureau_vote': 'Bureau 2',
            'optin_pastef_infos': False
        }
        
        serializer = MembreSerializer(membre, data=data_complete, partial=False)
        
        if serializer.is_valid():
            membre_modifie = serializer.save()
            print(f"Modification complète réussie:")
            print(f"  - Téléphone: {membre_modifie.telephone}")
            print(f"  - N° Identification: {membre_modifie.numero_identification}")
            print(f"  - Centre vote: {membre_modifie.centre_vote}")
            print(f"  - Optin: {membre_modifie.optin_pastef_infos}")
            
            # Vérifications
            assert membre_modifie.telephone == '22122222222', "Téléphone non modifié"
            assert membre_modifie.numero_identification == 'ID789012', "N° Identification non modifié"
            assert membre_modifie.centre_vote == 'Centre Modifié', "Centre vote non modifié"
            assert membre_modifie.optin_pastef_infos == False, "Optin non modifié"
            
            print("  -> Test 2: OK")
            success = True
        else:
            print(f"Erreurs de validation: {serializer.errors}")
            success = False
            
        # Nettoyage
        membre.delete()
        return success
        
    except Exception as e:
        print(f"Erreur dans test_modification_complete: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_champs_vides():
    """Test avec des champs vides et nuls."""
    print("\n=== Test 3: Gestion des champs vides/nuls ===")
    
    try:
        from membres.models import Membre
        from membres.serializers import MembreSerializer
        from cellules.models import Cellule
        
        cellule = Cellule.objects.first()
        
        # Créer un membre avec des informations complètes
        membre = Membre.objects.create(
            nom='Ba',
            prenom='Mamadou',
            telephone='22176543212',
            quartier='Thiaroye',
            cellule=cellule,
            role='militant',
            numero_identification='ID345678',
            inscrit_liste_electorale=True,
            numero_carte_electeur='CARTE123',
            date_expiration_carte=date(2024, 12, 31),
            centre_vote='Centre Original',
            bureau_vote='Bureau Original',
            optin_pastef_infos=True
        )
        
        print(f"Membre créé: {membre.full_name}")
        
        # Test 3: Modification avec des champs vides/nuls
        data_vides = {
            'numero_identification': '',
            'centre_vote': None,
            'bureau_vote': '',
            'numero_carte_electeur': ''
        }
        
        serializer = MembreSerializer(membre, data=data_vides, partial=True)
        
        if serializer.is_valid():
            membre_modifie = serializer.save()
            print(f"Modification avec champs vides réussie:")
            print(f"  - N° Identification: '{membre_modifie.numero_identification}'")
            print(f"  - Centre vote: {membre_modifie.centre_vote}")
            print(f"  - Bureau vote: '{membre_modifie.bureau_vote}'")
            print(f"  - N° Carte électeur: '{membre_modifie.numero_carte_electeur}'")
            print(f"  - Quartier préservé: {membre_modifie.quartier}")
            
            # Vérifications
            assert membre_modifie.numero_identification == '', "N° Identification non vidé"
            assert membre_modifie.centre_vote is None, "Centre vote non mis à None"
            assert membre_modifie.bureau_vote == '', "Bureau vote non vidé"
            assert membre_modifie.numero_carte_electeur == '', "N° Carte électeur non vidé"
            assert membre_modifie.quartier == 'Thiaroye', "Quartier perdu"
            
            print("  -> Test 3: OK")
            success = True
        else:
            print(f"Erreurs de validation: {serializer.errors}")
            success = False
            
        # Nettoyage
        membre.delete()
        return success
        
    except Exception as e:
        print(f"Erreur dans test_champs_vides: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Fonction principale de test."""
    print("Test de validation des corrections de modification des membres")
    print("=" * 60)
    
    tests = [
        test_modification_partielle,
        test_modification_complete,
        test_champs_vides
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"Erreur inattendue: {str(e)}")
            results.append(False)
    
    print("\n" + "=" * 60)
    print("RÉSULTATS:")
    print(f"Tests réussis: {sum(results)}/{len(results)}")
    
    if all(results):
        print("\nTous les tests sont OK! Les corrections fonctionnent correctement.")
    else:
        print("\nCertains tests ont échoué. Vérifiez les erreurs ci-dessus.")
    
    return all(results)

if __name__ == '__main__':
    main()
