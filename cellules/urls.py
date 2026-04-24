from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CelluleViewSet

router = DefaultRouter()
router.register(r'cellules', CelluleViewSet, basename='cellule')

urlpatterns = [
    path('', include(router.urls)),
]