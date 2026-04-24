#!/usr/bin/env python
import os
import django
import traceback

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

def test_dashboard():
    """Tester le dashboard."""
    print("=== Test Dashboard ===")
    try:
        from membres.dashboard_views import DashboardView
        from django.contrib.auth.models import User
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request
        
        # Créer une requête factice
        factory = APIRequestFactory()
        django_request = factory.get('/api/dashboard/')
        
        # Utiliser le premier utilisateur admin
        user = User.objects.filter(is_staff=True).first()
        if not user:
            print("Aucun utilisateur admin trouvé")
            return False
            
        django_request.user = user
        request = Request(django_request)
        
        # Tester la vue
        view = DashboardView()
        response = view.get(request)
        
        print(f"Dashboard OK: {response.status_code}")
        print(f"Données: {list(response.data.keys())}")
        return True
        
    except Exception as e:
        print(f"Erreur Dashboard: {str(e)}")
        print(traceback.format_exc())
        return False

def test_cellules():
    """Tester les cellules."""
    print("\n=== Test Cellules ===")
    try:
        from cellules.models import Cellule
        from cellules.serializers import CelluleSerializer
        
        cellules = Cellule.objects.all()
        print(f"Nombre de cellules: {cellules.count()}")
        
        # Tester le serializer
        for cellule in cellules[:3]:  # Tester les 3 premières
            try:
                serializer = CelluleSerializer(cellule)
                data = serializer.data
                print(f"Cellule OK: {data.get('nom_cellule')} - couleur: {data.get('couleur', 'N/A')}")
            except Exception as e:
                print(f"Erreur serializer pour {cellule.nom_cellule}: {str(e)}")
                
        return True
        
    except Exception as e:
        print(f"Erreur Cellules: {str(e)}")
        print(traceback.format_exc())
        return False

def test_membres():
    """Tester les membres."""
    print("\n=== Test Membres ===")
    try:
        from membres.models import Membre
        from membres.serializers import MembreSerializer
        
        membres = Membre.objects.filter(is_deleted=False)
        print(f"Nombre de membres: {membres.count()}")
        
        # Tester le serializer
        for membre in membres[:3]:  # Tester les 3 premiers
            try:
                serializer = MembreSerializer(membre)
                data = serializer.data
                print(f"Membre OK: {data.get('full_name')} - téléphone: {data.get('telephone', 'N/A')}")
            except Exception as e:
                print(f"Erreur serializer pour {membre.full_name}: {str(e)}")
                
        return True
        
    except Exception as e:
        print(f"Erreur Membres: {str(e)}")
        print(traceback.format_exc())
        return False

def test_database_connection():
    """Tester la connexion à la base de données."""
    print("\n=== Test Base de données ===")
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("Connexion BD OK")
        return True
        
    except Exception as e:
        print(f"Erreur BD: {str(e)}")
        return False

def test_migrations():
    """Tester si les migrations sont à jour."""
    print("\n=== Test Migrations ===")
    try:
        from django.core.management import execute_from_command_line
        import sys
        
        # Vérifier les migrations sans les appliquer
        execute_from_command_line(['manage.py', 'check'])
        print("Migrations OK")
        return True
        
    except Exception as e:
        print(f"Erreur Migrations: {str(e)}")
        return False

def main():
    """Fonction principale de diagnostic."""
    print("Diagnostic de l'API Tamba Politique")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_migrations,
        test_cellules,
        test_membres,
        test_dashboard,
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
    
    if not all(results):
        print("\nCertains tests ont échoué. Vérifiez les erreurs ci-dessus.")
    else:
        print("\nTous les tests sont OK!")

if __name__ == '__main__':
    main()
