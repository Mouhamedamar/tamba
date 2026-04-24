# Correction de l'Erreur ECONNREFUSED - Frontend/Backend

## 🔍 **Problème Identifié**

L'erreur `ECONNREFUSED` indique que le frontend Vite ne peut pas se connecter au backend Django :

**Frontend** : `http://localhost:5173` (Vite)
**Backend** : `http://localhost:8000` (Django) - **NON DÉMARRÉ**

Le proxy Vite est configuré pour rediriger `/api` vers `http://localhost:8000` mais le serveur Django n'est pas accessible.

## 🛠️ **Solution Complète**

### 1. **Démarrage Correct du Backend**

Le serveur Django doit être démarré **AVANT** le frontend :

```bash
# Étape 1: Démarrer Django (dans un terminal)
cd "c:\Users\Mouha\OneDrive\Bureau\Tamba politique"
python manage.py runserver 0.0.0.0:8000

# Étape 2: Démarrer Vite (dans un autre terminal)
cd "c:\Users\Mouha\OneDrive\Bureau\Tamba politique\frontend"
npm run dev
```

### 2. **Script de Démarrage Automatique**

Créer un script `start_both_servers.bat` :

```batch
@echo off
echo Démarrage des serveurs Tamba Politique...
echo.

echo [1/2] Démarrage du serveur Django...
start "Django Server" cmd /k "cd /d \"c:\Users\Mouha\OneDrive\Bureau\Tamba politique\" && python manage.py runserver 0.0.0.0:8000"

echo [2/2] Démarrage du serveur Vite...
timeout /t 3 >nul
start "Vite Frontend" cmd /k "cd /d \"c:\Users\Mouha\OneDrive\Bureau\Tamba politique\frontend\" && npm run dev"

echo.
echo Les deux serveurs sont démarrés!
echo Django: http://localhost:8000
echo Frontend: http://localhost:5173
echo Appuyez sur une touche pour quitter...
pause
```

### 3. **Configuration Vite Optimisée**

Le fichier `vite.config.js` est correct :
```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',  // ✅ Correct
    },
  },
})
```

## 🚀 **Instructions de Dépannage**

### **Étape 1: Vérifier les Ports**

```bash
# Vérifier que le port 8000 est libre
netstat -ano | findstr :8000

# Si occupé, tuer le processus
taskkill /PID <PID> /F
```

### **Étape 2: Démarrer en Séquence**

1. **Terminal 1** - Démarrer Django :
```bash
cd "c:\Users\Mouha\OneDrive\Bureau\Tamba politique"
python manage.py runserver 0.0.0.0:8000
```

2. **Attendre le message** :
```
Django version 4.2.13
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-C.
```

3. **Terminal 2** - Démarrer Vite :
```bash
cd "c:\Users\Mouha\OneDrive\Bureau\Tamba politique\frontend"
npm run dev
```

### **Étape 3: Vérifier la Connexion**

Ouvrir les URLs dans le navigateur :
- **Backend** : http://localhost:8000/api/dashboard/
- **Frontend** : http://localhost:5173

## 🔧 **Diagnostic Rapide**

### **Test Backend Seul**
```bash
curl http://localhost:8000/api/dashboard/
# Devrait retourner: {"total_membres": 0, ...}
```

### **Test Frontend Seul**
```bash
# Accéder à http://localhost:5173
# Devrait afficher l'interface React
```

### **Test Proxy**
```bash
# Via le proxy Vite
curl http://localhost:5173/api/dashboard/
# Devrait retourner les mêmes données que le backend direct
```

## ⚠️ **Erreurs Communes**

1. **Port 8000 déjà utilisé** :
   - Solution : `taskkill /PID <PID> /F`
   - Ou changer de port : `python manage.py runserver 8001`

2. **Django pas démarré** :
   - Vérifier : `python manage.py check`
   - Appliquer : `python manage.py migrate`

3. **Mauvais ordre de démarrage** :
   - Toujours démarrer Django **AVANT** Vite

## ✅ **Validation**

Une fois corrigé, vous devriez voir :
- ✅ Aucune erreur `ECONNREFUSED`
- ✅ Les données du dashboard s'affichent
- ✅ Les listes membres/cellules fonctionnent
- ✅ Pas d'erreurs 502 dans la console

## 📋 **Checklist de Démarrage**

- [ ] Django démarré sur port 8000
- [ ] Vite démarré sur port 5173  
- [ ] Proxy configuré correctement
- [ ] Backend accessible : http://localhost:8000/api/
- [ ] Frontend accessible : http://localhost:5173
- [ ] Communication frontend/backend fonctionnelle

L'erreur ECONNREFUSED sera résolue en suivant ces étapes !
