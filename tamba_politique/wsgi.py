"""
WSGI config for tamba_politique project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tamba_politique.settings')
application = get_wsgi_application()