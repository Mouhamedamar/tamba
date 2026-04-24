# Optimisation de l'ajout de membres

## Nouvelles fonctionnalités pour accélérer l'ajout de membres

### 1. Création en lot (Bulk Create)
**Endpoint :** `POST /api/membres/bulk_create/`

Permet d'ajouter jusqu'à 100 membres en une seule requête.

**Format de la requête :**
```json
{
  "membres": [
    {
      "nom": "Diallo",
      "prenom": "Ali",
      "telephone": "22176543210",
      "quartier": "Pikine",
      "cellule": 1,
      "role": "militant",
      "numero_identification": "ID001",
      "inscrit_liste_electorale": true,
      "numero_carte_electeur": "CARTE123456",
      "centre_vote": "Centre A",
      "bureau_vote": "Bureau 1",
      "optin_pastef_infos": true
    },
    {
      "nom": "Fall",
      "prenom": "Fatou",
      "telephone": "22176543211",
      "quartier": "Guédiawaye",
      "cellule": 2,
      "role": "responsable"
    }
  ]
}
```

**Réponse :**
```json
{
  "crees": 2,
  "erreurs": 0,
  "membres": [...]
}
```

### 2. Importation CSV/Excel
**Endpoint :** `POST /api/membres/import_csv/`

Permet d'importer des centaines de membres depuis un fichier CSV ou Excel.

**Étapes :**
1. Télécharger le template : `GET /api/membres/download_template/`
2. Remplir le fichier avec les données des membres
3. Envoyer le fichier via FormData

**Colonnes requises :**
- `nom` (obligatoire)
- `prenom` (obligatoire) 
- `telephone` (obligatoire)

**Colonnes optionnelles :**
- `quartier`
- `cellule` (ID de la cellule)
- `role` (militant/responsable, défaut: militant)
- `numero_identification`
- `inscrit_liste_electorale` (true/false)
- `numero_carte_electeur`
- `centre_vote`
- `bureau_vote`
- `optin_pastef_infos` (true/false)

### 3. Optimisations de performance

#### Requêtes optimisées
- Utilisation de `select_related('cellule', 'cree_par')` pour réduire les requêtes SQL
- `prefetch_related('cellule__membres')` pour les relations ManyToMany

#### Transactions atomiques
- Toutes les opérations en lot utilisent des transactions pour garantir la cohérence
- En cas d'erreur, tout est annulé (rollback)

#### Validation optimisée
- Validation en lot avant l'insertion
- Messages d'erreur détaillés pour identifier rapidement les problèmes

### 4. Gains de performance

| Méthode | Membres/req | Temps estimé | Avantages |
|---------|-------------|--------------|-----------|
| Classique | 1 | ~200ms | Simple, validation détaillée |
| Bulk Create | 1-100 | ~500ms | Rapide pour petits volumes |
| CSV/Excel | 100-1000+ | ~2-5s | Idéal pour gros volumes |

### 5. Exemples d'utilisation

#### Avec curl (Bulk Create)
```bash
curl -X POST http://localhost:8000/api/membres/bulk_create/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d @membres.json
```

#### Avec curl (CSV Import)
```bash
curl -X POST http://localhost:8000/api/membres/import_csv/ \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@membres.csv"
```

#### Télécharger le template
```bash
curl -X GET http://localhost:8000/api/membres/download_template/ \
  -H "Authorization: Bearer TOKEN" \
  -o template_import.csv
```

### 6. Gestion des erreurs

Les erreurs sont retournées avec des détails précis :
- Numéro de la ligne (pour CSV)
- Champ en erreur
- Message explicatif

**Exemple de réponse avec erreurs :**
```json
{
  "crees": 8,
  "erreurs": 2,
  "details_erreurs": [
    "Ligne 3: Numéro de téléphone invalide",
    "Ligne 7: Nom et prénom sont obligatoires"
  ]
}
```

### 7. Permissions

- **Admin** : Peut importer dans n'importe quelle cellule
- **Responsable** : Peut importer uniquement dans sa cellule
- **Agent** : Peut importer dans n'importe quelle cellule

### 8. Recommandations

1. **Petits volumes (< 50)** : Utiliser Bulk Create
2. **Moyens volumes (50-500)** : Utiliser CSV/Excel
3. **Gros volumes (> 500)** : Diviser en plusieurs fichiers CSV
4. **Toujours valider** : Utiliser le template pour éviter les erreurs
5. **Sauvegarder** : Garder une copie des fichiers d'importation
