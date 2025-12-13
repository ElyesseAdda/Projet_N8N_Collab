# 🔒 Configuration HTTPS avec Let's Encrypt

Guide pour configurer HTTPS automatique avec Traefik et Let's Encrypt.

## 📋 Prérequis

- Domaine configuré et pointant vers votre VPS
- Port 443 ouvert dans le firewall
- Docker Compose configuré

---

## 🔧 Configuration

### Étape 1 : Créer le répertoire pour les certificats

```bash
mkdir -p letsencrypt
chmod 600 letsencrypt
```

### Étape 2 : Modifier docker-compose.prod.yml

Décommentez les lignes HTTPS dans `docker-compose.prod.yml` :

1. **Dans la section Traefik** :
   - Décommentez les lignes pour HTTPS (ports 443, certificats Let's Encrypt)
   - Remplacez `votre-email@example.com` par votre email

2. **Dans les labels des services** :
   - Décommentez les lignes `portail-secure` et `n8n-secure`
   - Changez `N8N_PROTOCOL` de `http` à `https`
   - Changez les URLs `N8N_EDITOR_BASE_URL` et `WEBHOOK_URL` en `https://`

### Étape 3 : Ouvrir le port 443

```bash
sudo ufw allow 443/tcp
sudo ufw status
```

### Étape 4 : Redémarrer les services

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Étape 5 : Vérifier les certificats

```bash
# Vérifier les logs Traefik
docker-compose -f docker-compose.prod.yml logs traefik | grep -i cert

# Vérifier que le fichier acme.json existe
ls -la letsencrypt/
```

---

## 🔍 Exemple de Configuration Complète

Voici un exemple de section Traefik configurée pour HTTPS :

```yaml
traefik:
  image: traefik:v2.10
  command:
    - "--api.insecure=true"
    - "--providers.docker=true"
    - "--providers.docker.exposedbydefault=false"
    - "--entrypoints.web.address=:80"
    - "--entrypoints.websecure.address=:443"
    - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
    - "--certificatesresolvers.letsencrypt.acme.email=votre-email@example.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    # Redirection HTTP vers HTTPS
    - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
    - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
  ports:
    - "80:80"
    - "443:443"
    - "8080:8080"
  volumes:
    - "/var/run/docker.sock:/var/run/docker.sock:ro"
    - "./letsencrypt:/letsencrypt"
```

Et pour les services (exemple portail) :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.portail.rule=Host(`votre-domaine.com`) || Host(`www.votre-domaine.com`)"
  - "traefik.http.routers.portail.entrypoints=websecure"
  - "traefik.http.routers.portail.tls.certresolver=letsencrypt"
  - "traefik.http.services.portail.loadbalancer.server.port=3000"
```

---

## ⚠️ Notes Importantes

1. **Premier démarrage** : Les certificats peuvent prendre 1-2 minutes à être générés
2. **Renouvellement** : Let's Encrypt renouvelle automatiquement les certificats
3. **Limite de taux** : Let's Encrypt limite à 50 certificats par domaine par semaine
4. **Email** : L'email est utilisé pour les notifications d'expiration

---

## 🔍 Dépannage

### Certificat non généré

```bash
# Vérifier les logs
docker-compose logs traefik | grep -i acme

# Vérifier les permissions
ls -la letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
```

### Erreur de validation DNS

- Vérifiez que le domaine pointe bien vers le VPS
- Attendez la propagation DNS (peut prendre jusqu'à 48h)
- Vérifiez avec `nslookup votre-domaine.com`

### Redémarrer la génération de certificat

```bash
# Supprimer le fichier acme.json (attention : les certificats seront régénérés)
rm letsencrypt/acme.json
docker-compose -f docker-compose.prod.yml restart traefik
```

---

## ✅ Vérification

Une fois configuré, testez :

1. Accédez à `https://votre-domaine.com` (devrait rediriger automatiquement depuis HTTP)
2. Vérifiez le cadenas dans le navigateur
3. Testez `https://votre-domaine.com/n8n`

Les certificats sont automatiquement renouvelés avant expiration.

