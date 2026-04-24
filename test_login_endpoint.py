#!/usr/bin/env python
"""
Script de test pour l'endpoint de login
Identifie et résout les problèmes d'authentification 401
"""
import os
import sys
import json
import requests

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"

def test_login_endpoint():
    """Test l'endpoint de login avec différentes méthodes"""
    
    print("=== Test de l'endpoint de login ===")
    print(f"URL: {LOGIN_URL}")
    
    # Test 1: Vérifier que le serveur est accessible
    print("\n1. Test de connexion au serveur...")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   Serveur accessible")
        else:
            print(f"   Problème serveur: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ERREUR: Serveur non accessible")
        print("   Solution: Démarrez Django avec 'python manage.py runserver'")
        return False
    
    # Test 2: Test POST sans données
    print("\n2. Test POST sans données...")
    try:
        response = requests.post(LOGIN_URL, {}, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Erreur: {str(e)}")
    
    # Test 3: Test avec identifiants invalides
    print("\n3. Test avec identifiants invalides...")
    invalid_data = {
        "username": "utilisateur_inexistant",
        "password": "mauvais_mot_de_passe"
    }
    try:
        response = requests.post(LOGIN_URL, invalid_data, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        if response.status_code == 400:
            print("   Comportement normal: identifiants invalides")
    except Exception as e:
        print(f"   Erreur: {str(e)}")
    
    # Test 4: Vérifier les utilisateurs existants
    print("\n4. Vérification des utilisateurs existants...")
    try:
        # Configuration Django pour accéder aux modèles
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
        import django
        django.setup()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        users = User.objects.all()
        print(f"   Nombre d'utilisateurs: {users.count()}")
        
        for user in users[:3]:  # Limiter à 3 utilisateurs
            print(f"   - {user.username} (actif: {user.is_active})")
            
            # Test avec chaque utilisateur
            print(f"   Test login avec {user.username}...")
            test_data = {
                "username": user.username,
                "password": "password123"  # Mot de passe par défaut
            }
            
            try:
                response = requests.post(LOGIN_URL, test_data, timeout=5)
                print(f"     Status: {response.status_code}")
                if response.status_code == 200:
                    print("     SUCCESS: Login réussi!")
                    return True
                elif response.status_code == 400:
                    print("     Échec: Mot de passe probablement incorrect")
                else:
                    print(f"     Inattendu: {response.status_code}")
            except Exception as e:
                print(f"     Erreur: {str(e)}")
        
    except Exception as e:
        print(f"   Erreur Django: {str(e)}")
        print("   Solution: Vérifiez que Django est correctement configuré")
    
    return False

def create_test_user():
    """Crée un utilisateur de test si nécessaire"""
    print("\n=== Création utilisateur de test ===")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
        import django
        django.setup()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Créer utilisateur de test
        if not User.objects.filter(username='testuser').exists():
            user = User.objects.create_user(
                username='testuser',
                email='test@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User',
                role='admin'
            )
            print("Utilisateur de test créé:")
            print("  Username: testuser")
            print("  Password: testpass123")
            print("  Role: admin")
        else:
            print("Utilisateur de test existe déjà")
            
        return True
        
    except Exception as e:
        print(f"Erreur création utilisateur: {str(e)}")
        return False

def main():
    """Fonction principale"""
    print("DIAGNOSTIC - Erreur 401 Unauthorized Login")
    print("=" * 50)
    
    # Étape 1: Tester l'endpoint
    if not test_login_endpoint():
        print("\nProblème détecté avec l'endpoint de login")
        
        # Étape 2: Créer utilisateur de test
        if create_test_user():
            print("\nUtilisateur de test créé, testez avec:")
            print("  Username: testuser")
            print("  Password: testpass123")
            
            # Retester
            test_login_endpoint()
    
    print("\n=== Solutions possibles ===")
    print("1. Si serveur inaccessible:")
    print("   python manage.py runserver 0.0.0.0:8000")
    print("\n2. Si aucun utilisateur existe:")
    print("   python manage.py createsuperuser")
    print("\n3. Si mot de passe incorrect:")
    print("   Utilisez l'utilisateur de test créé ci-dessus")
    print("\n4. Si erreur 401 persiste:")
    print("   Vérifiez la configuration JWT dans settings.py")
    print("   Vérifiez les permissions dans les views.py")

if __name__ == '__main__':
    main()
