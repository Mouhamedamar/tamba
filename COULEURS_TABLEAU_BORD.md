# Couleurs des Cellules dans le Tableau de Bord

## Fonctionnalité ajoutée

Chaque cellule dispose maintenant de sa propre couleur personnalisable qui s'affiche dans le tableau de bord pour une meilleure identification visuelle.

## Modifications apportées

### 1. Modèle Cellule
- Ajout du champ `couleur` (format hexadécimal, défaut: `#3B82F6`)
- Migration automatique créée et appliquée

### 2. API
- Les endpoints retournent maintenant la couleur de chaque cellule
- Format de réponse dans le dashboard :
```json
{
  "membres_par_cellule": [
    {
      "cellule__nom_cellule": "Cellule A",
      "cellule__couleur": "#3B82F6",
      "count": 25
    },
    {
      "cellule__nom_cellule": "Cellule B", 
      "cellule__couleur": "#10B981",
      "count": 18
    }
  ]
}
```

### 3. Scripts fournis
- `assigner_couleurs_cellules.py` : Script pour assigner des couleurs aux cellules existantes

## Utilisation

### Assigner des couleurs aux cellules existantes
```bash
cd "c:\Users\Mouha\OneDrive\Bureau\Tamba politique"
python assigner_couleurs_cellules.py
```

### Modifier la couleur d'une cellule
Via l'API :
```bash
PUT /api/cellules/{id}/
{
  "nom_cellule": "Cellule A",
  "couleur": "#FF5733"
}
```

### Palette de couleurs suggérées
- `#3B82F6` - Bleu principal
- `#10B981` - Vert émeraude  
- `#F59E0B` - Orange ambre
- `#EF4444` - Rouge vif
- `#8B5CF6` - Violet
- `#EC4899` - Rose
- `#06B6D4` - Cyan
- `#84CC16` - Vert lime
- `#F97316` - Orange foncé
- `#6366F1` - Indigo

## Intégration Frontend

### Exemple d'utilisation en JavaScript
```javascript
// Récupérer les données du dashboard
fetch('/api/dashboard/')
  .then(response => response.json())
  .then(data => {
    const cellules = data.membres_par_cellule;
    
    cellules.forEach(cellule => {
      console.log(`Cellule: ${cellule.cellule__nom_cellule}`);
      console.log(`Couleur: ${cellule.cellule__couleur}`);
      console.log(`Membres: ${cellule.count}`);
      
      // Appliquer la couleur dans l'UI
      const element = document.getElementById(`cellule-${cellule.id}`);
      if (element) {
        element.style.backgroundColor = cellule.cellule__couleur;
        element.style.color = getContrastColor(cellule.cellule__couleur);
      }
    });
  });

// Fonction pour déterminer la couleur du texte (noir/blanc)
function getContrastColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}
```

### Exemple avec React
```jsx
function DashboardCellules({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.membres_par_cellule.map((cellule, index) => (
        <div 
          key={index}
          className="p-4 rounded-lg text-white font-semibold"
          style={{ backgroundColor: cellule.cellule__couleur }}
        >
          <h3 className="text-lg">{cellule.cellule__nom_cellule}</h3>
          <p className="text-2xl">{cellule.count} membres</p>
        </div>
      ))}
    </div>
  );
}
```

### Exemple avec Vue.js
```vue
<template>
  <div class="cellules-grid">
    <div 
      v-for="(cellule, index) in cellules" 
      :key="index"
      class="cellule-card"
      :style="{ backgroundColor: cellule.cellule__couleur }"
    >
      <h3>{{ cellule.cellule__nom_cellule }}</h3>
      <span class="count">{{ cellule.count }} membres</span>
    </div>
  </div>
</template>

<style scoped>
.cellules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.cellule-card {
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
}

.count {
  font-size: 1.5rem;
  display: block;
  margin-top: 0.5rem;
}
</style>
```

## Avantages

1. **Identification visuelle immédiate** : Chaque cellule est reconnaissable par sa couleur
2. **Personnalisation** : Les responsables peuvent choisir la couleur de leur cellule
3. **Cohérence** : La même couleur est utilisée partout dans l'application
4. **Accessibilité** : Contraste automatique pour la lisibilité

## Bonnes pratiques

1. **Contraste** : Assurer un bon contraste entre la couleur de fond et le texte
2. **Harmonie** : Utiliser une palette cohérente pour toutes les cellules
3. **Accessibilité** : Éviter les couleurs trop claires qui pourraient nuire à la lisibilité
4. **Test** : Vérifier l'apparence sur différents appareils et navigateurs

## Dépannage

### Problème : Les couleurs ne s'affichent pas
- Vérifier que la migration a été appliquée : `python manage.py migrate`
- Exécuter le script d'assignation : `python assigner_couleurs_cellules.py`

### Problème : Mauvais contraste
- Utiliser des couleurs plus foncées ou plus claires selon le texte
- Tester avec la fonction `getContrastColor()` fournie

### Problème : Couleur par défaut appliquée
- Les cellules existantes ont besoin d'exécuter le script d'assignation
- Les nouvelles cellules auront automatiquement la couleur par défaut `#3B82F6`
