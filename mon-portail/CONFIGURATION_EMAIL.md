# Configuration de l'envoi d'emails Gmail

Ce guide vous explique comment configurer l'envoi d'emails pour le formulaire "Demander un audit gratuit" avec votre compte Gmail `zonia.ai.pro@gmail.com`.

## ⚠️ Important

Gmail ne permet plus l'utilisation de votre mot de passe normal pour les applications tierces. Vous **devez** créer un **"Mot de passe d'application"** (App Password).

## 📋 Étapes complètes

### Étape 1 : Activer la validation en 2 étapes (2FA)

Si ce n'est pas déjà fait, vous devez activer la validation en 2 étapes sur votre compte Google :

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **Sécurité** dans le menu de gauche
3. Dans la section **Connexion à Google**, cliquez sur **Validation en deux étapes**
4. Suivez les instructions pour activer la 2FA (vous devrez confirmer avec votre téléphone)

### Étape 2 : Créer un mot de passe d'application

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Si le lien ne fonctionne pas, allez sur **Sécurité** → **Validation en deux étapes** → **Mots de passe des applications** (en bas de la page)

2. Vous serez peut-être invité à vous connecter à nouveau

3. Dans la section **Sélectionner une application**, choisissez **"Autre (nom personnalisé)"**

4. Entrez un nom descriptif, par exemple : **"Zonia Site Vitrine"**

5. Cliquez sur **Générer**

6. **Copiez le mot de passe généré** (16 caractères, espacés en groupes de 4)
   - ⚠️ **Important** : Ce mot de passe ne s'affichera qu'une seule fois !
   - Exemple de format : `abcd efgh ijkl mnop`

### Étape 3 : Configurer le fichier .env

1. Dans le dossier racine du projet, créez un fichier `.env` (s'il n'existe pas déjà)

2. Copiez le contenu de `.env.example` dans `.env`

3. Remplissez les valeurs :
   ```env
   GMAIL_USER=zonia.ai.pro@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```
   - Remplacez `abcd efgh ijkl mnop` par le mot de passe d'application que vous venez de créer
   - ⚠️ **Important** : Supprimez les espaces du mot de passe ! Utilisez : `abcdefghijklmnop`

4. Sauvegardez le fichier `.env`

### Étape 4 : Vérifier que le fichier .env est ignoré par Git

Assurez-vous que `.env` est dans votre `.gitignore` pour ne pas commiter vos identifiants :

```gitignore
.env
```

### Étape 5 : Redémarrer le serveur

1. Arrêtez le serveur s'il est en cours d'exécution (Ctrl+C)

2. Redémarrez-le :
   ```bash
   npm run server
   ```
   ou en mode développement complet :
   ```bash
   npm run dev:full
   ```

### Étape 6 : Tester l'envoi d'email

1. Ouvrez votre site vitrine dans le navigateur

2. Rendez-vous à la section "Prêt à digitaliser votre avenir ?"

3. Entrez un email de test dans le formulaire

4. Cliquez sur "Demander mon audit gratuit"

5. Vérifiez :
   - Que vous voyez un message de succès
   - Que vous recevez bien l'email sur `zonia.ai.pro@gmail.com`
   - Vérifiez aussi les spams si l'email n'arrive pas

## 🔧 Dépannage

### Erreur : "Invalid login" ou "Authentication failed"

- Vérifiez que vous utilisez bien un **mot de passe d'application** et non votre mot de passe Gmail normal
- Vérifiez que la validation en 2 étapes est activée
- Vérifiez que vous avez supprimé les espaces du mot de passe dans le fichier `.env`
- Vérifiez que le fichier `.env` est bien à la racine du projet

### Erreur : "Less secure app access"

- Cette erreur ne devrait plus apparaître avec un mot de passe d'application
- Si elle apparaît, assurez-vous d'utiliser un mot de passe d'application et non votre mot de passe normal

### L'email n'arrive pas

- Vérifiez les spams/courrier indésirable
- Vérifiez les logs du serveur pour voir s'il y a des erreurs
- Vérifiez que le serveur a bien redémarré après la modification du `.env`

### Le serveur ne charge pas les variables d'environnement

- Vérifiez que `dotenv` est installé : `npm list dotenv`
- Vérifiez que l'import `import 'dotenv/config';` est bien en haut de `server.js`
- Redémarrez le serveur après toute modification du `.env`

## 📧 Format de l'email reçu

Quand quelqu'un remplit le formulaire, vous recevrez un email avec :
- **Sujet** : "Nouvelle demande d'audit gratuit - Zonia"
- **Contenu** : Email du client, date et heure de la demande

## 🔒 Sécurité

- ⚠️ **Ne commitez JAMAIS** le fichier `.env` dans Git
- ⚠️ **Ne partagez JAMAIS** votre mot de passe d'application
- Si vous pensez que votre mot de passe d'application a été compromis, supprimez-le et créez-en un nouveau sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

## 📝 Notes supplémentaires

- Le mot de passe d'application est spécifique à chaque application
- Vous pouvez créer plusieurs mots de passe d'application pour différentes applications
- Si vous supprimez un mot de passe d'application, vous devrez en créer un nouveau et mettre à jour le `.env`

## 🚀 Déploiement en production

Pour configurer l'envoi d'emails en production (Docker, VPS, services cloud), consultez le guide complet : **[DEPLOIEMENT_PRODUCTION.md](./DEPLOIEMENT_PRODUCTION.md)**
