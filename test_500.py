import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

try:
    User = get_user_model()
    user = User.objects.filter(is_active=True).first()
    
    if not user:
        print("No user found in DB!")
    else:
        client = APIClient()
        client.force_authenticate(user=user)
        
        print(f"Testing with user: {user.username}")
        try:
            response = client.get('/api/membres/?page=1')
            print(f"Status Membres: {response.status_code}")
            with open('test_out_auth.txt', 'w', encoding='utf-8') as f:
                f.write(response.content.decode('utf-8', errors='ignore'))
        except Exception as e:
            with open('test_out_auth.txt', 'w', encoding='utf-8') as f:
                f.write("Exception inside view Membres:\n" + traceback.format_exc())

        try:
            response2 = client.get('/api/cellules/')
            print(f"Status Cellules: {response2.status_code}")
            with open('test_out_auth_cellules.txt', 'w', encoding='utf-8') as f:
                f.write(response2.content.decode('utf-8', errors='ignore'))
        except Exception as e:
            with open('test_out_auth_cellules.txt', 'w', encoding='utf-8') as f:
                f.write("Exception inside view Cellules:\n" + traceback.format_exc())

except Exception as e:
    print("Fatal setup error:")
    print(traceback.format_exc())
