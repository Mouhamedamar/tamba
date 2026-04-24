import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

for username in ['admin', 'testuser', 'amar']:
    try:
        u = User.objects.get(username=username)
        print(f'=== {username} ===')
        print(f'  role: {u.role}')
        print(f'  is_superuser: {u.is_superuser}')
        print(f'  is_admin: {u.is_admin}')
        print(f'  is_responsable: {u.is_responsable}')
        print(f'  is_agent: {u.is_agent}')
        print(f'  cellule: {u.cellule}')
    except:
        print(f'{username} not found')