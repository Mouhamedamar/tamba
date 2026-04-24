import sys
import os
import django
from django.core.management import call_command
import traceback

with open("traceback.txt", "w") as f:
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
        django.setup()
        call_command('migrate')
    except Exception:
        f.write(traceback.format_exc())

