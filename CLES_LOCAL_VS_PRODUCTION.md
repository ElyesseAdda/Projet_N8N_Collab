# 🔑 Clés Local vs Production - Guide

## 📋 Deux Types de Clés N8N

### 1. Clé API N8N (`N8N_API_KEY`)

**Rôle** : Authentification pour l'API N8N (le portail communique avec N8N)

**Même compte = Même clé ?** ✅ **OUI**

Si vous utilisez le **même compte entreprise N8N** :
- ✅ **Utilisez la MÊME clé API** en local et en production
- C'est juste un identifiant pour votre compte
- Elle est valable partout où vous utilisez ce compte

**Exemple** :
```yaml
# docker-compose.yml (local)
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# docker-compose.prod.yml (production)
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # MÊME clé
```

---

### 2. Clé de Chiffrement (`N8N_ENCRYPTION_KEY`)

**Rôle** : Chiffre/déchiffre les credentials stockés dans la base de données PostgreSQL

**Même compte = Même clé ?** ⚠️ **Ça dépend de votre objectif**

#### Option A : Même clé de chiffrement

**Avantages** :
- ✅ Vous pouvez migrer des données (workflows, credentials) entre local et production
- ✅ Compatibilité entre les environnements
- ✅ Plus simple à gérer

**Quand l'utiliser** :
- Si vous voulez pouvoir exporter/importer des workflows avec leurs credentials
- Si vous développez en local et déployez en prod avec les mêmes données

**Exemple** :
```yaml
# docker-compose.yml (local)
N8N_ENCRYPTION_KEY=vzzLSkyJmYtc4wOlzRsJp36aSwMQb2ytun2dfVp0m5k=

# docker-compose.prod.yml (production)
N8N_ENCRYPTION_KEY=vzzLSkyJmYtc4wOlzRsJp36aSwMQb2ytun2dfVp0m5k=  # MÊME clé
```

#### Option B : Clés différentes

**Avantages** :
- ✅ Isolation totale entre local et production
- ✅ Sécurité renforcée (si une clé est compromise, l'autre reste sûre)
- ✅ Base de données production indépendante

**Quand l'utiliser** :
- Si vous partez sur une base vierge en production (votre cas)
- Si vous ne voulez pas mélanger les données dev/prod
- Si vous voulez une sécurité maximale

**Exemple** :
```yaml
# docker-compose.yml (local)
N8N_ENCRYPTION_KEY=vzzLSkyJmYtc4wOlzRsJp36aSwMQb2ytun2dfVp0m5k=

# docker-compose.prod.yml (production)
N8N_ENCRYPTION_KEY=NouvelleCleGenereePourLaProduction123456=  # NOUVELLE clé
```

⚠️ **Important** : Si vous utilisez des clés différentes, vous ne pourrez **PAS** exporter les credentials du local vers la prod (les données seront illisibles).

---

## 🎯 Recommandation pour Votre Cas

Puisque vous avez dit :
- ✅ Garder le même compte N8N entreprise
- ✅ Repartir sur une base vierge en production

### Ma Recommandation

**Clé API** : ✅ **MÊME** (même compte)
```yaml
# Utilisez la clé API actuelle dans docker-compose.yml
# ligne 32 : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Clé de chiffrement** : ⚠️ **Peut être la même OU différente**

#### Scénario 1 : Vous voulez pouvoir migrer des données plus tard
→ Utilisez la **MÊME** clé de chiffrement

#### Scénario 2 : Vous voulez une isolation complète (base vierge)
→ Générez une **NOUVELLE** clé de chiffrement pour la production

---

## 📝 Configuration Pratique

### Si vous gardez les mêmes clés :

1. **Récupérer vos clés actuelles** depuis `docker-compose.yml` :
   - Clé API (ligne 32)
   - Clé de chiffrement (ligne 99)

2. **Les copier dans `docker-compose.prod.yml`** ou utiliser le script qui vous permet de les spécifier

### Si vous voulez une nouvelle clé de chiffrement en production :

Le script `setup-production.sh` générera automatiquement une nouvelle clé si vous laissez le champ vide.

---

## ✅ Résumé

| Clé | Local = Production ? | Pourquoi |
|-----|---------------------|----------|
| **N8N_API_KEY** | ✅ **OUI** (même compte) | Identifiant du compte, fonctionne partout |
| **N8N_ENCRYPTION_KEY** | ⚠️ **Votre choix** | Dépend si vous voulez migrer des données |

**Pour votre cas** : 
- ✅ Clé API : **MÊME** (utilisez celle de la ligne 32)
- ⚠️ Clé chiffrement : **MÊME** si migration future, **DIFFÉRENTE** si isolation complète

