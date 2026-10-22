#!/bin/bash

# Script de déploiement en production
# Usage: ./deploy-production.sh

set -e  # Arrêter en cas d'erreur

# Ce VPS partage déjà les ports 80/443 avec Nginx et d'autres sociétés.
# Zonia s'y met à jour avec deploy-zonia.ps1, jamais avec ce script.
if [ -f /opt/zonia/docker-compose.vps.yml ] || [ -d /opt/onlyoffice ]; then
    echo "Arrêt : ce script ne doit pas tourner sur le VPS partagé."
    echo "Depuis le PC, utilisez : powershell -ExecutionPolicy Bypass -File .\\deploy-zonia.ps1"
    exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  DÉPLOIEMENT EN PRODUCTION                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Erreur : docker-compose.prod.yml introuvable"
    echo "   Assurez-vous d'être dans le répertoire du projet"
    exit 1
fi

# Vérifier que le fichier .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo "⚠️  Fichier .env.prod introuvable"
    echo "   Création depuis .env.prod.example..."
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example .env.prod
        echo "   ✅ Fichier .env.prod créé"
        echo "   ⚠️  IMPORTANT : Modifiez .env.prod avec vos valeurs avant de continuer !"
        exit 1
    else
        echo "   ❌ .env.prod.example introuvable également"
        exit 1
    fi
fi

# Charger les variables d'environnement
export $(cat .env.prod | grep -v '^#' | xargs)

# Vérifier que le domaine est configuré dans docker-compose.prod.yml
if grep -q "votre-domaine.com" docker-compose.prod.yml; then
    echo "⚠️  ATTENTION : Le domaine 'votre-domaine.com' est toujours présent dans docker-compose.prod.yml"
    echo "   Veuillez le remplacer par votre vrai domaine avant de continuer"
    read -p "   Continuer quand même ? (O/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 1
    fi
fi

echo "📋 Configuration détectée :"
echo "   - Domaine : ${DOMAIN:-non configuré}"
echo "   - Clé API N8N : ${N8N_API_KEY:0:20}..."
echo "   - Clé chiffrement : ${N8N_ENCRYPTION_KEY:0:20}..."
echo ""

read -p "Voulez-vous continuer le déploiement ? (O/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 0
fi

echo ""
echo "🛑 Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🔄 Pull des dernières images Docker..."
docker-compose -f docker-compose.prod.yml pull

echo ""
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
echo "📊 Vérification de l'état des services..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Logs récents :"
docker-compose -f docker-compose.prod.yml logs --tail=50

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Vérifiez les logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "   2. Testez l'accès : http://${DOMAIN:-votre-domaine.com}"
echo "   3. Vérifiez N8N : http://${DOMAIN:-votre-domaine.com}/n8n"
echo ""
echo "🔍 Commandes utiles :"
echo "   - Voir les logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Arrêter : docker-compose -f docker-compose.prod.yml down"
echo "   - Redémarrer : docker-compose -f docker-compose.prod.yml restart"
echo ""

