"""
URL configuration for tamba_politique project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from rest_framework.permissions import AllowAny

schema_view = get_schema_view(
    openapi.Info(
        title="Tamba Politique API",
        default_version='v1',
        description="API de gestion des membres et cellules",
    ),
    public=True,
    permission_classes=[AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('cellules.urls')),
    path('api/', include('membres.urls')),
    path('api/dashboard/', include('membres.dashboard_urls')),
    path('api/', include('primo_votants.urls')),
    path('api/', include('activites.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
