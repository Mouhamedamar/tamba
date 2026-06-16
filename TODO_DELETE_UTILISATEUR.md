# TODO - Suppression utilisateur (problème)

## Objectif
Faire en sorte que la suppression d’un utilisateur fonctionne correctement côté backend, et que le frontend affiche la bonne erreur métier.

## Constat actuel
- L’API `UserViewSet.destroy()` renvoie bien un 400 métier :
  - `"Suppression impossible (dépendances en base)."`
- Si la suppression “ne marche pas”, il est possible que l’utilisateur cible ne soit pas dans le `get_queryset()` autorisé (ex: rôle `responsable`).

## Étapes à faire
1. Vérifier le code de retour réel lors du clic suppression (404/403/400) + payload.
2. Si le code est 404/403 : ajuster la logique d’accès/scope dans `users/views.py` (notamment `get_queryset()`).
3. Ajouter/mettre à jour un traitement frontend pour afficher clairement le statut (optionnel).
4. Re-tester :
   - suppression d’un user admin
   - suppression d’un user dans la même cellule
   - suppression d’un user avec FK bloquante

## Fichiers impactés
- `users/views.py`
- (optionnel) `frontend/src/pages/Utilisateurs.jsx`

