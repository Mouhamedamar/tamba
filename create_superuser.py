import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')

print("Setting up Django...", file=sys.stderr)
django.setup()

from users.models import User
from django.contrib.auth.management import create_permissions

# Ensure permissions are created
for app_config in django.apps.apps.get_app_configs():
    create_permissions(app_config, None, 1)

username = 'mouha'
password = 'mouha123'
email = 'mouha@test.com'

print(f"Creating user '{username}'...", file=sys.stderr)
try:
    user = User.objects.get(username=username)
    print(f"User '{username}' already exists", file=sys.stderr)
except Exception as e:
    print(f"Error getting user: {e}", file=sys.stderr)
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True
        )
        print(f"Superuser '{username}' created with password '{password}'", file=sys.stderr)
    except Exception as e2:
        print(f"Error creating user: {e2}", file=sys.stderr)