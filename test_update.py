import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from membres.models import Membre

User = get_user_model()
admin = User.objects.filter(is_active=True).first()
client = APIClient()
client.force_authenticate(user=admin)

try:
    membre = Membre.objects.first()
    if not membre:
        print("No membres found.")
    else:
        print(f"Testing update on membre {membre.id}: {membre.nom} {membre.prenom}")
        original_quartier = membre.quartier
        new_quartier = original_quartier + "_test" if original_quartier else "TEST_QUARTIER"
        
        url = f'/api/membres/{membre.id}/'
        payload = {
            'quartier': new_quartier,
            'nom': membre.nom,
            'prenom': membre.prenom,
            'telephone': membre.telephone,
        }
        
        response = client.patch(url, payload, format='json')
        print(f"Patch status: {response.status_code}")
        
        # Verify in DB
        membre.refresh_from_db()
        if membre.quartier == new_quartier:
            print("SUCCESS: Modification saved to DB!")
        else:
            print("FAILED: Modification NOT saved to DB!")
            
        # Revert changes
        membre.quartier = original_quartier
        membre.save()
        
except Exception as e:
    print(traceback.format_exc())
