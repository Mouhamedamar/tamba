#!/usr/bin/env python
"""
Script de démarrage robuste pour le serveur Django.
Résout les problèmes d'erreur 502 Bad Gateway.
"""
import os
import sys
import subprocess
import time
import signal
from datetime import datetime

def check_django_setup():
    """Vérifie que Django est correctement configuré."""
    print("🔍 Vérification de la configuration Django...")
    
    try:
        # Configuration
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
        
        # Test imports
        import django
        django.setup()
        
        # Test base de données
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Test modèles
        from membres.models import Membre
        from cellules.models import Cellule
        from users.models import User
        
        print("✅ Configuration Django validée")
        return True
        
    except Exception as e:
        print(f"❌ Erreur configuration: {str(e)}")
        return False

def run_migrations():
    """Exécute les migrations si nécessaire."""
    print("🔄 Vérification des migrations...")
    
    try:
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate', '--check'
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print("📦 Application des migrations...")
            subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
            print("✅ Migrations appliquées")
        else:
            print("✅ Migrations à jour")
            
    except Exception as e:
        print(f"❌ Erreur migrations: {str(e)}")
        return False
    
    return True

def collect_static():
    """Collecte les fichiers statiques."""
    print("📁 Collecte des fichiers statiques...")
    
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'collectstatic', '--noinput'
        ], check=True, capture_output=True)
        print("✅ Fichiers statiques collectés")
        return True
        
    except Exception as e:
        print(f"⚠️ Erreur statiques (non critique): {str(e)}")
        return True  # Non critique pour le fonctionnement

def start_server():
    """Démarre le serveur Django."""
    print("🚀 Démarrage du serveur Django...")
    
    try:
        # Tuer les processus existants sur le port 8000
        try:
            if os.name == 'nt':  # Windows
                subprocess.run([
                    'netstat', '-ano', '|', 'findstr', ':8000'
                ], shell=True, capture_output=True)
            else:  # Linux/Mac
                subprocess.run([
                    'lsof', '-ti', ':8000'
                ], capture_output=True)
        except:
            pass
        
        # Démarrer le serveur
        print("🌐 Serveur démarré sur http://localhost:8000")
        print("📊 Dashboard: http://localhost:8000/api/dashboard/")
        print("📖 Documentation: http://localhost:8000/swagger/")
        print("\n⏹️  Arrêt: Ctrl+C")
        
        # Démarrer avec options optimisées
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', 
            '0.0.0.0:8000', 
            '--noreload',
            '--settings=tamba_politique.settings'
        ], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur")
    except Exception as e:
        print(f"❌ Erreur démarrage: {str(e)}")
        return False
    
    return True

def main():
    """Fonction principale."""
    print("=" * 60)
    print("🚀 DÉMARRAGE SERVEUR DJANGO - Tamba Politique")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🐍 Python: {sys.version}")
    print()
    
    # Étapes de démarrage
    steps = [
        ("Configuration Django", check_django_setup),
        ("Migrations", run_migrations),
        ("Fichiers statiques", collect_static),
        ("Démarrage serveur", start_server),
    ]
    
    for step_name, step_func in steps:
        print(f"\n🔧 {step_name}...")
        if not step_func():
            print(f"❌ Échec à l'étape: {step_name}")
            sys.exit(1)
    
    print("\n✅ Serveur arrêté avec succès")

if __name__ == '__main__':
    main()
