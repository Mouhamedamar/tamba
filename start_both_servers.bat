@echo off
echo ========================================
echo   Demarrage des serveurs Tamba Politique
echo ========================================
echo.

echo [1/2] Demarrage du serveur Django...
start "Django Server" cmd /k "cd /d \"c:\Users\Mouha\OneDrive\Bureau\Tamba politique\" && python manage.py runserver 0.0.0.0:8000"

echo [2/2] Attente de 3 secondes...
timeout /t 3 >nul

echo [2/2] Demarrage du serveur Vite...
start "Vite Frontend" cmd /k "cd /d \"c:\Users\Mouha\OneDrive\Bureau\Tamba politique\frontend\" && npm run dev"

echo.
echo ========================================
echo   Les deux serveurs sont demarres!
echo ========================================
echo Django Backend : http://localhost:8000
echo Vite Frontend : http://localhost:5173
echo.
echo Dashboard     : http://localhost:5173/dashboard
echo Membres      : http://localhost:5173/membres
echo Cellules      : http://localhost:5173/cellules
echo.
echo Appuyez sur une touche pour quitter...
pause
