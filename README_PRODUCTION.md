# 🚀 Guide Rapide de Déploiement en Production

Guide condensé pour déployer rapidement sur votre VPS.

## 📋 Checklist Rapide

1. ✅ VPS avec Ubuntu/Debian
2. ✅ Nom de domaine configuré
3. ✅ Accès SSH au VPS
4. ✅ Projet sur GitHub

---

## 🎯 Déploiement en 5 Étapes

### Étape 1 : Connecter au VPS

```bash
ssh -i votre_cle_ssh.pem utilisateur@IP_VPS
# ou
ssh utilisateur@IP_VPS
```

### Étape 2 : Installer Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reconnectez-vous
exit
ssh utilisateur@IP_VPS
```

### Étape 3 : Cloner le Projet

```bash
# Configurer SSH pour GitHub (si pas déjà fait)
ssh-keygen -t ed25519 -C "email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copier cette clé et l'ajouter sur GitHub

# Cloner le projet
git clone git@github.com:votre-username/Projet_N8N_Collab.git
cd Projet_N8N_Collab
```

### Étape 4 : Configurer la Production

```bash
# Lancer le script de configuration
chmod +x setup-production.sh
./setup-production.sh
```

Le script vous demandera :
- Votre nom de domaine
- Votre clé API N8N
- Un mot de passe PostgreSQL sécurisé
- Générera automatiquement une clé de chiffrement

### Étape 5 : Déployer

```bash
# Lancer le déploiement
chmod +x deploy-production.sh
./deploy-production.sh
```

---

## 🔧 Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement :

1. **Créer `.env.prod`** :
```bash
cp .env.prod.example .env.prod
nano .env.prod
```

2. **Remplir les valeurs** :
```
N8N_API_KEY=votre_cle_api
N8N_ENCRYPTION_KEY=votre_cle_chiffrement
POSTGRES_PASSWORD=votre_mot_de_passe_securise
DOMAIN=votre-domaine.com
```

3. **Modifier `docker-compose.prod.yml`** :
   - Remplacer toutes les occurrences de `votre-domaine.com` par votre vrai domaine

4. **Démarrer** :
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Configuration HTTPS (Optionnel mais Recommandé)

Voir `HTTPS_SETUP.md` pour configurer Let's Encrypt.

---

## 📊 Commandes Utiles

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Voir l'état des services
docker-compose -f docker-compose.prod.yml ps

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart mon-portail

# Arrêter tout
docker-compose -f docker-compose.prod.yml down

# Mettre à jour depuis GitHub
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔍 Dépannage

### Les services ne démarrent pas
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Le domaine ne fonctionne pas
- Vérifiez le DNS : `nslookup votre-domaine.com`
- Vérifiez le firewall : `sudo ufw status`
- Vérifiez les logs Traefik : `docker-compose logs traefik`

### Problème de permissions
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📞 Support

Consultez `DEPLOIEMENT_PRODUCTION.md` pour le guide détaillé.

