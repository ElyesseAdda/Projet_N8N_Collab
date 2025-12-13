# 🔄 Configuration Automatique des Clés

## ✅ Ce qui a été configuré

Le script `setup-production.sh` copie **automatiquement** les clés N8N depuis votre fichier local `docker-compose.yml` vers `docker-compose.prod.yml` lors de la configuration.

---

## 🎯 Comment ça fonctionne

### Lorsque vous exécutez `setup-production.sh` :

1. ✅ Le script détecte automatiquement `docker-compose.yml`
2. ✅ Il lit la **clé API N8N** (ligne 32)
3. ✅ Il lit la **clé de chiffrement** (ligne 99)
4. ✅ Il les copie automatiquement dans `docker-compose.prod.yml`
5. ✅ Aucune intervention manuelle nécessaire !

---

## 📋 Vos clés actuelles

D'après votre `docker-compose.yml` :

- **Clé API N8N** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ligne 32)
- **Clé de chiffrement** : `vzzLSkyJmYtc4wOlzRsJp36aSwMQb2ytun2dfVp0m5k=` (ligne 99)

Ces clés seront automatiquement utilisées en production. ✅

---

## 🚀 Utilisation

### Sur le VPS, exécutez simplement :

```bash
./setup-production.sh
```

Le script va :
1. Vous demander le nom de domaine
2. **Copier automatiquement les clés** depuis `docker-compose.yml`
3. Vous demander le mot de passe PostgreSQL
4. Configurer `docker-compose.prod.yml` avec tout

**C'est tout !** Pas besoin de copier/coller les clés manuellement. 🎉

---

## ✅ Avantages

- ✅ **Même compte N8N** = mêmes clés en local et production
- ✅ **Aucune erreur** de copie manuelle
- ✅ **Configuration rapide** et automatique
- ✅ **Cohérence** garantie entre les environnements

---

## 📝 Note

Si le fichier `docker-compose.yml` n'est pas trouvé sur le VPS, le script vous demandera de saisir les clés manuellement.

Pour éviter cela, assurez-vous que `docker-compose.yml` est présent dans le même répertoire que `setup-production.sh` lors de l'exécution.

---

## 🔍 Vérification

Après l'exécution, vous pouvez vérifier que les clés sont correctes :

```bash
# Vérifier la clé API
grep "N8N_API_KEY" docker-compose.prod.yml

# Vérifier la clé de chiffrement
grep "N8N_ENCRYPTION_KEY" docker-compose.prod.yml
```

Les valeurs doivent être identiques à celles de `docker-compose.yml`. ✅

