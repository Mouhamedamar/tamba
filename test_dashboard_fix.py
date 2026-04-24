#!/usr/bin/env python
"""
Script de test pour vérifier que le dashboard fonctionne correctement après connexion.
"""
import os
import django
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

def test_dashboard_api():
    """Test l'endpoint dashboard avec différents rôles."""
    print("=== Test de l'API Dashboard ===")
    
    try:
        from membres.dashboard_views import DashboardView
        from django.contrib.auth.models import User
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request
        
        factory = APIRequestFactory()
        
        # Tester avec un admin
        admin_user = User.objects.filter(is_staff=True).first()
        if admin_user:
            print(f"\nTest avec admin: {admin_user.username}")
            request = factory.get('/api/dashboard/')
            request.user = admin_user
            drf_request = Request(request)
            
            view = DashboardView()
            response = view.get(drf_request)
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                print(f"Champs retournés: {list(data.keys())}")
                
                # Vérifier les champs attendus par le frontend
                champs_attendus = ['total_membres', 'total_cellules', 'membres_actifs', 'nouveaux_ce_mois', 
                                 'membres_par_cellule', 'evolution_inscriptions']
                
                for champ in champs_attendus:
                    if champ in data:
                        print(f"  ✅ {champ}: {data[champ]}")
                    else:
                        print(f"  ❌ {champ}: MANQUANT")
            else:
                print(f"Erreur: {response.data}")
        
        # Tester avec un responsable
        responsable_user = User.objects.filter(role='responsable').first()
        if responsable_user:
            print(f"\nTest avec responsable: {responsable_user.username}")
            request = factory.get('/api/dashboard/')
            request.user = responsable_user
            drf_request = Request(request)
            
            view = DashboardView()
            response = view.get(drf_request)
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                print(f"Champs retournés: {list(data.keys())}")
                print(f"  ✅ total_membres: {data.get('total_membres', 0)}")
                print(f"  ✅ total_cellules: {data.get('total_cellules', 0)}")
        
        # Tester avec un agent
        agent_user = User.objects.filter(role='agent').first()
        if agent_user:
            print(f"\nTest avec agent: {agent_user.username}")
            request = factory.get('/api/dashboard/')
            request.user = agent_user
            drf_request = Request(request)
            
            view = DashboardView()
            response = view.get(drf_request)
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                print(f"Champs retournés: {list(data.keys())}")
                print(f"  ✅ total_membres: {data.get('total_membres', 0)}")
        
        return True
        
    except Exception as e:
        print(f"Erreur lors du test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_dashboard_data_integrity():
    """Test l'intégrité des données du dashboard."""
    print("\n=== Test d'intégrité des données ===")
    
    try:
        from membres.models import Membre
        from cellules.models import Cellule
        from django.contrib.auth.models import User
        
        # Vérifier les comptes
        total_membres_db = Membre.objects.filter(is_deleted=False).count()
        total_cellules_db = Cellule.objects.filter(actif=True).count()
        
        print(f"Base de données:")
        print(f"  - Membres actifs: {total_membres_db}")
        print(f"  - Cellules actives: {total_cellules_db}")
        
        # Vérifier les utilisateurs
        admin_count = User.objects.filter(is_staff=True).count()
        responsable_count = User.objects.filter(role='responsable').count()
        agent_count = User.objects.filter(role='agent').count()
        
        print(f"Utilisateurs:")
        print(f"  - Admins: {admin_count}")
        print(f"  - Responsables: {responsable_count}")
        print(f"  - Agents: {agent_count}")
        
        return True
        
    except Exception as e:
        print(f"Erreur lors du test d'intégrité: {str(e)}")
        return False

def main():
    """Fonction principale de test."""
    print("Test de correction du Dashboard - Tamba Politique")
    print("=" * 50)
    
    tests = [
        test_dashboard_api,
        test_dashboard_data_integrity,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"Erreur inattendue: {str(e)}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("RÉSULTATS:")
    print(f"Tests réussis: {sum(results)}/{len(results)}")
    
    if all(results):
        print("\n✅ Tous les tests sont OK!")
        print("Le dashboard devrait maintenant s'afficher correctement après connexion.")
        print("\nÉtapes suivantes:")
        print("1. Redémarrez le serveur Django")
        print("2. Connectez-vous à l'application")
        print("3. Vérifiez que le dashboard s'affiche avec les statistiques")
    else:
        print("\n❌ Certains tests ont échoué.")
        print("Vérifiez les erreurs ci-dessus.")
    
    return all(results)

if __name__ == '__main__':
    main()
