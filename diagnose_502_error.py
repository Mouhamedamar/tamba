#!/usr/bin/env python
"""
Script de diagnostic pour l'erreur 502 Bad Gateway.
Ce script identifie les causes possibles du crash du serveur Django.
"""
import os
import sys
import traceback
import subprocess
from datetime import datetime

def test_django_imports():
    """Teste les imports Django critiques."""
    print("=== Test des imports Django ===")
    
    try:
        import django
        print(f"✅ Django version: {django.get_version()}")
        
        # Configuration
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
        django.setup()
        print("✅ Django setup réussi")
        
        # Test des imports de modèles
        from membres.models import Membre
        from cellules.models import Cellule
        from users.models import User
        print("✅ Imports modèles réussis")
        
        # Test des imports de vues
        from membres.dashboard_views import DashboardView
        from membres.views import MembreViewSet
        from cellules.views import CelluleViewSet
        print("✅ Imports vues réussis")
        
        # Test des imports de serializers
        from membres.serializers import MembreSerializer
        from cellules.serializers import CelluleSerializer
        print("✅ Imports serializers réussis")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur import: {str(e)}")
        traceback.print_exc()
        return False

def test_database_connection():
    """Teste la connexion à la base de données."""
    print("\n=== Test connexion base de données ===")
    
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("✅ Connexion base de données OK")
        
        # Test des requêtes simples
        from membres.models import Membre
        count = Membre.objects.count()
        print(f"✅ Requête membres OK: {count} enregistrements")
        
        from cellules.models import Cellule
        count = Cellule.objects.count()
        print(f"✅ Requête cellules OK: {count} enregistrements")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur base de données: {str(e)}")
        traceback.print_exc()
        return False

def test_dashboard_view():
    """Teste spécifiquement la vue dashboard."""
    print("\n=== Test vue Dashboard ===")
    
    try:
        from membres.dashboard_views import DashboardView
        from django.contrib.auth.models import User
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request
        
        # Créer une requête factice
        factory = APIRequestFactory()
        request = factory.get('/api/dashboard/')
        
        # Utiliser un utilisateur existant
        user = User.objects.first()
        if not user:
            print("❌ Aucun utilisateur trouvé")
            return False
            
        request.user = user
        drf_request = Request(request)
        
        # Tester la vue
        view = DashboardView()
        response = view.get(drf_request)
        
        print(f"✅ Dashboard view OK: status {response.status_code}")
        if response.status_code == 200:
            data = response.data
            print(f"✅ Données retournées: {list(data.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur dashboard view: {str(e)}")
        traceback.print_exc()
        return False

def test_cache_configuration():
    """Teste la configuration du cache."""
    print("\n=== Test configuration cache ===")
    
    try:
        from django.core.cache import cache
        
        # Test écriture/lecture
        test_key = 'test_502_diagnosis'
        test_value = f'test_value_{datetime.now().isoformat()}'
        
        cache.set(test_key, test_value, 60)
        retrieved = cache.get(test_key)
        
        if retrieved == test_value:
            print("✅ Cache configuration OK")
            cache.delete(test_key)
            return True
        else:
            print(f"❌ Cache erreur: attendu {test_value}, reçu {retrieved}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur cache: {str(e)}")
        traceback.print_exc()
        return False

def test_urls_configuration():
    """Teste la configuration des URLs."""
    print("\n=== Test configuration URLs ===")
    
    try:
        from django.urls import reverse
        from django.test import Client
        
        # Test résolution des URLs
        dashboard_url = reverse('dashboard')
        print(f"✅ URL dashboard: {dashboard_url}")
        
        # Test client Django
        client = Client()
        
        # Créer un utilisateur de test si nécessaire
        from django.contrib.auth.models import User
        user = User.objects.first()
        if not user:
            print("❌ Aucun utilisateur pour tester les URLs")
            return False
        
        client.force_login(user)
        
        # Test de l'endpoint dashboard
        response = client.get('/api/dashboard/')
        print(f"✅ Test endpoint dashboard: {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur URLs: {str(e)}")
        traceback.print_exc()
        return False

def check_port_usage():
    """Vérifie l'utilisation du port 8000."""
    print("\n=== Vérification port 8000 ===")
    
    try:
        import socket
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 8000))
        sock.close()
        
        if result == 0:
            print("⚠️ Port 8000 déjà utilisé")
            return False
        else:
            print("✅ Port 8000 disponible")
            return True
            
    except Exception as e:
        print(f"❌ Erreur vérification port: {str(e)}")
        return False

def diagnose_system():
    """Diagnostic système complet."""
    print("DIAGNOSTIC COMPLET - Erreur 502 Bad Gateway")
    print("=" * 60)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Python: {sys.version}")
    print()
    
    tests = [
        ("Imports Django", test_django_imports),
        ("Connexion BD", test_database_connection),
        ("Vue Dashboard", test_dashboard_view),
        ("Configuration Cache", test_cache_configuration),
        ("Configuration URLs", test_urls_configuration),
        ("Utilisation Port", check_port_usage),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur inattendue dans {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DU DIAGNOSTIC")
    print("=" * 60)
    
    failed_tests = []
    for test_name, result in results:
        status = "✅ OK" if result else "❌ ÉCHEC"
        print(f"{test_name:20} : {status}")
        if not result:
            failed_tests.append(test_name)
    
    # Recommandations
    print(f"\nTests échoués: {len(failed_tests)}/{len(results)}")
    
    if failed_tests:
        print("\n🔧 RECOMMANDATIONS:")
        for test in failed_tests:
            if "Imports" in test:
                print("   - Vérifiez les dépendances: pip install -r requirements.txt")
                print("   - Vérifiez la configuration PYTHONPATH")
            elif "Connexion BD" in test:
                print("   - Vérifiez que la base de données existe")
                print("   - Exécutez: python manage.py migrate")
            elif "Vue Dashboard" in test:
                print("   - Vérifiez le fichier membres/dashboard_views.py")
                print("   - Vérifiez les imports et la syntaxe")
            elif "Cache" in test:
                print("   - Vérifiez la configuration CACHES dans settings.py")
            elif "URLs" in test:
                print("   - Vérifiez les fichiers urls.py")
                print("   - Vérifiez l'inclusion des dashboard_urls")
            elif "Port" in test:
                print("   - Arrêtez les autres processus sur le port 8000")
                print("   - Utilisez: netstat -ano | findstr :8000")
    else:
        print("\n✅ Tous les tests sont OK!")
        print("Le problème 502 est probablement lié à:")
        print("   1. Le serveur n'est pas démarré")
        print("   2. Problème de proxy/firewall")
        print("   3. Configuration du frontend")
    
    return len(failed_tests) == 0

if __name__ == '__main__':
    diagnose_system()
