#!/usr/bin/env python
import requests
import json
import sys

BASE = 'http://127.0.0.1:8000'

print("=== TESTING ALL API ENDPOINTS ===\n")

# 1. Register
print("[1] POST /api/auth/register/")
try:
    r = requests.post(f'{BASE}/api/auth/register/', json={
        'username': 'testuser',
        'email': 'test@test.com',
        'password': 'test123',
        'first_name': 'Test',
        'last_name': 'User'
    }, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 201:
        print(f"    OK - User created")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    Error: {e}")
    sys.exit(1)

# 2. Login
print("\n[2] POST /api/auth/login/")
try:
    r = requests.post(f'{BASE}/api/auth/login/', json={
        'username': 'testuser',
        'password': 'test123'
    }, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        token = data.get('access', '')
        print(f"    OK - Token obtained")
    else:
        print(f"    Response: {r.text[:200]}")
        token = ''
except Exception as e:
    print(f"    Error: {e}")
    sys.exit(1)

if not token:
    print("    No token - stopping tests")
    sys.exit(1)

headers = {'Authorization': f'Bearer {token}'}

# 3. Me
print("\n[3] GET /api/auth/me/")
try:
    r = requests.get(f'{BASE}/api/auth/me/', headers=headers, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        print(f"    OK - {r.json().get('username')}")
except Exception as e:
    print(f"    Error: {e}")

# 4. Cellules - List
print("\n[4] GET /api/cellules/")
try:
    r = requests.get(f'{BASE}/api/cellules/', headers=headers, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        print(f"    OK - count: {r.json().get('count', 0)}")
except Exception as e:
    print(f"    Error: {e}")

# 5. Cellules - Create
print("\n[5] POST /api/cellules/")
try:
    r = requests.post(f'{BASE}/api/cellules/', headers=headers, json={
        'nom': 'Cellule Test',
        'description': 'Description test'
    }, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 201:
        print(f"    OK - Cellule created")
except Exception as e:
    print(f"    Error: {e}")

# 6. Membres - List
print("\n[6] GET /api/membres/")
try:
    r = requests.get(f'{BASE}/api/membres/', headers=headers, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        print(f"    OK - count: {r.json().get('count', 0)}")
except Exception as e:
    print(f"    Error: {e}")

# 7. Dashboard
print("\n[7] GET /api/dashboard/")
try:
    r = requests.get(f'{BASE}/api/dashboard/', headers=headers, timeout=5)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        print(f"    OK - {r.json()}")
except Exception as e:
    print(f"    Error: {e}")

print("\n=== ALL TESTS COMPLETED ===")