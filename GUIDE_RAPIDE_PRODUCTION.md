# 🚀 Guide Rapide - Déploiement en Production

Guide condensé en 10 minutes pour déployer sur votre VPS.

---

## 📦 Fichiers Créés pour la Production

### Fichiers de Configuration
- ✅ `docker-compose.prod.yml` - Configuration Docker pour la production
- ✅ `.env.prod.example` - Exemple de variables d'environnement

### Scripts d'Automation
- ✅ `setup-production.sh` - Configuration initiale automatique
- ✅ `deploy-production.sh` - Script de déploiement

### Documentation
- ✅ `DEPLOIEMENT_PRODUCTION.md` - Guide détaillé complet
- ✅ `README_PRODUCTION.md` - Guide rapide condensé
- ✅ `CONFIGURATION_PRODUCTION.md` - Instructions de configuration manuelle
- ✅ `HTTPS_SETUP.md` - Configuration HTTPS avec Let's Encrypt

---

## ⚡ Déploiement Rapide (5 Étapes)

### 1. Sur votre VPS - Installer Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
exit
# Reconnectez-vous
```

### 2. Configurer SSH pour GitHub

```bash
ssh-keygen -t ed25519 -C "votre-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copiez et ajoutez cette clé sur GitHub → Settings → SSH keys
```

### 3. Cloner le Projet

```bash
git clone git@github.com:votre-username/Projet_N8N_Collab.git
cd Projet_N8N_Collab
```

### 4. Configurer la Production

```bash
chmod +x setup-production.sh deploy-production.sh
./setup-production.sh
```

Le script vous demandera :
- Votre nom de domaine
- Votre clé API N8N
- Un mot de passe PostgreSQL
- Générera automatiquement une clé de chiffrement

### 5. Déployer

```bash
./deploy-production.sh
```

**C'est tout !** 🎉

---

## 🔍 Vérifications

```bash
# Vérifier les services
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Tester l'accès
curl http://votre-domaine.com
```

---

## 🆘 Problèmes Courants

### Le domaine ne fonctionne pas
- Vérifiez le DNS : `nslookup votre-domaine.com`
- Vérifiez le firewall : `sudo ufw allow 80/tcp`
- Vérifiez les logs : `docker-compose logs traefik`

### Erreur de permissions Docker
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Services qui ne démarrent pas
```bash
docker-compose -f docker-compose.prod.yml logs
```

---

## 📚 Documentation Complète

- **Guide détaillé** : `DEPLOIEMENT_PRODUCTION.md`
- **Configuration manuelle** : `CONFIGURATION_PRODUCTION.md`
- **Configuration HTTPS** : `HTTPS_SETUP.md`

---

## ✅ Checklist Finale

- [ ] VPS configuré avec Docker
- [ ] Projet cloné depuis GitHub
- [ ] Configuration exécutée (`setup-production.sh`)
- [ ] Domaine configuré dans DNS
- [ ] Port 80 ouvert dans le firewall
- [ ] Services démarrés (`deploy-production.sh`)
- [ ] Accès testé depuis le navigateur
- [ ] N8N accessible via `/n8n`

---

**Vous êtes prêt pour la production ! 🚀**

