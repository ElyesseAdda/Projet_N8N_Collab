# Dépannage - Problème d'envoi d'email

## ✅ Diagnostic effectué

Le test de configuration email (`node test-email.js`) fonctionne correctement, ce qui signifie que :
- ✅ Le fichier `.env` est correctement configuré
- ✅ Le mot de passe d'application Gmail est valide
- ✅ La connexion SMTP fonctionne
- ✅ L'envoi d'email fonctionne

## 🔍 Problème identifié

Si vous avez une erreur 500 sur `/api/contact` et que le bouton charge indéfiniment, c'est probablement parce que :

1. **Le serveur n'a pas été redémarré** après la création/modification du fichier `.env`
2. **Le serveur ne charge pas les variables d'environnement** correctement

## 🔧 Solutions

### Solution 1 : Redémarrer complètement le serveur

1. **Arrêtez complètement le serveur** :
   - Si vous utilisez `npm run server`, appuyez sur `Ctrl+C`
   - Si vous utilisez PM2 : `pm2 stop mon-portail`
   - Si vous utilisez Docker : `docker-compose restart`

2. **Vérifiez que le processus est bien arrêté** :
   ```bash
   # Windows PowerShell
   Get-Process node | Where-Object {$_.Path -like "*mon-portail*"}
   
   # Si des processus sont encore actifs, tuez-les :
   Stop-Process -Name node -Force
   ```

3. **Redémarrez le serveur** :
   ```bash
   npm run server
   ```

4. **Vérifiez les logs au démarrage** :
   Vous devriez voir :
   ```
   🔐 Vérification des variables d'environnement:
     - GMAIL_USER: ✅ zonia.ai.pro@gmail.com
     - GMAIL_APP_PASSWORD: ✅ Configuré (16 caractères)
   ```

### Solution 2 : Vérifier que dotenv est bien chargé

Le fichier `server.js` doit avoir en première ligne :
```javascript
import 'dotenv/config';
```

Vérifiez que cette ligne est bien présente.

### Solution 3 : Vérifier le chemin du fichier .env

Le fichier `.env` doit être à la **racine du projet**, au même niveau que `server.js` et `package.json`.

Structure attendue :
```
mon-portail/
├── .env          ← ICI
├── server.js
├── package.json
└── ...
```

### Solution 4 : Vérifier le format du fichier .env

Le fichier `.env` ne doit **pas avoir d'espaces** autour du signe `=` :

❌ **INCORRECT** :
```env
GMAIL_USER = zonia.ai.pro@gmail.com
GMAIL_APP_PASSWORD = hdsbkqhmabdqmbln
```

✅ **CORRECT** :
```env
GMAIL_USER=zonia.ai.pro@gmail.com
GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln
```

### Solution 5 : Tester avec le script de diagnostic

Exécutez le script de test pour vérifier que tout fonctionne :

```bash
node test-email.js
```

Si ce script fonctionne mais que le serveur ne fonctionne pas, c'est que le serveur ne charge pas les variables.

## 🐛 Erreurs courantes et solutions

### Erreur : "GMAIL_APP_PASSWORD non défini"

**Cause** : Le serveur ne charge pas le fichier `.env`

**Solution** :
1. Vérifiez que `import 'dotenv/config';` est en première ligne de `server.js`
2. Redémarrez complètement le serveur
3. Vérifiez que le fichier `.env` est à la racine du projet

### Erreur : "Invalid login" ou "Authentication failed"

**Cause** : Le mot de passe d'application est incorrect ou a été révoqué

**Solution** :
1. Vérifiez que vous utilisez bien un **mot de passe d'application** (16 caractères)
2. Vérifiez qu'il n'y a **pas d'espaces** dans le mot de passe dans le `.env`
3. Créez un nouveau mot de passe d'application si nécessaire : [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Le bouton charge indéfiniment

**Cause** : Le serveur retourne une erreur 500 mais le frontend ne gère pas correctement l'erreur

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Regardez l'onglet "Network" pour voir la réponse du serveur
3. Vérifiez les logs du serveur pour voir l'erreur exacte
4. Redémarrez le serveur après avoir corrigé le problème

## 📝 Checklist de vérification

- [ ] Le fichier `.env` existe à la racine du projet
- [ ] Le fichier `.env` contient `GMAIL_APP_PASSWORD=hdsbkqhmabdqmbln` (sans espaces)
- [ ] Le serveur a été **complètement redémarré** après la création du `.env`
- [ ] Les logs au démarrage montrent que les variables sont chargées
- [ ] Le script `node test-email.js` fonctionne
- [ ] Le serveur écoute bien sur le port 3000 (ou le port configuré)

## 🧪 Test final

1. Redémarrez le serveur
2. Vérifiez les logs au démarrage (vous devriez voir les variables chargées)
3. Testez l'envoi d'email depuis le formulaire
4. Vérifiez les logs du serveur pendant l'envoi (vous devriez voir les détails de l'envoi)

Si tout fonctionne, vous devriez voir dans les logs :
```
📧 Configuration email: { user: 'zonia.ai.pro@gmail.com', ... }
✅ Connexion SMTP Gmail vérifiée
✅ Email de demande d'audit envoyé pour: test@example.com
```
