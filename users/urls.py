from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, UserViewSet, db_status

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('db-status/', db_status, name='db-status'),
    path('login/', AuthViewSet.as_view({
        'post': 'login',
    }), name='auth-login'),
    path('register/', AuthViewSet.as_view({
        'post': 'register',
    }), name='auth-register'),
    path('logout/', AuthViewSet.as_view({
        'post': 'logout',
    }), name='auth-logout'),
    path('refresh/', AuthViewSet.as_view({
        'post': 'refresh',
    }), name='auth-refresh'),
    path('me/', AuthViewSet.as_view({
        'get': 'me',
    }), name='auth-me'),
]