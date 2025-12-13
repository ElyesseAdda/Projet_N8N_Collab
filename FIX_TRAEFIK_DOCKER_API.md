# 🔧 Fix Traefik - API Docker Trop Ancienne

## 🎯 Le Problème

Traefik utilise une ancienne version de l'API Docker (1.24) alors que Docker moderne nécessite au minimum l'API 1.44.

## ✅ Solution

J'ai mis à jour Traefik vers la dernière version (`traefik:latest`) qui supporte les nouvelles API Docker.

---

## 🚀 Actions à Faire sur le VPS

### Option 1 : Redémarrer avec la nouvelle version

```bash
cd ~/projets/Projet_N8N_Collab

# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Mettre à jour le fichier (si vous avez poussé les modifications)
git pull

# Forcer le pull de la nouvelle image Traefik
docker pull traefik:latest

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs (plus d'erreurs API)
docker-compose -f docker-compose.prod.yml logs traefik
```

### Option 2 : Si git pull ne fonctionne pas, modifier directement

Si vous ne pouvez pas faire `git pull`, modifiez directement le fichier sur le VPS :

```bash
cd ~/projets/Projet_N8N_Collab

# Éditer le fichier
nano docker-compose.prod.yml

# Trouvez la ligne :
#   image: traefik:v3.0
# Remplacez par :
#   image: traefik:latest

# Sauvegarder (Ctrl+X, puis Y, puis Entrée)

# Arrêter et redémarrer
docker-compose -f docker-compose.prod.yml down
docker pull traefik:latest
docker-compose -f docker-compose.prod.yml up -d
```

---

## ✅ Vérification

Après redémarrage, vous devriez voir :

```bash
# Plus d'erreurs "client version too old"
docker-compose -f docker-compose.prod.yml logs traefik | grep -i error

# Les logs Traefik doivent être propres
docker-compose -f docker-compose.prod.yml logs traefik
```

---

## 🔍 Si le Problème Persiste

### Vérifier la version de Docker

```bash
docker version
```

Assurez-vous d'avoir Docker version 24.0+ ou Docker Compose v2+.

### Mettre à jour Docker (si nécessaire)

```bash
# Sur Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
```

---

## 📋 Checklist

- [ ] Traefik mis à jour vers `traefik:latest`
- [ ] Image Traefik pullée (`docker pull traefik:latest`)
- [ ] Services redémarrés
- [ ] Plus d'erreurs "client version too old" dans les logs
- [ ] Traefik démarre correctement

---

**La version `latest` de Traefik supporte les nouvelles API Docker modernes ! ✅**

