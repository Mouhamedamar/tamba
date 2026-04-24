#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = [
    ('testresp', 'resp123'),
    ('testagent', 'agent123'),
    ('superuser', 'super123'),
    ('admin', 'admin123'),
    ('testuser', 'test123'),
    ('amar', 'amar123'),
]

for username, password in users:
    try:
        u = User.objects.get(username=username)
        u.set_password(password)
        u.save(update_fields=['password'])
        print(f"Reset {username} to {password} - Verified: {u.check_password(password)}")
    except User.DoesNotExist:
        print(f"{username} not found")

