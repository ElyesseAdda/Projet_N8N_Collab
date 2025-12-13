# 🚀 Initialiser le Projet sur GitHub

Guide étape par étape pour mettre votre projet sur GitHub.

## 📋 Prérequis

- Un compte GitHub
- Git installé sur votre machine
- Votre projet prêt

---

## 🎯 Étapes

### Étape 1 : Vérifier que Git est installé

```bash
git --version
```

Si Git n'est pas installé, téléchargez-le depuis : https://git-scm.com/downloads

---

### Étape 2 : Initialiser Git dans votre projet

```bash
# Se placer dans le répertoire du projet
cd C:\Users\User\Desktop\Projets\Projet_N8N_Collab

# Initialiser Git
git init
```

---

### Étape 3 : Configurer Git (si pas déjà fait)

```bash
# Votre nom (remplacez par le vôtre)
git config user.name "Votre Nom"

# Votre email (remplacez par le vôtre)
git config user.email "votre.email@example.com"
```

Ou pour configurer globalement (pour tous vos projets) :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

---

### Étape 4 : Vérifier le fichier .gitignore

Assurez-vous que votre `.gitignore` exclut les fichiers sensibles :

✅ **Doit être ignoré** :
- `node_modules/`
- `.env` et `.env.prod`
- `dist/` (fichiers build)
- Clés SSH (`*.pem`, `id_rsa`, etc.)
- Certificats SSL (`letsencrypt/`, `*.crt`, etc.)
- Fichiers de sauvegarde (`*.bak`)

---

### Étape 5 : Ajouter les fichiers

```bash
# Voir ce qui sera ajouté
git status

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .
```

---

### Étape 6 : Faire le premier commit

```bash
git commit -m "Initial commit: Projet N8N Collaboratif avec portail"
```

---

### Étape 7 : Créer le dépôt sur GitHub

1. **Allez sur GitHub.com** et connectez-vous
2. **Cliquez sur le bouton "+"** en haut à droite
3. **Sélectionnez "New repository"**
4. **Remplissez les informations** :
   - **Repository name** : `Projet_N8N_Collab` (ou le nom que vous voulez)
   - **Description** : "Portail collaboratif pour N8N avec gestion de verrous et collaboration en temps réel"
   - **Visibility** : 
     - ✅ **Private** (recommandé - contient des configurations)
     - ⚠️ Public (seulement si vous voulez que ce soit open source)
   - ❌ **Ne cochez PAS** "Initialize with README" (vous avez déjà des fichiers)
   - ❌ **Ne cochez PAS** "Add .gitignore" (vous en avez déjà un)
5. **Cliquez sur "Create repository"**

---

### Étape 8 : Connecter votre projet local à GitHub

GitHub vous donnera les commandes, mais voici les commandes à exécuter :

#### Option A : HTTPS (plus simple pour débuter)

```bash
# Remplacer USERNAME par votre nom d'utilisateur GitHub
# Remplacer Projet_N8N_Collab par le nom de votre dépôt

git remote add origin https://github.com/USERNAME/Projet_N8N_Collab.git

# Pousser le code
git branch -M main
git push -u origin main
```

#### Option B : SSH (recommandé pour la production)

```bash
# Remplacer USERNAME par votre nom d'utilisateur GitHub
# Remplacer Projet_N8N_Collab par le nom de votre dépôt

git remote add origin git@github.com:USERNAME/Projet_N8N_Collab.git

# Pousser le code
git branch -M main
git push -u origin main
```

**Note** : Pour SSH, vous devez avoir configuré une clé SSH GitHub (voir étape 9).

---

### Étape 9 : Configurer SSH pour GitHub (Optionnel mais Recommandé)

#### 9.1 Générer une clé SSH (si pas déjà fait)

```bash
ssh-keygen -t ed25519 -C "votre.email@example.com"
```

Appuyez sur Entrée pour accepter le chemin par défaut.

#### 9.2 Afficher votre clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

#### 9.3 Ajouter la clé à GitHub

1. **Copiez la clé** affichée (tout le contenu)
2. **Allez sur GitHub.com** → **Settings** → **SSH and GPG keys**
3. **Cliquez sur "New SSH key"**
4. **Titre** : "Mon PC Windows" (ou autre)
5. **Collez la clé** dans le champ "Key"
6. **Cliquez sur "Add SSH key"**

#### 9.4 Tester la connexion

```bash
ssh -T git@github.com
```

Vous devriez voir : `Hi USERNAME! You've successfully authenticated...`

---

## ✅ Vérification

Après avoir poussé, allez sur votre dépôt GitHub. Vous devriez voir tous vos fichiers !

---

## 🔄 Commandes Git Utiles pour Plus Tard

### Voir l'état
```bash
git status
```

### Ajouter des fichiers modifiés
```bash
git add .
git commit -m "Description des modifications"
git push
```

### Voir l'historique
```bash
git log
```

### Créer une branche
```bash
git checkout -b nom-de-la-branche
```

### Revenir sur la branche principale
```bash
git checkout main
```

---

## ⚠️ Important : Fichiers à NE JAMAIS Commiter

Vérifiez que ces fichiers sont bien dans `.gitignore` :

- ✅ `.env.prod` - Variables d'environnement de production
- ✅ `letsencrypt/` - Certificats SSL
- ✅ `*.pem`, `id_rsa*` - Clés SSH
- ✅ `node_modules/` - Dépendances Node.js
- ✅ `dist/` - Fichiers buildés (optionnel)
- ✅ `users.json` - Fichier utilisateurs (contient des mots de passe hashés)

**Si vous avez déjà committé des fichiers sensibles**, retirez-les :

```bash
# Retirer un fichier du dépôt (mais le garder localement)
git rm --cached .env.prod
git commit -m "Remove sensitive files"
git push
```

---

## 🆘 Problèmes Courants

### Erreur : "Permission denied (publickey)"

→ Configurez SSH (voir étape 9)

### Erreur : "Authentication failed"

→ Vérifiez votre nom d'utilisateur/mot de passe GitHub, ou configurez un Personal Access Token

### Erreur : "remote origin already exists"

```bash
# Voir les remotes existants
git remote -v

# Supprimer et recréer
git remote remove origin
git remote add origin https://github.com/USERNAME/Projet_N8N_Collab.git
```

---

## 📝 Checklist

- [ ] Git installé et configuré
- [ ] Dépôt Git initialisé (`git init`)
- [ ] `.gitignore` vérifié
- [ ] Fichiers ajoutés (`git add .`)
- [ ] Premier commit fait
- [ ] Dépôt créé sur GitHub
- [ ] Remote ajouté
- [ ] Code poussé sur GitHub
- [ ] SSH configuré (optionnel mais recommandé)

---

**Votre projet est maintenant sur GitHub ! 🎉**

