# Guide de test - Envoi d'email en production

Ce guide vous explique étape par étape comment tester l'envoi d'email en production.

## 📋 Prérequis

- ✅ Vous avez déjà configuré le fichier `.env` en développement
- ✅ Le test en développement fonctionne (`node test-email.js`)
- ✅ Votre serveur de production est accessible

## 🚀 Étapes de déploiement en production

### Étape 1 : Préparer les fichiers pour la production

1. **Build du frontend React** :
   ```bash
   npm run build
   ```
   Cela crée le dossier `dist/` avec les fichiers optimisés.

2. **Vérifiez que le build est réussi** :
   ```bash
   # Vérifiez que le dossier dist/ existe et contient des fichiers
   ls dist/
   ```

### Étape 2 : Transférer les fichiers sur le serveur de production

#### Option A : Via Git (Recommandé)

1. **Commitez les changements** (sans le `.env`) :
   ```bash
   git add .
   git commit -m "Configuration email pour production"
   git push
   ```

2. **Sur le serveur de production** :
   ```bash
   cd /chemin/vers/mon-portail
   git pull
   npm install  # Si de nouvelles dépendances ont été ajoutées
   npm run build  # Rebuild du frontend
   ```

#### Option B : Via SCP / FTP

1. **Transférez les fichiers nécessaires** :
   - `server.js`
   - `package.json`
   - `dist/` (dossier complet)
   - `users.json` (si nécessaire)
   - `node_modules/` (ou faites `npm install` sur le serveur)

### Étape 3 : Configurer les variables d'environnement en production

#### Méthode 1 : Fichier .env sur le serveur (VPS/Serveur dédié)

1. **Connectez-vous au serveur** :
   ```bash
   ssh utilisateur@votre-serveur.com
   ```

2. **Naviguez vers le dossier de l'application** :
   ```bash
   cd /chemin/vers/mon-portail
   ```

3. **Créez le fichier `.env`** :
   ```bash
   nano .env
   ```

4. **Ajoutez le contenu suivant** :
   ```env
   GMAIL_USER=zonia.ai.pro@gmail.com
   GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET=votre-secret-session-tres-securise-changez-moi
   FORCE_HTTPS=true
   SECURE_COOKIES=true
   ```

5. **Sauvegardez** (Ctrl+O, puis Ctrl+X dans nano)

6. **Sécurisez le fichier** :
   ```bash
   chmod 600 .env
   ```

#### Méthode 2 : Variables d'environnement système

Si vous préférez définir les variables au niveau système :

```bash
# Dans ~/.bashrc ou ~/.profile
export GMAIL_USER=zonia.ai.pro@gmail.com
export GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
export NODE_ENV=production
export PORT=3000
```

Puis rechargez :
```bash
source ~/.bashrc
```

#### Méthode 3 : Docker / Docker Compose

Créez un fichier `.env` à la racine et référencez-le dans `docker-compose.yml` :

```yaml
services:
  mon-portail:
    env_file:
      - .env
```

#### Méthode 4 : Services Cloud (Heroku, Railway, etc.)

Configurez les variables via le dashboard ou la CLI :

**Heroku** :
```bash
heroku config:set GMAIL_USER=zonia.ai.pro@gmail.com
heroku config:set GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
heroku config:set NODE_ENV=production
```

**Railway / Render** :
- Allez dans Settings → Environment Variables
- Ajoutez les variables une par une

### Étape 4 : Installer les dépendances (si nécessaire)

Sur le serveur de production :

```bash
cd /chemin/vers/mon-portail
npm install --production
```

### Étape 5 : Tester la configuration email sur le serveur

1. **Transférez le script de test** sur le serveur :
   ```bash
   # Si vous utilisez SCP
   scp test-email.js utilisateur@serveur:/chemin/vers/mon-portail/
   ```

2. **Exécutez le test** :
   ```bash
   cd /chemin/vers/mon-portail
   node test-email.js
   ```

