#!/usr/bin/env python
\"""Script to create test data for dev: cellule, users, membre.""""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from django.contrib.auth import get_user_model
from cellules.models import Cellule
from membres.models import Membre
from django.db.utils import IntegrityError

User = get_user_model()

def create_test_data():
    print("Creating test data...")
    
    # Test Cellule 1
    cellule, created = Cellule.objects.get_or_create(
        nom_cellule='Test Cellule 1',
        defaults={
            'description': 'Test cellule for dev',
            'quartier': 'Test Quartier',
            'commune': 'Tambacounda',
            'departement': 'Tambacounda',
            'couleur': '#3B82F6',
        }
    )
    print(f"Cellule: {cellule} (created={created})")
    
    # Superuser
    if not User.objects.filter(username='superuser').exists():
        superuser = User.objects.create_superuser('superuser', 'super@test.com', 'super123')
        superuser.role = 'admin'
        superuser.save()
        print("Created superuser/super123 (admin)")
    
    # Test Agent
    agent, created = User.objects.get_or_create(
        username='testagent',
        defaults={
            'email': 'agent@test.com',
            'password': User.objects.make_random_password(),
            'first_name': 'Test',
            'last_name': 'Agent',
            'role': 'agent',
            'telephone': '22177777777',
            'cellule': cellule,
        }
    )
    agent.set_password('agent123')
    agent.save()
    print(f"Agent: testagent/agent123 (role=agent, cellule={cellule}) (created={created})")
    
    # Test Responsable
    resp, created = User.objects.get_or_create(
        username='testresp',
        defaults={
            'email': 'resp@test.com',
            'password': User.objects.make_random_password(),
            'first_name': 'Test',
            'last_name': 'Responsable',
            'role': 'responsable',
            'telephone': '22188888888',
            'cellule': cellule,
        }
    )
    resp.set_password('resp123')
    resp.save()
    cellule.responsable = resp
    cellule.save()
    print(f"Responsable: testresp/resp123 (role=responsable, cellule={cellule}) (created={created})")
    
    # Sample Membre
    membre, created = Membre.objects.get_or_create(
        nom='Test',
        prenom='Membre',
        telephone='22199999999',
        defaults={
            'quartier': 'Test Quartier',
            'cellule': cellule,
            'cree_par': agent,
            'role': 'militant',
        }
    )
    print(f"Membre: {membre} (created={created})")
    
    print("\n✅ Test data created!")
    print("Login URLs:")
    print("  - Admin: http://localhost:3000/login → superuser/super123")
    print("  - Agent: testagent/agent123")
    print("  - Resp: testresp/resp123")
    print("\nRun `python manage.py migrate` after if pending, then servers.")

if __name__ == '__main__':
    create_test_data()

