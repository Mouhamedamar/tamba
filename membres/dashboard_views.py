from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from calendar import monthrange

from .models import Membre
from cellules.models import Cellule
from users.models import User


class DashboardView(APIView):
    """Vue pour le dashboard."""

    permission_classes = [IsAuthenticated]

    def _build_evolution_inscriptions(self, base_qs, thirty_days_ago, now):
        """
        Retourne une serie continue sur 30 jours avec des dates ISO string.
        Evite le melange datetime.date / str qui casse le tri.
        """
        evolution_base = (
            base_qs
            .filter(date_inscription__gte=thirty_days_ago)
            .annotate(date=TruncDate('date_inscription'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        evolution_map = {}
        for item in evolution_base:
            date_value = item.get('date')
            if date_value:
                evolution_map[date_value.isoformat()] = item.get('count', 0)

        evolution_list = []
        current_date = thirty_days_ago.date()
        while current_date <= now.date():
            date_str = current_date.isoformat()
            evolution_list.append({
                'date': date_str,
                'count': evolution_map.get(date_str, 0)
            })
            current_date += timedelta(days=1)

        return evolution_list

    def get(self, request):
        user = request.user
        
        total_membres = 0
        total_cellules = 0
        membres_actifs = 0
        nouveaux_ce_mois = 0
        membres_par_cellule = []
        evolution_inscriptions = []
        growth_rate = 0
        avg_daily_inscriptions = 0
        responsables_count = 0
        electeurs_percent = 0
        top_quartiers = []
        completion_score = 0
        
        # Calculer les statistiques générales
        now = timezone.now()
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)
        
        if user.is_admin:
            base_qs = Membre.objects.filter(is_deleted=False)
            total_membres = base_qs.count()
            
            # Membres par cellule with real colors
            cellule_stats = list(
                base_qs.values('cellule__nom_cellule', 'cellule__couleur', 'cellule__quartier')
                .annotate(count=Count('id'))
                .order_by('-count')[:10]
            )
            membres_par_cellule = [{'cellule__nom_cellule': s['cellule__nom_cellule'], 
                                   'cellule__couleur': s['cellule__couleur'] or '#3B82F6', 
                                   'count': s['count']} for s in cellule_stats]
            
            total_cellules = Cellule.objects.filter(actif=True).count()
            membres_actifs = total_membres
            nouveaux_ce_mois = base_qs.filter(date_inscription__gte=first_day_of_month).count()
            
            # Growth rate
            prev_period = base_qs.filter(date_inscription__gte=sixty_days_ago, date_inscription__lt=thirty_days_ago).count()
            current_period = nouveaux_ce_mois + base_qs.filter(date_inscription__gte=thirty_days_ago, date_inscription__lt=first_day_of_month).count()
            growth_rate = ((current_period - prev_period) / prev_period * 100) if prev_period > 0 else 0
            
            # Avg daily
            thirty_days_count = base_qs.filter(date_inscription__gte=thirty_days_ago).count()
            avg_daily_inscriptions = thirty_days_count / 30
            
            # Responsables
            responsables_count = User.objects.filter(role='responsable').count()
            
            # Electeurs %
            electeurs = base_qs.filter(inscrit_liste_electorale=True).count()
            electeurs_percent = (electeurs / total_membres * 100) if total_membres > 0 else 0
            
            # Top quartiers
            top_quartiers = list(
                base_qs.values('quartier')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )
            
            # Completion score
            completion_fields = base_qs.filter(numero_identification__isnull=False, numero_carte_electeur__isnull=False).count()
            completion_score = (completion_fields / total_membres * 100) if total_membres > 0 else 0
            
            evolution_inscriptions = self._build_evolution_inscriptions(base_qs, thirty_days_ago, now)
            
        elif user.is_responsable and user.cellule:
            base_qs = Membre.objects.filter(is_deleted=False, cellule=user.cellule)
            total_membres = base_qs.count()
            
            membres_par_cellule = [{
                'cellule__nom_cellule': user.cellule.nom_cellule,
                'cellule__couleur': user.cellule.couleur,
                'count': total_membres
            }]
            
            total_cellules = 1
            membres_actifs = total_membres
            nouveaux_ce_mois = base_qs.filter(date_inscription__gte=first_day_of_month).count()
            
            thirty_days_count = base_qs.filter(date_inscription__gte=thirty_days_ago).count()
            prev_period = base_qs.filter(date_inscription__gte=sixty_days_ago, date_inscription__lt=thirty_days_ago).count()
            current_period = nouveaux_ce_mois + base_qs.filter(date_inscription__gte=thirty_days_ago, date_inscription__lt=first_day_of_month).count()
            growth_rate = ((current_period - prev_period) / prev_period * 100) if prev_period > 0 else 0
            avg_daily_inscriptions = thirty_days_count / 30
            responsables_count = 1  # Self
            electeurs = base_qs.filter(inscrit_liste_electorale=True).count()
            electeurs_percent = (electeurs / total_membres * 100) if total_membres > 0 else 0
            completion_fields = base_qs.filter(numero_identification__isnull=False, numero_carte_electeur__isnull=False).count()
            completion_score = (completion_fields / total_membres * 100) if total_membres > 0 else 0
            
            evolution_inscriptions = self._build_evolution_inscriptions(base_qs, thirty_days_ago, now)
            
        elif user.is_agent:
            if user.cellule:
                base_qs = Membre.objects.filter(is_deleted=False, cellule=user.cellule)
                total_membres = base_qs.count()
                
                membres_par_cellule = [{
                    'cellule__nom_cellule': user.cellule.nom_cellule,
                    'cellule__couleur': user.cellule.couleur,
                    'count': total_membres
                }]
                
                total_cellules = 1
                membres_actifs = total_membres
                nouveaux_ce_mois = base_qs.filter(date_inscription__gte=first_day_of_month).count()
                
                thirty_days_count = base_qs.filter(date_inscription__gte=thirty_days_ago).count()
                prev_period = base_qs.filter(date_inscription__gte=sixty_days_ago, date_inscription__lt=thirty_days_ago).count()
                current_period = nouveaux_ce_mois + base_qs.filter(date_inscription__gte=thirty_days_ago, date_inscription__lt=first_day_of_month).count()
                growth_rate = ((current_period - prev_period) / prev_period * 100) if prev_period > 0 else 0
                avg_daily_inscriptions = thirty_days_count / 30
                responsables_count = User.objects.filter(cellule=user.cellule, role='responsable').count()
                electeurs = base_qs.filter(inscrit_liste_electorale=True).count()
                electeurs_percent = (electeurs / total_membres * 100) if total_membres > 0 else 0
                completion_fields = base_qs.filter(numero_identification__isnull=False, numero_carte_electeur__isnull=False).count()
                completion_score = (completion_fields / total_membres * 100) if total_membres > 0 else 0
                
                evolution_inscriptions = self._build_evolution_inscriptions(base_qs, thirty_days_ago, now)
        
        return Response({
            'user_role': 'admin' if user.is_superuser else user.role,
            'user_name': user.get_full_name() or user.username,
            'user_cellule': user.cellule.nom_cellule if user.cellule else None,
            'total_membres': total_membres,
            'total_cellules': total_cellules,
            'membres_actifs': membres_actifs,
            'nouveaux_ce_mois': nouveaux_ce_mois,
            'growth_rate': round(growth_rate, 2),
            'avg_daily_inscriptions': round(avg_daily_inscriptions, 1),
            'responsables_count': responsables_count,
            'electeurs_percent': round(electeurs_percent, 1),
            'top_quartiers': top_quartiers,
            'completion_score': round(completion_score, 1),
            'membres_par_cellule': membres_par_cellule,
            'evolution_inscriptions': evolution_inscriptions,
        })
