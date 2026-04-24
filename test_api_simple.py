#!/usr/bin/env python
import os
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

def test_api_endpoints():
    """Tester les endpoints API de base."""
    base_url = "http://localhost:8000/api"
    
    endpoints = [
        "/cellules/",
        "/membres/",
        "/auth/users/",
        "/dashboard/"
    ]
    
    print("Test des endpoints API...")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            url = base_url + endpoint
            print(f"\nTest: {url}")
            
            response = requests.get(url, timeout=5)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    print(f"Keys: {list(data.keys())}")
                elif isinstance(data, list):
                    print(f"Count: {len(data)}")
                    if data:
                        print(f"First item keys: {list(data[0].keys())}")
                print("OK")
            else:
                print(f"ERROR: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            print("ERROR: Connexion refusée - serveur probablement pas démarré")
        except requests.exceptions.Timeout:
            print("ERROR: Timeout - serveur lent ou indisponible")
        except Exception as e:
            print(f"ERROR: {str(e)}")
    
    print("\n" + "=" * 50)

if __name__ == '__main__':
    test_api_endpoints()
