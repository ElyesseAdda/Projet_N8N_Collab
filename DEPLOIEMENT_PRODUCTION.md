# Guide de Déploiement en Production - VPS

Guide étape par étape pour déployer votre projet N8N Collaboratif sur un VPS en production.

## 📋 Prérequis

- Un VPS avec Ubuntu 20.04+ (ou Debian 11+)
- Un nom de domaine configuré (ex: `votre-domaine.com`)
- Accès SSH au VPS
- Un compte GitHub avec votre projet
- Docker et Docker Compose installés (nous les installerons)

---

## 🚀 ÉTAPE 1 : Préparer le VPS

### 1.1 Se connecter au VPS via SSH

```bash
# Windows (PowerShell ou CMD)
ssh -i chemin/vers/votre/cle_ssh.pem utilisateur@IP_DU_VPS

# Ou si vous avez configuré SSH
ssh utilisateur@IP_DU_VPS

# Exemple :
ssh -i C:\Users\User\.ssh\id_rsa root@192.168.1.100
```

### 1.2 Mettre à jour le système

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Installer Docker et Docker Compose

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker (pour éviter sudo)
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version

# Reconnectez-vous pour que les permissions prennent effet
exit
# Puis reconnectez-vous avec SSH
```

### 1.4 Installer Git

```bash
sudo apt install git -y
```

---

## 🔐 ÉTAPE 2 : Configuration SSH pour GitHub

### 2.1 Générer une clé SSH (si pas déjà fait)

```bash
ssh-keygen -t ed25519 -C "votre_email@example.com"
# Appuyez sur Entrée pour accepter le chemin par défaut
# Choisissez un mot de passe (ou laissez vide)
```

### 2.2 Afficher la clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

### 2.3 Ajouter la clé SSH à GitHub

1. Copiez la clé affichée
2. Allez sur GitHub → Settings → SSH and GPG keys
3. Cliquez sur "New SSH key"
4. Collez la clé et enregistrez

### 2.4 Tester la connexion GitHub

```bash
ssh -T git@github.com
# Vous devriez voir : "Hi username! You've successfully authenticated..."
```

---

## 📦 ÉTAPE 3 : Cloner le projet depuis GitHub

### 3.1 Créer un répertoire pour le projet

```bash
mkdir -p ~/projets
cd ~/projets
```

### 3.2 Cloner le projet

```bash
# Remplacer par l'URL de votre repo GitHub
git clone git@github.com:votre-username/Projet_N8N_Collab.git
# ou avec HTTPS :
# git clone https://github.com/votre-username/Projet_N8N_Collab.git

cd Projet_N8N_Collab
```

---

## ⚙️ ÉTAPE 4 : Configuration pour la Production

### 4.1 Variables à personnaliser

Avant de déployer, vous devez configurer :

1. **Nom de domaine** : Remplacez `votre-domaine.com` par votre vrai domaine
2. **Clé API N8N** : Déjà configurée (si vous avez suivi le guide de réinitialisation)
3. **Mot de passe PostgreSQL** : Changez-le en production !

### 4.2 Créer le fichier docker-compose.prod.yml

Nous allons créer un fichier spécifique pour la production (voir section suivante).

---

## 🌐 ÉTAPE 5 : Configuration DNS

### 5.1 Configurer votre domaine

Dans votre panneau DNS (chez votre registrar), ajoutez ces enregistrements :

```
Type: A
Nom: @ (ou votre-domaine.com)
Valeur: IP_DU_VPS
TTL: 3600 (ou Auto)

