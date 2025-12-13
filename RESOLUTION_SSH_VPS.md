# 🔧 Résoudre "Permission denied (publickey)" sur le VPS

## 🎯 Le Problème

```
git@github.com: Permission denied (publickey).
```

Cela signifie que GitHub ne reconnaît pas votre clé SSH.

---

## ✅ Solution : Étapes à Suivre

### Étape 1 : Vérifier si une clé SSH existe

Sur le VPS, exécutez :

```bash
ls -la ~/.ssh/
```

Si vous voyez `id_ed25519` ou `id_rsa`, une clé existe. Sinon, il faut en créer une.

---

### Étape 2 : Générer une clé SSH (si nécessaire)

```bash
ssh-keygen -t ed25519 -C "Elyesseadda@hotmail.com"
```

- Appuyez sur **Entrée** pour le chemin par défaut (`~/.ssh/id_ed25519`)
- Choisissez un mot de passe (ou appuyez sur Entrée pour aucun)

---

### Étape 3 : Afficher votre clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copiez TOUTE la clé** (elle commence par `ssh-ed25519` et se termine par votre email).

---

### Étape 4 : Ajouter la clé sur GitHub

1. **Allez sur** https://github.com/settings/keys
2. **Cliquez sur** "New SSH key"
3. **Title** : "VPS ZoniaServer" (ou un nom descriptif)
4. **Key type** : "Authentication Key"
5. **Key** : Collez la clé que vous avez copiée
6. **Cliquez sur** "Add SSH key"

---

### Étape 5 : Tester la connexion

```bash
ssh -T git@github.com
```

Vous devriez voir :
```
Hi ElyesseAdda! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ **Si vous voyez ce message, c'est bon !**

---

### Étape 6 : Cloner à nouveau

```bash
cd ~/projets
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
```

Ça devrait fonctionner maintenant ! 🎉

---

## 🔍 Dépannage

### Si ça ne fonctionne toujours pas

#### Vérifier quelle clé est utilisée

```bash
ssh -vT git@github.com
```

Cela affiche des informations de débogage. Cherchez la ligne qui montre quelle clé est utilisée.

#### Si vous avez plusieurs clés SSH

Si vous avez plusieurs clés et que la mauvaise est utilisée, vous pouvez spécifier la clé :

```bash
# Utiliser une clé spécifique
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
```

Ou configurer SSH pour utiliser la bonne clé automatiquement :

```bash
# Créer/modifier le fichier de configuration SSH
nano ~/.ssh/config
```

Ajoutez :

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
```

Puis sauvegardez (Ctrl+X, puis Y, puis Entrée).

---

## 📋 Checklist Rapide

```bash
# 1. Vérifier les clés existantes
ls -la ~/.ssh/

# 2. Générer une clé (si nécessaire)
ssh-keygen -t ed25519 -C "Elyesseadda@hotmail.com"

# 3. Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# 4. Copier la clé et l'ajouter sur GitHub (via le site web)

# 5. Tester
ssh -T git@github.com

# 6. Cloner
cd ~/projets
git clone git@github.com:ElyesseAdda/Projet_N8N_Collab.git
```

---

## ✅ Après Résolution

Une fois que le clone fonctionne, vous pouvez continuer avec :

```bash
cd ~/projets/Projet_N8N_Collab
chmod +x setup-production.sh
./setup-production.sh
```

