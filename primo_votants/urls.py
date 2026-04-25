from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrimoVotantViewSet

router = DefaultRouter()
router.register(r"primo-votants", PrimoVotantViewSet, basename="primo-votant")

urlpatterns = [path("", include(router.urls))]
