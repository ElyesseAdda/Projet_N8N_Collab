# 🚀 Étapes Après Configuration du Domaine

Votre `docker-compose.prod.yml` est maintenant configuré avec le domaine **zoniahub.fr**.

---

## ✅ Ce qui a été configuré

- ✅ Domaine : `zoniahub.fr` (et `www.zoniahub.fr`)
- ✅ Clé API N8N : Copiée depuis votre configuration locale
- ✅ Clé de chiffrement : Copiée depuis votre configuration locale
- ✅ Mot de passe PostgreSQL : `Ayla220223@@`
- ✅ URLs N8N : `http://zoniahub.fr/n8n/`

---

## 📋 Étapes à Suivre Maintenant

### Étape 1 : Vérifier que le domaine pointe vers votre VPS

Sur votre machine locale, vérifiez que le DNS est configuré :

```bash
# Vérifier le DNS
nslookup zoniahub.fr
# ou
dig zoniahub.fr
```

Le résultat doit pointer vers l'**IP de votre VPS**.

**Si le DNS n'est pas configuré** :
- Allez dans votre panneau DNS (chez votre registrar)
- Ajoutez un enregistrement A :
  - **Nom** : `@` (ou `zoniahub.fr`)
  - **Type** : A
  - **Valeur** : IP_DU_VPS
  - **TTL** : 3600

---

### Étape 2 : Vérifier que les ports sont ouverts

Sur le VPS, vérifiez le firewall :

```bash
# Vérifier le statut du firewall
sudo ufw status

# Ouvrir le port 80 (HTTP)
sudo ufw allow 80/tcp

# Optionnel : ouvrir le port 443 (HTTPS pour plus tard)
sudo ufw allow 443/tcp

# Vérifier à nouveau
sudo ufw status
```

---

### Étape 3 : Pousser les modifications sur GitHub

Depuis votre machine locale (si vous avez modifié le fichier) :

```bash
git add docker-compose.prod.yml
git commit -m "Configuration domaine zoniahub.fr"
git push
```

---

### Étape 4 : Sur le VPS - Mettre à jour le projet

```bash
cd ~/projets/Projet_N8N_Collab
git pull
```

---

### Étape 5 : Vérifier la configuration

Vérifiez que le fichier est bien configuré :

```bash
# Voir les occurrences du domaine
grep "zoniahub.fr" docker-compose.prod.yml

# Vérifier les clés
grep "N8N_API_KEY" docker-compose.prod.yml
grep "N8N_ENCRYPTION_KEY" docker-compose.prod.yml
```

---

### Étape 6 : Démarrer les services

```bash
# Arrêter les services existants (si déjà démarrés)
docker-compose -f docker-compose.prod.yml down

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d
```

---

### Étape 7 : Vérifier que tout fonctionne

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier l'état des services
docker-compose -f docker-compose.prod.yml ps

# Tester depuis le VPS
curl http://zoniahub.fr
```

---

### Étape 8 : Tester depuis votre navigateur

1. **Ouvrez** `http://zoniahub.fr` dans votre navigateur
2. **Vérifiez** que le portail se charge
3. **Testez** la connexion
4. **Vérifiez** N8N : `http://zoniahub.fr/n8n`

---

## 🔒 Configuration HTTPS (Optionnel mais Recommandé)

Pour passer en HTTPS avec Let's Encrypt, consultez `HTTPS_SETUP.md`.

Après configuration HTTPS, vous devrez :
1. Décommenter les lignes HTTPS dans `docker-compose.prod.yml`
2. Changer `N8N_PROTOCOL=http` en `N8N_PROTOCOL=https`
3. Changer les URLs en `https://zoniahub.fr`

---

## 🆘 Dépannage

### Le domaine ne fonctionne pas

```bash
# Vérifier le DNS
nslookup zoniahub.fr

# Vérifier les logs Traefik
docker-compose -f docker-compose.prod.yml logs traefik

# Vérifier que les services sont démarrés
docker-compose -f docker-compose.prod.yml ps
```

### Erreur 502 Bad Gateway

```bash
# Vérifier les logs du portail
docker-compose -f docker-compose.prod.yml logs mon-portail

# Vérifier les logs n8n
docker-compose -f docker-compose.prod.yml logs n8n
```

### Le domaine ne se charge pas

- Vérifiez que le DNS est propagé (peut prendre jusqu'à 48h)
- Vérifiez que le port 80 est ouvert
- Vérifiez les logs : `docker-compose -f docker-compose.prod.yml logs -f`

---

## ✅ Checklist Finale

- [ ] DNS configuré et pointant vers le VPS
- [ ] Port 80 ouvert dans le firewall
- [ ] Fichier `docker-compose.prod.yml` mis à jour sur le VPS
- [ ] Services démarrés (`docker-compose up -d`)
- [ ] Test d'accès depuis le navigateur réussi
- [ ] Portail accessible sur `http://zoniahub.fr`
- [ ] N8N accessible sur `http://zoniahub.fr/n8n`

---

**Votre application est maintenant configurée pour le domaine zoniahub.fr ! 🎉**

