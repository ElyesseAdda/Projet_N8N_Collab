# 📋 Ordre des Commandes sur le VPS

Guide pour savoir dans quel répertoire exécuter chaque commande.

---

## ✅ Commandes Système (depuis n'importe où)

Ces commandes fonctionnent depuis **n'importe quel répertoire** :

```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Git
sudo apt install git -y

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configuration Git
git config user.name "Adda attou Elyesse"
git config user.email "Elyesseadda@hotmail.com"

# Générer une clé SSH
ssh-keygen -t ed25519 -C "Elyesseadda@hotmail.com"
cat ~/.ssh/id_ed25519.pub

# Tester SSH
ssh -T git@github.com
```

**Vous pouvez être dans `~` (votre répertoire home) ou n'importe où.**

---

## 📁 Commandes Projet (dans un répertoire spécifique)

Ces commandes nécessitent d'être dans un répertoire approprié :

### 1. Se placer dans un répertoire pour vos projets

```bash
# Créer un répertoire pour vos projets
mkdir -p ~/projets
cd ~/projets
```

### 2. Cloner le projet GitHub

```bash
# Vous DEVEZ être dans ~/projets (ou le répertoire que vous préférez)
cd ~/projets
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
cd Projet_N8N_Collab
```

### 3. Exécuter les scripts de configuration

```bash
# Vous DEVEZ être dans le répertoire du projet
cd ~/projets/Projet_N8N_Collab
chmod +x setup-production.sh
./setup-production.sh
```

### 4. Docker Compose

```bash
# Vous DEVEZ être dans le répertoire du projet (où se trouve docker-compose.prod.yml)
cd ~/projets/Projet_N8N_Collab
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Ordre Recommandé

### Étape 1 : Commandes système (depuis votre home `~`)

```bash
# Connectez-vous au VPS (vous êtes dans ~ par défaut)
ssh utilisateur@IP_VPS

# Vous êtes maintenant dans ~ (votre home directory)
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Installer Docker, Git, etc. (depuis ~)
sudo apt install git -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
# ... etc
```

### Étape 2 : Configuration SSH (depuis `~`)

```bash
# Toujours depuis ~
ssh-keygen -t ed25519 -C "email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copiez la clé et ajoutez-la sur GitHub
ssh -T git@github.com
```

### Étape 3 : Créer le répertoire projet (depuis `~`)

```bash
# Toujours depuis ~
mkdir -p ~/projets
cd ~/projets
```

### Étape 4 : Cloner le projet

```bash
# Maintenant vous êtes dans ~/projets
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
cd Projet_N8N_Collab
```

### Étape 5 : Configuration et déploiement (dans le projet)

```bash
# Maintenant vous êtes dans ~/projets/Projet_N8N_Collab
chmod +x setup-production.sh
./setup-production.sh
./deploy-production.sh
```

---

## 📍 Voir où vous êtes

```bash
# Afficher le répertoire courant
pwd

# Exemple de sortie :
# /home/utilisateur
# ou
# /home/utilisateur/projets/Projet_N8N_Collab
```

---

## 🔍 Astuces

### Revenir au répertoire home

```bash
cd ~
# ou simplement
cd
```

### Voir le contenu du répertoire

```bash
ls -la
```

### Créer des raccourcis

```bash
# Aller directement dans le projet
cd ~/projets/Projet_N8N_Collab

# Ou créer un alias (optionnel)
echo 'alias projn8n="cd ~/projets/Projet_N8N_Collab"' >> ~/.bashrc
source ~/.bashrc
# Maintenant vous pouvez taper juste : projn8n
```

---

## ✅ Checklist

- [ ] Connecté au VPS (dans `~`)
- [ ] Commandes système exécutées (depuis `~`)
- [ ] SSH configuré (depuis `~`)
- [ ] Répertoire `~/projets` créé
- [ ] Projet cloné dans `~/projets/Projet_N8N_Collab`
- [ ] Configuration exécutée (depuis le répertoire du projet)

---

**En résumé :**
- ✅ **Commandes système** (`apt`, `sudo`, etc.) : depuis n'importe où, généralement `~`
- ✅ **Git clone** : depuis `~/projets` (ou votre répertoire de choix)
- ✅ **Docker Compose** : depuis le répertoire du projet

