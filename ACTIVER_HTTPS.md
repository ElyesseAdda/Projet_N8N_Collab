# 🔒 Guide d'Activation HTTPS

Ce guide vous explique comment activer HTTPS sur votre serveur avec Let's Encrypt.

## 📋 Prérequis

✅ **Vérifiez avant de commencer :**

1. **Domaine configuré** : Votre domaine `zoniahub.fr` doit pointer vers l'IP de votre serveur
2. **Port 443 ouvert** : Le port HTTPS doit être ouvert dans le firewall
3. **Email configuré** : Un email valide est nécessaire pour Let's Encrypt (actuellement : `zonia.ai.pro@gmail.com`)

---

## 🚀 Activation HTTPS - Étapes

### Étape 1 : Créer le répertoire pour les certificats

Sur votre serveur, exécutez :

```bash
cd ~/projets/Projet_N8N_Collab
mkdir -p letsencrypt
chmod 600 letsencrypt
```

### Étape 2 : Ouvrir le port 443 dans le firewall

```bash
# Si vous utilisez UFW
sudo ufw allow 443/tcp
sudo ufw status

# Si vous utilisez iptables ou un autre firewall, ouvrez le port 443
```

### Étape 3 : Vérifier la configuration

Le fichier `docker-compose.prod.yml` est déjà configuré pour HTTPS. Vérifiez que :

- ✅ L'email Let's Encrypt est correct (ligne 13) : `zonia.ai.pro@gmail.com`
- ✅ Le volume `./letsencrypt:/letsencrypt` est présent
- ✅ Les ports 443 sont exposés

Si vous voulez changer l'email, modifiez la ligne 13 dans `docker-compose.prod.yml` :

   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.email=zonia.ai.pro@gmail.com"
   ```

### Étape 4 : Redémarrer les services

```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Redémarrer avec la nouvelle configuration HTTPS
docker-compose -f docker-compose.prod.yml up -d

# Suivre les logs pour voir la génération des certificats
docker-compose -f docker-compose.prod.yml logs -f traefik
```

### Étape 5 : Vérifier les certificats (1-2 minutes)

```bash
# Vérifier les logs Traefik pour voir la génération des certificats
docker-compose -f docker-compose.prod.yml logs traefik | grep -i cert

# Vérifier que le fichier acme.json existe et contient des données
ls -lh letsencrypt/acme.json

# Si le fichier existe et fait plus de 0 octets, les certificats sont générés
```

---

## ✅ Vérification

Une fois les certificats générés (1-2 minutes) :

1. **Testez HTTPS** : Accédez à `https://zoniahub.fr`
   - Le site doit charger avec un cadenas vert 🔒
   - HTTP doit automatiquement rediriger vers HTTPS

2. **Testez n8n** : Accédez à `https://zoniahub.fr/n8n`
   - Doit fonctionner en HTTPS

3. **Vérifiez les headers de sécurité** :
   - Le warning `Cross-Origin-Opener-Policy` doit avoir disparu
   - Les cookies sont maintenant sécurisés

---

## 🔧 Configuration Actuelle

### Traefik
- ✅ Port 443 exposé
- ✅ Let's Encrypt avec TLS Challenge
- ✅ Redirection automatique HTTP → HTTPS
- ✅ Email : `zonia.ai.pro@gmail.com`

### Services
- ✅ **mon-portail** : Accessible en HTTPS sur `https://zoniahub.fr`
- ✅ **n8n** : Accessible en HTTPS sur `https://zoniahub.fr/n8n`
- ✅ Cookies sécurisés activés (`SECURE_COOKIES=true`)
- ✅ Headers de sécurité activés (`FORCE_HTTPS=true`)

---

## ⚠️ Notes Importantes

1. **Premier démarrage** : Les certificats peuvent prendre 1-2 minutes à être générés. Soyez patient.

2. **Renouvellement automatique** : Let's Encrypt renouvelle automatiquement les certificats avant expiration (tous les 90 jours).

3. **Limite de taux** : Let's Encrypt limite à **50 certificats par domaine par semaine**. Ne redémarrez pas Traefik trop souvent pendant les tests.

4. **Email** : L'email est utilisé pour :
   - Les notifications d'expiration
   - Les notifications de problèmes de certificat
   - Assurez-vous qu'il est valide et que vous le consultez régulièrement

---

## 🔍 Dépannage

### Le certificat ne se génère pas

```bash
# Vérifier les logs détaillés
docker-compose -f docker-compose.prod.yml logs traefik | grep -i acme

# Vérifier les permissions
ls -la letsencrypt/
chmod 600 letsencrypt/acme.json

# Vérifier que le domaine pointe vers le serveur
nslookup zoniahub.fr
```

### Erreur de validation DNS

- ✅ Vérifiez que `zoniahub.fr` pointe vers l'IP de votre VPS
- ✅ Attendez la propagation DNS (peut prendre jusqu'à 48h)
- ✅ Utilisez `dig zoniahub.fr` ou `nslookup zoniahub.fr` pour vérifier

### Redémarrer la génération de certificat

Si vous devez régénérer les certificats (attention : limite Let's Encrypt) :

```bash
# Supprimer le fichier acme.json
rm letsencrypt/acme.json

# Redémarrer Traefik
docker-compose -f docker-compose.prod.yml restart traefik

# Suivre les logs
docker-compose -f docker-compose.prod.yml logs -f traefik
```

### Le site ne redirige pas vers HTTPS

Vérifiez que la redirection est bien configurée dans Traefik (lignes 16-17 de docker-compose.prod.yml).

---

## 📝 Changer l'Email Let's Encrypt

Si vous voulez changer l'email utilisé pour Let's Encrypt :

1. Modifiez la ligne 13 de `docker-compose.prod.yml` :
   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.email=NOUVEL_EMAIL@example.com"
   ```

2. Supprimez et recréez les certificats :
   ```bash
   rm letsencrypt/acme.json
   docker-compose -f docker-compose.prod.yml restart traefik
   ```

---

## ✅ Résultat Final

Une fois HTTPS activé :

- 🔒 Site accessible en HTTPS
- 🔒 Redirection automatique HTTP → HTTPS
- 🔒 Certificats SSL valides et renouvelés automatiquement
- 🔒 Headers de sécurité actifs (Cross-Origin-Opener-Policy, etc.)
- 🔒 Cookies sécurisés
- 🔒 Site conforme aux standards de sécurité modernes

Votre site est maintenant sécurisé ! 🎉

