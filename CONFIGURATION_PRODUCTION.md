# ⚙️ Configuration de Production - Instructions Détaillées

Ce guide vous explique comment configurer manuellement les fichiers pour la production.

## 📋 Fichiers à Configurer

### 1. docker-compose.prod.yml

Ce fichier contient toute la configuration Docker pour la production. Vous devez modifier :

#### A. Remplacer le domaine

Trouvez toutes les occurrences de `votre-domaine.com` et remplacez-les par votre vrai domaine.

**Exemple** : Si votre domaine est `example.com`, remplacez :
- `votre-domaine.com` → `example.com`
- `www.votre-domaine.com` → `www.example.com`

**Emplacements** :
- Ligne ~39 : `Host(\`votre-domaine.com\`)` → `Host(\`example.com\`)`
- Ligne ~73 : `N8N_HOST=votre-domaine.com` → `N8N_HOST=example.com`
- Ligne ~77 : `N8N_EDITOR_BASE_URL=http://votre-domaine.com/n8n/` → `http://example.com/n8n/`
- Etc.

#### B. Configurer la clé API N8N

Trouvez la ligne :
```yaml
- N8N_API_KEY=remplacez_par_votre_cle_api
```

Remplacez `remplacez_par_votre_cle_api` par votre vraie clé API N8N.

#### C. Configurer la clé de chiffrement

Trouvez la ligne :
```yaml
- N8N_ENCRYPTION_KEY=remplacez_par_votre_cle_de_chiffrement
```

Remplacez par votre clé de chiffrement (générée avec `openssl rand -base64 32`).

#### D. Configurer le mot de passe PostgreSQL

Trouvez les deux occurrences :
```yaml
- POSTGRES_PASSWORD=changez-moi-par-un-mot-de-passe-securise
- DB_POSTGRESDB_PASSWORD=changez-moi-par-un-mot-de-passe-securise
```

**IMPORTANT** : Utilisez le même mot de passe pour les deux lignes !

Remplacez par un mot de passe sécurisé (minimum 16 caractères, lettres, chiffres, caractères spéciaux).

---

## 🔧 Utilisation des Scripts (Recommandé)

Au lieu de modifier manuellement, vous pouvez utiliser les scripts fournis :

### Option 1 : Script de configuration automatique

```bash
./setup-production.sh
```

Ce script vous demandera toutes les informations et configurera automatiquement les fichiers.

### Option 2 : Script de déploiement

```bash
./deploy-production.sh
```

Ce script déploie le projet avec la configuration actuelle.

---

## 📝 Exemple de Configuration Complète

### Exemple avec le domaine `monapp.com`

#### docker-compose.prod.yml (extrait)

```yaml
environment:
  - N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - N8N_ENCRYPTION_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890+=
  
labels:
  - "traefik.http.routers.portail.rule=Host(`monapp.com`) || Host(`www.monapp.com`)"
  
environment:
  - N8N_HOST=monapp.com
  - N8N_PROTOCOL=http
  - N8N_EDITOR_BASE_URL=http://monapp.com/n8n/
  - WEBHOOK_URL=http://monapp.com/n8n/
  
environment:
  - POSTGRES_PASSWORD=MonMotDePasseSuperSecurise123!@#
  - DB_POSTGRESDB_PASSWORD=MonMotDePasseSuperSecurise123!@#
```

---

## ✅ Checklist de Vérification

Avant de déployer, vérifiez :

- [ ] Tous les `votre-domaine.com` ont été remplacés par votre domaine
- [ ] La clé API N8N est correcte
- [ ] La clé de chiffrement est configurée
- [ ] Le mot de passe PostgreSQL est identique dans les deux emplacements
- [ ] Le mot de passe PostgreSQL est sécurisé (16+ caractères)
- [ ] Le domaine pointe vers l'IP du VPS (vérifier avec `nslookup`)
- [ ] Les ports 80 (et 443 si HTTPS) sont ouverts dans le firewall

---

## 🔄 Après Modification

Après avoir modifié `docker-compose.prod.yml` :

```bash
# Vérifier la syntaxe
docker-compose -f docker-compose.prod.yml config

# Si OK, redémarrer
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🆘 En Cas d'Erreur

### Erreur de syntaxe YAML

```bash
# Vérifier la syntaxe
docker-compose -f docker-compose.prod.yml config
```

### Variables non résolues

Assurez-vous que toutes les valeurs sont remplies (pas de `${VARIABLE}` non résolue).

### Domaine non accessible

- Vérifiez le DNS : `nslookup votre-domaine.com`
- Vérifiez les logs : `docker-compose logs traefik`

