#!/usr/bin/env python
"""
Script de monitoring des performances de l'application Tamba Politique.
Ce script analyse les requêtes lentes, l'utilisation du cache et les index de la base de données.
"""
import os
import django
import time
import sqlite3
from datetime import datetime, timedelta
from django.db import connection
from django.core.cache import cache
from django.test.utils import override_settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

def analyze_database_performance():
    """Analyse les performances de la base de données."""
    print("=== Analyse des performances de la base de données ===")
    
    try:
        # Vérifier les indexes
        with connection.cursor() as cursor:
            # Index pour les membres
            cursor.execute("PRAGMA index_list('membres');")
            membres_indexes = cursor.fetchall()
            print(f"\nIndexes sur la table 'membres': {len(membres_indexes)}")
            for idx in membres_indexes:
                print(f"  - {idx[1]} (unique: {idx[2]})")
            
            # Index pour les users
            cursor.execute("PRAGMA index_list('users');")
            users_indexes = cursor.fetchall()
            print(f"\nIndexes sur la table 'users': {len(users_indexes)}")
            for idx in users_indexes:
                print(f"  - {idx[1]} (unique: {idx[2]})")
            
            # Statistiques des tables
            cursor.execute("SELECT COUNT(*) FROM membres WHERE is_deleted = 0;")
            membres_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1;")
            users_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM cellules WHERE actif = 1;")
            cellules_count = cursor.fetchone()[0]
            
            print(f"\nStatistiques des données:")
            print(f"  - Membres actifs: {membres_count}")
            print(f"  - Utilisateurs actifs: {users_count}")
            print(f"  - Cellules actives: {cellules_count}")
            
    except Exception as e:
        print(f"Erreur lors de l'analyse de la base de données: {e}")
        return False
    
    return True

def test_cache_performance():
    """Test les performances du cache."""
    print("\n=== Test des performances du cache ===")
    
    try:
        # Test d'écriture/lecture dans le cache
        start_time = time.time()
        
        # Écriture
        cache.set('test_key', 'test_value', 60)
        write_time = time.time() - start_time
        
        # Lecture
        start_time = time.time()
        value = cache.get('test_key')
        read_time = time.time() - start_time
        
        print(f"Écriture cache: {write_time:.4f}s")
        print(f"Lecture cache: {read_time:.4f}s")
        print(f"Valeur récupérée: {value}")
        
        # Nettoyer
        cache.delete('test_key')
        
        # Test avec des données plus volumineuses
        from membres.models import Membre
        start_time = time.time()
        membres = list(Membre.objects.filter(is_deleted=False)[:10].values())
        db_time = time.time() - start_time
        
        # Mettre en cache
        start_time = time.time()
        cache.set('membres_list', membres, 60)
        cache_write_time = time.time() - start_time
        
        # Lire depuis le cache
        start_time = time.time()
        cached_membres = cache.get('membres_list')
        cache_read_time = time.time() - start_time
        
        print(f"\nRequête base de données (10 membres): {db_time:.4f}s")
        print(f"Écriture cache (10 membres): {cache_write_time:.4f}s")
        print(f"Lecture cache (10 membres): {cache_read_time:.4f}s")
        print(f"Gain de performance: {((db_time - cache_read_time) / db_time * 100):.1f}%")
        
        cache.delete('membres_list')
        
    except Exception as e:
        print(f"Erreur lors du test de cache: {e}")
        return False
    
    return True

