# Correction du problème de perte de données lors de la modification des membres

## Problème identifié

Lors de la modification d'un membre, certaines informations étaient automatiquement supprimées ou perdues.

## Causes du problème

1. **Serializer incorrect** : Utilisation de `MembreCreateSerializer` pour les mises à jour
2. **Champs en read-only** : Certains champs ne pouvaient pas être modifiés
3. **Validation incomplète** : Gestion incorrecte des valeurs vides/nulles

## Corrections apportées

### 1. Correction du serializer pour les mises à jour

**Avant :**
```python
if self.action in ['create', 'update', 'partial_update']:
    return MembreCreateSerializer
```

**Après :**
```python
if self.action == 'create':
    return MembreCreateSerializer
if self.action in ['update', 'partial_update']:
    return MembreSerializer
```

### 2. Ajout de champs read-only explicites

**Avant :**
```python
read_only_fields = ['id', 'date_inscription', 'cree_par', 'is_deleted']
```

**Après :**
```python
read_only_fields = ['id', 'date_inscription', 'cree_par', 'is_deleted', 
                   'full_name', 'cellule_nom', 'cree_par_nom']
```

### 3. Méthode update personnalisée

Ajout d'une méthode `update()` dans `MembreSerializer` pour conserver les valeurs existantes :

```python
def update(self, instance, validated_data):
    """Mise à jour du membre sans perte de données."""
    # Conserver les valeurs existantes si non fournies
    for field in self.Meta.fields:
        if field not in validated_data and field not in self.Meta.read_only_fields:
            validated_data[field] = getattr(instance, field)
    
    return super().update(instance, validated_data)
```

### 4. Validation améliorée pour les champs optionnels

Ajout de validations pour tous les champs optionnels :

```python
def validate_numero_identification(self, value):
    if value is None or value == '':
        return ''
    return value.strip() if value else ''

def validate_numero_carte_electeur(self, value):
    if value is None or value == '':
        return ''
    return value.strip() if value else ''

def validate_quartier(self, value):
    if value is None or value == '':
        return ''
    return value.strip() if value else ''

def validate_centre_vote(self, value):
    if value is None or value == '':
        return None
    return value.strip() if value else None

def validate_bureau_vote(self, value):
    if value is None or value == '':
        return None
    return value.strip() if value else None
```

## Comportement attendu après correction

### Modification complète (PUT)
- Tous les champs doivent être fournis
- Les champs non fournis conserveront leur valeur existante
- Les champs obligatoires (nom, prénom, téléphone) restent validés

### Modification partielle (PATCH)
- Seuls les champs fournis sont modifiés
- Les autres champs conservent leur valeur existante
- Pas de perte de données

### Champs protégés (read-only)
- `id` : Ne peut pas être modifié
- `date_inscription` : Conserve la date de création originale
- `cree_par` : Conserve le créateur original
- `is_deleted` : Géré par les actions dédiées
- `full_name`, `cellule_nom`, `cree_par_nom` : Champs calculés

## Tests à effectuer

### 1. Test de modification partielle
```bash
PATCH /api/membres/{id}/
{
  "telephone": "22176543210"
}
```
**Résultat attendu :** Seul le téléphone est modifié, autres champs inchangés

### 2. Test de modification complète
```bash
PUT /api/membres/{id}/
{
  "nom": "Diallo",
  "prenom": "Ali",
  "telephone": "22176543210",
  "quartier": "Pikine",
  "cellule": 1,
  "role": "militant"
}
```
**Résultat attendu :** Tous les champs sont mis à jour correctement

### 3. Test avec champs optionnels vides
```bash
PATCH /api/membres/{id}/
{
  "numero_identification": "",
  "centre_vote": null
}
```
**Résultat attendu :** Les champs sont correctement gérés (vide ou null)

## Avantages des corrections

1. **Pas de perte de données** : Les champs non fournis conservent leur valeur
2. **Validation robuste** : Gestion correcte des valeurs vides/nulles
3. **Séparation claire** : Différents serializers pour création vs modification
4. **Prévisibilité** : Comportement cohérent pour PUT et PATCH

## Dépannage

### Si des données sont encore perdues
1. Vérifier que le serveur a bien redémarré après les modifications
2. Vérifier les logs du serveur pour d'éventuelles erreurs
3. Confirmer que les bons serializers sont utilisés (regarder dans `get_serializer_class`)

### Si des champs ne peuvent pas être modifiés
1. Vérifier qu'ils ne sont pas dans `read_only_fields`
2. Vérifier qu'ils sont bien dans la liste `fields` du serializer
3. Vérifier les permissions de l'utilisateur

## Migration nécessaire

Aucune migration n'est nécessaire pour ces corrections. Les changements sont purement au niveau de la logique de l'application.
