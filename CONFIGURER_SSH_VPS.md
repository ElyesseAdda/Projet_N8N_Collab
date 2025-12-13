# 🔐 Configurer SSH sur le VPS pour GitHub

Guide pour configurer une clé SSH sur votre VPS afin de pouvoir cloner/pousser depuis GitHub.

## 📋 Pourquoi une clé SSH sur le VPS ?

Pour que votre VPS puisse accéder à votre dépôt GitHub privé, il a besoin de sa propre clé SSH.

---

## 🎯 Étape 1 : Se connecter au VPS

```bash
ssh utilisateur@IP_DU_VPS
# ou
ssh -i chemin/vers/cle.pem utilisateur@IP_DU_VPS
```

---

## 🔑 Étape 2 : Vérifier si une clé SSH existe déjà

```bash
ls -la ~/.ssh/
```

Si vous voyez des fichiers comme `id_rsa`, `id_ed25519`, etc., vous avez déjà une clé.

**Si une clé existe déjà** : Vous pouvez l'utiliser (passez à l'étape 4)  
**Si aucune clé** : Générez-en une nouvelle (étape 3)

---

## 🔑 Étape 3 : Générer une nouvelle clé SSH (si nécessaire)

```bash
# Générer une clé SSH (remplacez par votre email GitHub)
ssh-keygen -t ed25519 -C "votre.email@example.com"
```

Appuyez sur **Entrée** pour accepter le chemin par défaut (`~/.ssh/id_ed25519`).

Si demandé, choisissez un mot de passe (ou laissez vide pour pas de mot de passe).

---

## 📋 Étape 4 : Afficher votre clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

**OU** si vous avez une clé RSA :

```bash
cat ~/.ssh/id_rsa.pub
```

**Copiez toute la clé** affichée (elle commence par `ssh-ed25519` ou `ssh-rsa`).

---

## 🌐 Étape 5 : Ajouter la clé SSH à GitHub

1. **Allez sur GitHub.com** et connectez-vous
2. **Cliquez sur votre avatar** (en haut à droite)
3. **Settings** → **SSH and GPG keys**
4. **Cliquez sur "New SSH key"**
5. **Titre** : "VPS Production" (ou un nom descriptif)
6. **Key type** : "Authentication Key"
7. **Collez la clé** que vous avez copiée à l'étape 4
8. **Cliquez sur "Add SSH key"**

---

## ✅ Étape 6 : Tester la connexion

Sur le VPS, testez la connexion :

```bash
ssh -T git@github.com
```

Vous devriez voir :
```
Hi ElyesseAdda! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ **Si vous voyez ce message, c'est bon !**

---

## 🚀 Étape 7 : Cloner le projet sur le VPS

Maintenant vous pouvez cloner votre projet :

```bash
# Créer un répertoire pour vos projets
mkdir -p ~/projets
cd ~/projets

# Cloner avec SSH
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git

cd Projet_N8N_Collab
```

---

## 🔍 Commandes Utiles

### Voir toutes vos clés SSH
```bash
ls -la ~/.ssh/
```

### Afficher une clé publique spécifique
```bash
cat ~/.ssh/id_ed25519.pub
```

### Tester la connexion GitHub
```bash
ssh -T git@github.com
```

### Voir quelle clé est utilisée
```bash
ssh -vT git@github.com
```

---

## ⚠️ Questions Fréquentes

### Dois-je créer une clé par projet ?

**NON !** Une seule clé SSH suffit pour tous vos projets GitHub. La clé est associée à votre **compte GitHub**, pas au projet.

### Puis-je utiliser la même clé sur mon PC et mon VPS ?

**Techniquement oui**, mais **ce n'est pas recommandé** pour des raisons de sécurité :
- ✅ Si une machine est compromise, l'autre reste sûre
- ✅ Vous pouvez révoquer une clé sans affecter l'autre
- ✅ Meilleure traçabilité (savoir d'où vient l'accès)

**Recommandation** : Générer une clé spécifique pour le VPS.

### J'ai plusieurs VPS, une clé par VPS ?

**Oui, c'est recommandé** pour la même raison de sécurité. Chaque VPS devrait avoir sa propre clé SSH.

---

## 📝 Résumé Rapide

```bash
# 1. Se connecter au VPS
ssh utilisateur@IP_VPS

# 2. Vérifier les clés existantes
ls -la ~/.ssh/

# 3. Générer une nouvelle clé (si nécessaire)
ssh-keygen -t ed25519 -C "email@example.com"

# 4. Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# 5. Copier la clé et l'ajouter sur GitHub (via le site web)

# 6. Tester
ssh -T git@github.com

# 7. Cloner le projet
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
```

---

## ✅ Checklist

- [ ] Connecté au VPS
- [ ] Vérifié les clés SSH existantes
- [ ] Généré une nouvelle clé SSH (si nécessaire)
- [ ] Clé publique affichée et copiée
- [ ] Clé ajoutée sur GitHub (Settings → SSH keys)
- [ ] Connexion testée (`ssh -T git@github.com`)
- [ ] Projet cloné avec succès

---

**Une fois configuré, vous pourrez cloner et mettre à jour votre projet depuis le VPS !** 🎉