def test_api_endpoints():
    """Test les performances des endpoints API."""
    print("\n=== Test des performances des endpoints API ===")
    
    try:
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request
        from django.contrib.auth.models import User
        from cellules.views import CelluleViewSet
        from membres.views import MembreViewSet
        from users.views import UserViewSet
        
        factory = APIRequestFactory()
        
        # Créer un utilisateur de test
        user = User.objects.filter(is_staff=True).first()
        if not user:
            print("Aucun utilisateur admin trouvé pour les tests")
            return False
        
        # Test endpoint cellules
        start_time = time.time()
        request = factory.get('/api/cellules/')
        request.user = user
        view = CelluleViewSet.as_view({'get': 'list'})
        response = view(request)
        cellules_time = time.time() - start_time
        print(f"GET /api/cellules/: {cellules_time:.4f}s ({response.status_code})")
        
        # Test endpoint membres
        start_time = time.time()
        request = factory.get('/api/membres/')
        request.user = user
        view = MembreViewSet.as_view({'get': 'list'})
        response = view(request)
        membres_time = time.time() - start_time
        print(f"GET /api/membres/: {membres_time:.4f}s ({response.status_code})")
        
        # Test endpoint users
        start_time = time.time()
        request = factory.get('/api/auth/users/')
        request.user = user
        view = UserViewSet.as_view({'get': 'list'})
        response = view(request)
        users_time = time.time() - start_time
        print(f"GET /api/auth/users/: {users_time:.4f}s ({response.status_code})")
        
        # Évaluation des performances
        total_time = cellules_time + membres_time + users_time
        print(f"\nTemps total des 3 endpoints: {total_time:.4f}s")
        
        if total_time < 0.5:
            print("✅ Performance excellente")
        elif total_time < 1.0:
            print("✅ Performance bonne")
        elif total_time < 2.0:
            print("⚠️ Performance moyenne")
        else:
            print("❌ Performance faible - optimisation nécessaire")
            
    except Exception as e:
        print(f"Erreur lors du test des endpoints: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def analyze_query_patterns():
    """Analyse les patterns de requêtes."""
    print("\n=== Analyse des patterns de requêtes ===")
    
    try:
        from django.db import connection
        from django.test.utils import override_settings
        
        # Activer le logging des requêtes
        with override_settings(DEBUG=True):
            # Réinitialiser les logs de requêtes
            connection.queries_log.clear()
            
            # Simuler des requêtes typiques
            from membres.models import Membre
            from cellules.models import Cellule
            from users.models import User
            
            # Requêtes fréquentes
            list(Membre.objects.filter(is_deleted=False).select_related('cellule')[:10])
            list(Cellule.objects.filter(actif=True).select_related('responsable'))
            list(User.objects.filter(is_active=True).order_by('-date_joined')[:10])
            
            # Analyser les requêtes exécutées
            queries = connection.queries
            print(f"Nombre de requêtes exécutées: {len(queries)}")
            
            total_time = sum(float(q['time']) for q in queries)
            print(f"Temps total d'exécution: {total_time:.4f}s")
            
            # Identifier les requêtes lentes
            slow_queries = [q for q in queries if float(q['time']) > 0.01]
            if slow_queries:
                print(f"\nRequêtes lentes (>0.01s): {len(slow_queries)}")
                for q in slow_queries:
                    print(f"  - {q['time']}s: {q['sql'][:100]}...")
            
            # Vérifier les N+1 queries
            select_related_count = sum(1 for q in queries if 'JOIN' in q['sql'].upper())
            print(f"\nRequêtes avec JOIN (optimisées): {select_related_count}/{len(queries)}")
            
            if select_related_count < len(queries) / 2:
                print("⚠️ Possible problème N+1 queries détecté")
            else:
                print("✅ Bonne utilisation des SELECT_related/PREFETCH_related")
                
    except Exception as e:
        print(f"Erreur lors de l'analyse des requêtes: {e}")
        return False
    
    return True

def generate_performance_report():
    """Génère un rapport de performance complet."""
    print("Rapport de Performance - Tamba Politique")
    print("=" * 50)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Base de données", analyze_database_performance),
        ("Cache", test_cache_performance),
        ("API Endpoints", test_api_endpoints),
        ("Patterns de requêtes", analyze_query_patterns),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"Erreur inattendue dans {test_name}: {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 50)
    print("RÉSUMÉ DES PERFORMANCES")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ OK" if result else "❌ ÉCHEC"
        print(f"{test_name:20} : {status}")
    
    success_count = sum(1 for _, result in results if result)
    print(f"\nTests réussis: {success_count}/{len(results)} ({success_count/len(results)*100:.0f}%)")
    
    # Recommandations
    print("\nRECOMMANDATIONS:")
    if success_count == len(results):
        print("✅ Tous les tests de performance sont OK!")
        print("   - L'application est bien optimisée")
        print("   - Continuez à surveiller les performances")
    else:
        print("⚠️ Des optimisations sont nécessaires:")
        failed_tests = [name for name, result in results if not result]
        for test in failed_tests:
            if "Base de données" in test:
                print("   - Ajoutez les indexes manquants")
                print("   - Optimisez les requêtes fréquentes")
            elif "Cache" in test:
                print("   - Vérifiez la configuration du cache")
                print("   - Augmentez la durée du cache si nécessaire")
            elif "API" in test:
                print("   - Optimisez les vues lentes")
                print("   - Ajoutez plus de cache")
            elif "Requêtes" in test:
                print("   - Corrigez les problèmes N+1 queries")
                print("   - Utilisez select_related/prefetch_related")
    
    return success_count == len(results)

if __name__ == '__main__':
    generate_performance_report()