3. **Vérifiez le résultat** :
   - ✅ Si le test réussit : vous devriez voir "✅ Configuration email fonctionnelle !"
   - ❌ Si le test échoue : vérifiez les erreurs et corrigez la configuration

### Étape 6 : Démarrer le serveur en production

#### Option A : Avec PM2 (Recommandé)

1. **Installez PM2** (si ce n'est pas déjà fait) :
   ```bash
   npm install -g pm2
   ```

2. **Créez un fichier `ecosystem.config.js`** :
   ```javascript
   module.exports = {
     apps: [{
       name: 'mon-portail',
       script: './server.js',
       instances: 1,
       exec_mode: 'fork',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       // Les variables du .env seront chargées automatiquement
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       autorestart: true,
       max_memory_restart: '1G'
     }]
   };
   ```

3. **Démarrez avec PM2** :
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Vérifiez que le serveur démarre** :
   ```bash
   pm2 logs mon-portail
   ```

   Vous devriez voir :
   ```
   🔐 Vérification des variables d'environnement:
     - GMAIL_USER: ✅ zonia.ai.pro@gmail.com
     - GMAIL_APP_PASSWORD: ✅ Configuré (16 caractères)
   ```

#### Option B : Avec systemd

1. **Créez un fichier de service** `/etc/systemd/system/mon-portail.service` :
   ```ini
   [Unit]
   Description=Mon Portail Application
   After=network.target

   [Service]
   Type=simple
   User=votre-utilisateur
   WorkingDirectory=/chemin/vers/mon-portail
   Environment="NODE_ENV=production"
   Environment="PORT=3000"
   ExecStart=/usr/bin/node /chemin/vers/mon-portail/server.js
   Restart=on-failure
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

2. **Activez et démarrez le service** :
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable mon-portail
   sudo systemctl start mon-portail
   ```

3. **Vérifiez les logs** :
   ```bash
   sudo journalctl -u mon-portail -f
   ```

#### Option C : Docker / Docker Compose

1. **Créez ou modifiez `docker-compose.yml`** :
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
       restart: unless-stopped
   ```

2. **Démarrez** :
   ```bash
   docker-compose up -d
   ```

3. **Vérifiez les logs** :
   ```bash
   docker-compose logs -f mon-portail
   ```

### Étape 7 : Vérifier que le serveur fonctionne

1. **Vérifiez que le serveur répond** :
   ```bash
   curl http://localhost:3000/api/test
   # ou
   curl http://votre-domaine.com/api/test
   ```

   Vous devriez recevoir : `{"status":"ok","message":"Le serveur répond correctement"}`

2. **Vérifiez les logs du serveur** :
   - Avec PM2 : `pm2 logs mon-portail`
   - Avec systemd : `sudo journalctl -u mon-portail -f`
   - Avec Docker : `docker-compose logs -f`

   Vous devriez voir les logs de démarrage avec les variables d'environnement chargées.

### Étape 8 : Tester l'envoi d'email depuis le site

1. **Ouvrez votre site en production** dans un navigateur :
   ```
   http://votre-domaine.com
   # ou
   https://votre-domaine.com
   ```

2. **Naviguez vers la section contact** :
   - Faites défiler jusqu'à "Prêt à digitaliser votre avenir ?"
   - Ou cliquez sur le lien "Audit Gratuit" dans le header

3. **Remplissez le formulaire** :
   - Entrez un email de test (ex: `test@example.com`)
   - Cliquez sur "Demander mon audit gratuit"

4. **Observez le comportement** :
   - ✅ Le bouton devrait afficher "Envoi en cours..." puis un message de succès
   - ❌ Si le bouton charge indéfiniment, vérifiez les logs du serveur

5. **Vérifiez les logs du serveur en temps réel** :
   ```bash
   # Avec PM2
   pm2 logs mon-portail --lines 50
   
   # Avec systemd
   sudo journalctl -u mon-portail -f
   
   # Avec Docker
   docker-compose logs -f mon-portail
   ```

   Vous devriez voir :
   ```
   📧 Configuration email: { user: 'zonia.ai.pro@gmail.com', passwordConfigured: '✅ Oui', ... }
   ✅ Connexion SMTP Gmail vérifiée
   ✅ Email de demande d'audit envoyé pour: test@example.com
   📧 Détails de l'envoi: { messageId: '...', accepted: [...], rejected: [] }
   ```

6. **Vérifiez votre boîte mail** :
   - Ouvrez `zonia.ai.pro@gmail.com`
   - Vérifiez la boîte de réception
   - Vérifiez aussi les spams/courrier indésirable
   - Vous devriez recevoir un email avec le sujet "Nouvelle demande d'audit gratuit - Zonia"

## 🔍 Dépannage en production

### Le serveur ne démarre pas

1. **Vérifiez les logs d'erreur** :
   ```bash
   pm2 logs mon-portail --err
   # ou
   sudo journalctl -u mon-portail -n 50
   ```

2. **Vérifiez que le port 3000 n'est pas déjà utilisé** :
   ```bash
   netstat -tulpn | grep 3000
   # ou
   lsof -i :3000
   ```

3. **Vérifiez que les variables d'environnement sont chargées** :
   - Les logs au démarrage doivent montrer les variables

### L'email ne s'envoie pas

1. **Vérifiez les logs du serveur** pendant l'envoi :
   - Cherchez les erreurs avec "❌"
   - Vérifiez les détails de l'erreur

2. **Testez avec le script de test** :
   ```bash
   node test-email.js
   ```

3. **Vérifiez les permissions réseau** :
   - Le serveur doit pouvoir accéder à `smtp.gmail.com:587`
   - Vérifiez les règles de pare-feu

4. **Vérifiez le mot de passe d'application** :
   - Assurez-vous qu'il n'y a pas d'espaces dans le `.env`
   - Vérifiez qu'il n'a pas été révoqué dans Google

### Le bouton charge indéfiniment

1. **Ouvrez la console du navigateur** (F12)
2. **Allez dans l'onglet Network**
3. **Remplissez le formulaire et envoyez**
4. **Regardez la requête `/api/contact`** :
   - Si elle retourne 500 : problème côté serveur (vérifiez les logs)
   - Si elle est en attente : problème de connexion au serveur
   - Si elle retourne 200 : problème côté frontend

## ✅ Checklist de déploiement

- [ ] Build du frontend effectué (`npm run build`)
- [ ] Fichiers transférés sur le serveur
- [ ] Fichier `.env` créé sur le serveur avec les bonnes valeurs
- [ ] Permissions du `.env` sécurisées (`chmod 600 .env`)
- [ ] Test email réussi sur le serveur (`node test-email.js`)
- [ ] Serveur démarré (PM2, systemd, ou Docker)
- [ ] Logs du serveur vérifiés (variables chargées)
- [ ] Test depuis le site effectué
- [ ] Email reçu dans la boîte `zonia.ai.pro@gmail.com`

## 📝 Notes importantes

- ⚠️ **Ne commitez JAMAIS** le fichier `.env` en production
- ⚠️ **Utilisez HTTPS** en production pour la sécurité
- ⚠️ **Sauvegardez** votre fichier `.env` de production de manière sécurisée
- 🔄 **Redémarrez toujours le serveur** après modification du `.env`

## 🎯 Résultat attendu

Après avoir suivi toutes ces étapes, vous devriez :
1. ✅ Voir les variables d'environnement chargées dans les logs au démarrage
2. ✅ Pouvoir envoyer un email depuis le formulaire du site
3. ✅ Recevoir l'email dans `zonia.ai.pro@gmail.com`
4. ✅ Voir les logs détaillés de l'envoi dans les logs du serveur

---

**Besoin d'aide ?** Consultez aussi :
- `DEPANNAGE_EMAIL.md` pour les problèmes courants
- `DEPLOIEMENT_PRODUCTION.md` pour les détails de configuration selon votre infrastructure
