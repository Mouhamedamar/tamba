#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from users.models import User
u, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@test.com'})
u.set_password('admin123')
u.is_staff = True
u.is_superuser = True
u.save()
print(f"User 'admin' {'created' if created else 'updated'} with password 'admin123'")