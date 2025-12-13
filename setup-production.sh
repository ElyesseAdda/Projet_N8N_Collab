#!/bin/bash

# Script de configuration initiale pour la production
# Usage: ./setup-production.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  CONFIGURATION INITIALE POUR LA PRODUCTION                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Les clés N8N seront automatiquement copiées depuis docker-compose.yml"
echo "   (même compte = mêmes clés en local et production)"
echo ""

# Demander le domaine
read -p "🌐 Entrez votre nom de domaine (ex: example.com) : " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Le domaine ne peut pas être vide"
    exit 1
fi

# Lire automatiquement les clés depuis docker-compose.yml (si existe)
LOCAL_API_KEY=""
LOCAL_ENCRYPTION_KEY=""

if [ -f "docker-compose.yml" ]; then
    echo ""
    echo "📋 Copie automatique des clés depuis docker-compose.yml local..."
    
    # Extraire la clé API (format: - N8N_API_KEY=valeur)
    LOCAL_API_KEY=$(grep "^[[:space:]]*-[[:space:]]*N8N_API_KEY=" docker-compose.yml 2>/dev/null | sed 's/.*N8N_API_KEY=\([^ ]*\).*/\1/' | head -1)
    
    # Extraire la clé de chiffrement (format: - N8N_ENCRYPTION_KEY=valeur)
    LOCAL_ENCRYPTION_KEY=$(grep "^[[:space:]]*-[[:space:]]*N8N_ENCRYPTION_KEY=" docker-compose.yml 2>/dev/null | sed 's/.*N8N_ENCRYPTION_KEY=\([^ ]*\).*/\1/' | head -1)
    
    # Utiliser automatiquement les clés locales (même compte = mêmes clés)
    if [ ! -z "$LOCAL_API_KEY" ] && [ "$LOCAL_API_KEY" != "remplacez_par_votre_cle_api" ]; then
        N8N_API_KEY="$LOCAL_API_KEY"
        echo "   ✅ Clé API copiée automatiquement : ${N8N_API_KEY:0:30}..."
    else
        echo "   ⚠️  Clé API locale non trouvée ou non configurée"
        read -p "🔑 Entrez votre clé API N8N : " N8N_API_KEY
    fi
    
    if [ ! -z "$LOCAL_ENCRYPTION_KEY" ] && [ "$LOCAL_ENCRYPTION_KEY" != "remplacez_par_votre_cle_de_chiffrement" ]; then
        N8N_ENCRYPTION_KEY="$LOCAL_ENCRYPTION_KEY"
        echo "   ✅ Clé de chiffrement copiée automatiquement : ${N8N_ENCRYPTION_KEY:0:30}..."
    else
        echo "   ⚠️  Clé de chiffrement locale non trouvée ou non configurée"
        read -p "🔐 Entrez votre clé de chiffrement N8N (ou laissez vide pour en générer une) : " N8N_ENCRYPTION_KEY
    fi
else
    echo ""
    echo "⚠️  Fichier docker-compose.yml non trouvé"
    read -p "🔑 Entrez votre clé API N8N : " N8N_API_KEY
    read -p "🔐 Entrez votre clé de chiffrement N8N (ou laissez vide pour en générer une) : " N8N_ENCRYPTION_KEY
fi

# Si la clé de chiffrement est toujours vide, en générer une
if [ -z "$N8N_ENCRYPTION_KEY" ]; then
    echo ""
    echo "🔐 Génération d'une nouvelle clé de chiffrement..."
    N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
    echo "   ✅ Clé générée : $N8N_ENCRYPTION_KEY"
fi

# Demander le mot de passe PostgreSQL
echo ""
read -sp "🗄️  Entrez un mot de passe PostgreSQL sécurisé : " POSTGRES_PASSWORD
echo ""

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ Le mot de passe PostgreSQL ne peut pas être vide"
    exit 1
fi

# Créer le fichier .env.prod
echo ""
echo "📝 Création du fichier .env.prod..."
cat > .env.prod << EOF
# Configuration de production
N8N_API_KEY=${N8N_API_KEY}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DOMAIN=${DOMAIN}
EOF
echo "   ✅ Fichier .env.prod créé"

# Mettre à jour docker-compose.prod.yml
echo ""
echo "📝 Mise à jour de docker-compose.prod.yml..."

# Sauvegarder le fichier original
cp docker-compose.prod.yml docker-compose.prod.yml.bak

# Remplacer le domaine
sed -i "s/votre-domaine\.com/${DOMAIN}/g" docker-compose.prod.yml

# Remplacer la clé API N8N
if [ ! -z "$N8N_API_KEY" ]; then
    sed -i "s|N8N_API_KEY=remplacez_par_votre_cle_api|N8N_API_KEY=${N8N_API_KEY}|g" docker-compose.prod.yml
fi

# Remplacer la clé de chiffrement
sed -i "s|N8N_ENCRYPTION_KEY=remplacez_par_votre_cle_de_chiffrement|N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}|g" docker-compose.prod.yml

# Remplacer le mot de passe PostgreSQL (2 occurrences)
sed -i "s|POSTGRES_PASSWORD=changez-moi-par-un-mot-de-passe-securise|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" docker-compose.prod.yml
sed -i "s|DB_POSTGRESDB_PASSWORD=changez-moi-par-un-mot-de-passe-securise|DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}|g" docker-compose.prod.yml

# Supprimer le fichier de backup
rm -f docker-compose.prod.yml.bak

echo "   ✅ Fichier mis à jour avec :"
echo "      - Domaine : $DOMAIN"
if [ ! -z "$N8N_API_KEY" ]; then
    echo "      - Clé API N8N : ${N8N_API_KEY:0:30}... (copiée depuis local)"
fi
echo "      - Clé chiffrement : ${N8N_ENCRYPTION_KEY:0:30}... (copiée depuis local)"
echo "      - Mot de passe PostgreSQL : configuré"

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Vérifiez le fichier .env.prod et docker-compose.prod.yml"
echo "   2. Exécutez : ./deploy-production.sh"
echo ""
echo "🔍 Vérifications recommandées :"
echo "   - DNS configuré et pointant vers ce serveur"
echo "   - Ports 80 (et 443 si HTTPS) ouverts dans le firewall"
echo "   - Clé API N8N valide"
echo ""

