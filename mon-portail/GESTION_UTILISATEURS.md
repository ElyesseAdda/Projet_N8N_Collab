# 🔐 Guide de gestion des utilisateurs

Ce guide explique comment gérer les utilisateurs et leurs mots de passe en production.

## ⚠️ Important : Sécurité des mots de passe

**Les mots de passe sont stockés de manière sécurisée avec bcrypt (hachage)**
- ❌ **Vous ne pouvez PAS voir les mots de passe en clair** (c'est normal et sécurisé)
- ✅ Vous pouvez **créer**, **modifier** ou **supprimer** des utilisateurs
- ✅ Vous pouvez **changer les mots de passe** des utilisateurs existants

## 📋 Commandes disponibles

### 1. Lister les utilisateurs

Pour voir tous les utilisateurs existants :

```bash
cd mon-portail
node manage-users.js list
```

**Ou en production (dans le conteneur Docker) :**

```bash
# Entrer dans le conteneur
docker-compose -f docker-compose.prod.yml exec mon-portail sh

# Dans le conteneur
cd /app
node manage-users.js list
```

### 2. Créer un nouvel utilisateur

```bash
node manage-users.js create
```

Le script vous demandera :
- Nom d'utilisateur
- Mot de passe (sera automatiquement hashé)
- Nom d'affichage (optionnel)

### 3. Changer le mot de passe d'un utilisateur

```bash
node manage-users.js password
```

Le script vous demandera :
- Le nom d'utilisateur
- Le nouveau mot de passe

### 4. Supprimer un utilisateur

```bash
node manage-users.js delete
```

Le script vous demandera confirmation avant de supprimer.

## 🚀 Utilisation en production

### Option 1 : Via le conteneur Docker (recommandé)

```bash
# 1. Entrer dans le conteneur
docker-compose -f docker-compose.prod.yml exec mon-portail sh

# 2. Lister les utilisateurs
node manage-users.js list

# 3. Changer un mot de passe (exemple)
node manage-users.js password

# 4. Sortir du conteneur
exit
```

### Option 2 : Modifier directement le fichier users.json

**⚠️ Attention : Cette méthode nécessite de générer les hashs manuellement**

1. **Modifier le fichier `create-users.js`** avec les nouveaux mots de passe en clair
2. **Exécuter le script** pour générer les hashs :
   ```bash
   node create-users.js
   ```
3. **Copier le fichier `users.json`** dans le conteneur ou redémarrer le conteneur

### Option 3 : Via le volume Docker

Si le fichier `users.json` est monté en volume (ce qui est le cas dans votre configuration), vous pouvez :

1. **Sur le serveur**, éditer directement le fichier :
   ```bash
   nano ~/projets/Projet_N8N_Collab/mon-portail/users.json
   ```
   
2. **Générer les hashs** en modifiant `create-users.js` et en exécutant :
   ```bash
   cd ~/projets/Projet_N8N_Collab/mon-portail
   node create-users.js
   ```

3. **Redémarrer le conteneur** pour que les changements prennent effet :
   ```bash
   docker-compose -f docker-compose.prod.yml restart mon-portail
   ```

## 📝 Exemple : Changer le mot de passe de "yacineAA"

### Méthode recommandée (via le script) :

```bash
# Entrer dans le conteneur
docker-compose -f docker-compose.prod.yml exec mon-portail sh

# Changer le mot de passe
node manage-users.js password

# Suivre les instructions interactives
# 1. Entrer "yacineAA"
# 2. Entrer le nouveau mot de passe
# 3. Confirmer

exit
```

### Méthode alternative (via create-users.js) :

1. Éditer `mon-portail/create-users.js` :
   ```javascript
   const users = [
     { username: 'yacineAA', password: 'NouveauMotDePasse123!', displayName: 'Yacine AA' },
     // ... autres utilisateurs
   ];
   ```

2. Générer le nouveau hash :
   ```bash
   cd mon-portail
   node create-users.js
   ```

3. Le fichier `users.json` sera mis à jour automatiquement

4. Redémarrer le conteneur :
   ```bash
   docker-compose -f docker-compose.prod.yml restart mon-portail
   ```

## 🔍 Vérifier que les changements ont pris effet

```bash
# Entrer dans le conteneur
docker-compose -f docker-compose.prod.yml exec mon-portail sh

# Voir le contenu du fichier
cat users.json

# Sortir
exit
```

## 📁 Emplacement des fichiers

- **Script de gestion** : `mon-portail/manage-users.js`
- **Fichier des utilisateurs** : `mon-portail/users.json`
- **Script de génération** : `mon-portail/create-users.js`

## ⚡ Redémarrage après modification

Après avoir modifié `users.json`, vous devez **redémarrer le conteneur** pour que les changements soient pris en compte :

```bash
docker-compose -f docker-compose.prod.yml restart mon-portail
```

Ou si vous voulez voir les logs :

```bash
docker-compose -f docker-compose.prod.yml restart mon-portail
docker-compose -f docker-compose.prod.yml logs -f mon-portail
```

