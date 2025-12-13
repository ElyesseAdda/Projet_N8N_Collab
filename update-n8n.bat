@echo off
echo ========================================
echo Mise à jour de n8n vers la dernière version
echo ========================================
echo.

echo [1/3] Téléchargement de la dernière image n8n...
docker pull n8nio/n8n:latest

if %errorlevel% neq 0 (
    echo ERREUR: Impossible de télécharger l'image n8n
    pause
    exit /b 1
)

echo.
echo [2/3] Arrêt du conteneur n8n...
docker-compose stop n8n

echo.
echo [3/3] Redémarrage du conteneur n8n avec la nouvelle version...
docker-compose up -d n8n

if %errorlevel% neq 0 (
    echo ERREUR: Impossible de redémarrer n8n
    pause
    exit /b 1
)

echo.
echo ========================================
echo Mise à jour terminée avec succès !
echo ========================================
echo.
echo Pour vérifier la version de n8n, consultez l'interface web.
echo.
pause