Type: A
Nom: www
Valeur: IP_DU_VPS
TTL: 3600
```

### 5.2 Vérifier la propagation DNS

```bash
# Sur votre machine locale
nslookup votre-domaine.com
# ou
dig votre-domaine.com
```

---

## 🔧 ÉTAPE 6 : Adapter docker-compose.yml pour la Production

Le fichier `docker-compose.prod.yml` sera créé avec les bonnes configurations.

Vous devrez :
- Remplacer `localhost` par votre nom de domaine
- Configurer HTTPS (optionnel mais recommandé)
- S'assurer que les ports sont corrects
- Vérifier les mots de passe PostgreSQL

---

## 🚀 ÉTAPE 7 : Déployer

### 7.1 Arrêter tous les services (si déjà démarrés)

```bash
cd ~/projets/Projet_N8N_Collab
docker-compose down
```

### 7.2 Démarrer les services en production

```bash
# Utiliser le fichier de production
docker-compose -f docker-compose.prod.yml up -d
```

### 7.3 Vérifier que tout fonctionne

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier les conteneurs
docker-compose -f docker-compose.prod.yml ps

# Tester l'accès
curl http://votre-domaine.com
```

---

## 🔍 ÉTAPE 8 : Vérifications

### 8.1 Ouvrir les ports dans le firewall

```bash
# Si vous utilisez UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Pour HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw enable
sudo ufw status
```

### 8.2 Tester l'accès depuis votre navigateur

1. Ouvrez `http://votre-domaine.com` (ou `http://IP_DU_VPS`)
2. Vérifiez que le portail se charge
3. Testez la connexion
4. Vérifiez que N8N est accessible via `/n8n`

---

## 🔄 ÉTAPE 9 : Mise à jour du projet (après modifications)

### 9.1 Mettre à jour depuis GitHub

```bash
cd ~/projets/Projet_N8N_Collab
git pull origin main  # ou master selon votre branche
```

### 9.2 Redémarrer les services

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 ÉTAPE 10 : Sécurité (Recommandé)

### 10.1 Changer le mot de passe PostgreSQL

Éditez `docker-compose.prod.yml` et changez `POSTGRES_PASSWORD`.

### 10.2 Configurer HTTPS avec Let's Encrypt

Voir le guide dans la section "Configuration HTTPS" ci-dessous.

### 10.3 Sauvegarde automatique

Configurez des sauvegardes régulières de la base de données.

---

## 📝 Checklist de Déploiement

- [ ] VPS configuré avec Docker et Docker Compose
- [ ] Clé SSH configurée pour GitHub
- [ ] Projet cloné depuis GitHub
- [ ] Nom de domaine configuré et pointant vers le VPS
- [ ] DNS propagé (vérifié avec `nslookup`)
- [ ] `docker-compose.prod.yml` créé et configuré
- [ ] Variables d'environnement mises à jour
- [ ] Mots de passe changés (PostgreSQL)
- [ ] Firewall configuré
- [ ] Services démarrés et fonctionnels
- [ ] Test d'accès depuis le navigateur réussi
- [ ] N8N accessible via `/n8n`
- [ ] Authentification fonctionnelle

---

## 🆘 Dépannage

### Les services ne démarrent pas

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs

# Vérifier les erreurs spécifiques
docker-compose -f docker-compose.prod.yml logs n8n
docker-compose -f docker-compose.prod.yml logs mon-portail
```

### Le domaine ne fonctionne pas

1. Vérifiez que le DNS est propagé : `nslookup votre-domaine.com`
2. Vérifiez que le port 80 est ouvert : `sudo ufw status`
3. Vérifiez les logs Traefik : `docker-compose logs traefik`

### Problème de permissions

```bash
# Vérifier les permissions Docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📞 Support

En cas de problème, consultez les logs et vérifiez chaque étape du guide.

---

## 🔒 Configuration HTTPS (Optionnel)

Pour configurer HTTPS avec Let's Encrypt, consultez `HTTPS_SETUP.md`.

---

## 📚 Fichiers de Configuration

- `docker-compose.prod.yml` : Configuration Docker pour la production
- `.env.prod` : Variables d'environnement (à créer depuis `.env.prod.example`)
- `setup-production.sh` : Script de configuration initiale
- `deploy-production.sh` : Script de déploiement

