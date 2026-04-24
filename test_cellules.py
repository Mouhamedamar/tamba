import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

error_found = False
with open('cellules_test.txt', 'w', encoding='utf-8') as f:
    for user in User.objects.all():
        client.force_authenticate(user=user)
        try:
            response = client.get('/api/cellules/')
            f.write(f"User: {user.username}, is_responsable: {getattr(user, 'is_responsable', 'None')}, Status: {response.status_code}\n")
            if response.status_code >= 500:
                f.write("500 Error Body: " + response.content.decode('utf-8', errors='ignore') + "\n")
                error_found = True
        except Exception as e:
            f.write(f"User: {user.username} raised Exception:\n{traceback.format_exc()}\n")
            error_found = True

print(f"Test completed. Error found: {error_found}")
