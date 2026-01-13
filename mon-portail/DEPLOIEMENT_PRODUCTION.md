# Guide de déploiement en production - Configuration Email

Ce guide explique comment configurer les variables d'environnement Gmail pour l'envoi d'emails en production.

## 📋 Variables d'environnement nécessaires

Pour que l'envoi d'emails fonctionne en production, vous devez configurer :

```env
GMAIL_USER=zonia.ai.pro@gmail.com
GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
NODE_ENV=production
```

## 🐳 Option 1 : Déploiement avec Docker / Docker Compose

### Méthode A : Fichier docker-compose.yml avec variables d'environnement

Si vous utilisez Docker Compose, ajoutez les variables dans votre `docker-compose.yml` ou `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  mon-portail:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GMAIL_USER=zonia.ai.pro@gmail.com
      - GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
      - PORT=3000
      - SESSION_SECRET=votre-secret-session-tres-securise
      # Autres variables si nécessaire
      - FORCE_HTTPS=true
      - SECURE_COOKIES=true
    volumes:
      - ./dist:/app/dist
      - ./users.json:/app/users.json
    restart: unless-stopped
```

### Méthode B : Fichier .env avec Docker Compose

1. Créez un fichier `.env` à la racine de votre projet (même contenu qu'en développement) :

```env
GMAIL_USER=zonia.ai.pro@gmail.com
GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
NODE_ENV=production
PORT=3000
SESSION_SECRET=votre-secret-session-tres-securise
FORCE_HTTPS=true
SECURE_COOKIES=true
```

2. Dans votre `docker-compose.yml`, référencez le fichier `.env` :

```yaml
version: '3.8'

services:
  mon-portail:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./dist:/app/dist
      - ./users.json:/app/users.json
    restart: unless-stopped
```

⚠️ **Important** : Assurez-vous que `.env` est dans `.dockerignore` pour ne pas l'inclure dans l'image Docker, mais utilisez `env_file` dans docker-compose pour l'injecter au runtime.

### Méthode C : Secrets Docker (Recommandé pour la sécurité)

Pour une meilleure sécurité, utilisez Docker Secrets :

```yaml
version: '3.8'

services:
  mon-portail:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GMAIL_USER=zonia.ai.pro@gmail.com
    secrets:
      - gmail_app_password
    volumes:
      - ./dist:/app/dist
    restart: unless-stopped

secrets:
  gmail_app_password:
    file: ./secrets/gmail_app_password.txt
```

Créez le fichier `secrets/gmail_app_password.txt` avec votre mot de passe :
```bash
mkdir -p secrets
echo "hdsbkqhmabdqmbln" > secrets/gmail_app_password.txt
chmod 600 secrets/gmail_app_password.txt
```

Puis dans votre code, lisez le secret depuis `/run/secrets/gmail_app_password`.

## 🖥️ Option 2 : Déploiement sur VPS / Serveur dédié

### Méthode A : Fichier .env sur le serveur

1. Connectez-vous à votre serveur via SSH

2. Naviguez vers le dossier de votre application :
```bash
cd /chemin/vers/mon-portail
```

3. Créez le fichier `.env` :
```bash
nano .env
```

4. Ajoutez les variables :
```env
GMAIL_USER=zonia.ai.pro@gmail.com
GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
NODE_ENV=production
PORT=3000
SESSION_SECRET=votre-secret-session-tres-securise
```

5. Sauvegardez (Ctrl+O, puis Ctrl+X dans nano)

6. Redémarrez votre application :
```bash
pm2 restart mon-portail
# ou
systemctl restart mon-portail
# ou simplement
npm run server
```

### Méthode B : Variables d'environnement système

Vous pouvez aussi définir les variables au niveau système :

```bash
# Dans ~/.bashrc ou ~/.profile
export GMAIL_USER=zonia.ai.pro@gmail.com
export GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
export NODE_ENV=production
```

Puis rechargez :
```bash
source ~/.bashrc
```

### Méthode C : Avec PM2

Si vous utilisez PM2, créez un fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'mon-portail',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      GMAIL_USER: 'zonia.ai.pro@gmail.com',
      GMAIL_APP_PASSWORD: 'hdsbkqhmabdqmbln',
      PORT: 3000,
      SESSION_SECRET: 'votre-secret-session-tres-securise'
    }
  }]
};
```

Puis démarrez avec :
```bash
pm2 start ecosystem.config.js
```

## ☁️ Option 3 : Services Cloud (Heroku, Railway, Render, etc.)

### Heroku

1. Via le dashboard Heroku :
   - Allez dans Settings → Config Vars
   - Ajoutez :
     - `GMAIL_USER` = `zonia.ai.pro@gmail.com`
     - `GMAIL_APP_PASSWORD` = `hdsbkqhmabdqmbln`
     - `NODE_ENV` = `production`

2. Via la CLI :
```bash
heroku config:set GMAIL_USER=zonia.ai.pro@gmail.com
heroku config:set GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
heroku config:set NODE_ENV=production
```

### Railway

1. Allez dans votre projet → Variables
2. Ajoutez les variables d'environnement :
   - `GMAIL_USER` = `zonia.ai.pro@gmail.com`
   - `GMAIL_APP_PASSWORD` = `hdsbkqhmabdqmbln`
   - `NODE_ENV` = `production`

### Render

1. Allez dans votre service → Environment
2. Ajoutez les variables :
   - `GMAIL_USER` = `zonia.ai.pro@gmail.com`
   - `GMAIL_APP_PASSWORD` = `hdsbkqhmabdqmbln`
   - `NODE_ENV` = `production`

### Vercel / Netlify

Ces plateformes sont principalement pour le frontend. Si vous déployez le backend séparément, utilisez les variables d'environnement de votre service backend.

## 🔒 Sécurité en production

### ⚠️ Bonnes pratiques

1. **Ne commitez JAMAIS** le fichier `.env` dans Git
2. **Utilisez des secrets managés** si votre plateforme le supporte (Docker Secrets, AWS Secrets Manager, etc.)
3. **Limitez les permissions** du fichier `.env` :
   ```bash
   chmod 600 .env
   ```
4. **Utilisez des mots de passe d'application différents** pour dev et prod si possible
5. **Rotez régulièrement** vos mots de passe d'application

### Vérification

Pour vérifier que les variables sont bien chargées en production, vous pouvez temporairement ajouter un log dans `server.js` (à retirer après) :

```javascript
console.log('🔐 Configuration email:', {
  user: process.env.GMAIL_USER ? '✅ Configuré' : '❌ Manquant',
  password: process.env.GMAIL_APP_PASSWORD ? '✅ Configuré' : '❌ Manquant'
});
```

## 🧪 Test en production

1. Rendez-vous sur votre site en production
2. Allez à la section "Prêt à digitaliser votre avenir ?"
3. Remplissez le formulaire avec un email de test
4. Vérifiez les logs du serveur pour voir si l'email est envoyé
5. Vérifiez votre boîte mail `zonia.ai.pro@gmail.com`

## 🔧 Dépannage en production

### L'email ne s'envoie pas

1. **Vérifiez les logs du serveur** :
   ```bash
   # Avec PM2
   pm2 logs mon-portail
   
   # Avec Docker
   docker logs mon-portail
   
   # Avec systemd
   journalctl -u mon-portail -f
   ```

2. **Vérifiez que les variables sont bien chargées** :
   - Les logs doivent montrer si les variables sont présentes
   - Vérifiez que `NODE_ENV=production` est bien défini

3. **Vérifiez les permissions réseau** :
   - Le serveur doit pouvoir accéder à `smtp.gmail.com:587` ou `smtp.gmail.com:465`
   - Vérifiez les pare-feu

4. **Vérifiez le mot de passe d'application** :
   - Assurez-vous qu'il n'y a pas d'espaces
   - Vérifiez qu'il n'a pas été révoqué dans votre compte Google

### Erreur "Invalid login"

- Vérifiez que vous utilisez bien un **mot de passe d'application** et non votre mot de passe Gmail
- Vérifiez que la validation en 2 étapes est activée sur le compte Gmail
- Vérifiez que le mot de passe d'application n'a pas été supprimé

## 📝 Checklist de déploiement

- [ ] Variables d'environnement configurées (`GMAIL_USER`, `GMAIL_APP_PASSWORD`)
- [ ] `NODE_ENV=production` défini
- [ ] Fichier `.env` créé et sécurisé (chmod 600)
- [ ] `.env` dans `.gitignore` (vérifié)
- [ ] Serveur redémarré après configuration
- [ ] Test d'envoi d'email effectué
- [ ] Logs vérifiés pour confirmer le fonctionnement
- [ ] Email reçu dans la boîte `zonia.ai.pro@gmail.com`

## 🔄 Mise à jour des credentials

Si vous devez changer le mot de passe d'application :

1. Créez un nouveau mot de passe d'application sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Mettez à jour la variable `GMAIL_APP_PASSWORD` dans votre configuration
3. Redémarrez le serveur
4. Testez l'envoi d'email
5. Supprimez l'ancien mot de passe d'application dans Google

---

**Note** : Ce guide couvre les scénarios les plus courants. Adaptez selon votre infrastructure spécifique.
