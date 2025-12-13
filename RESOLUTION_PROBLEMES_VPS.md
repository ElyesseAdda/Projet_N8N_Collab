# 🔧 Résolution des Problèmes sur le VPS

## 🎯 Problèmes Identifiés

### 1. Traefik : Version API Docker trop ancienne
```
Error response from daemon: client version 1.24 is too old. 
Minimum supported API version is 1.44
```

### 2. PostgreSQL : Mot de passe incorrect
```
password authentication failed for user "n8n"
```

---

## ✅ Solution 1 : Mettre à jour Traefik

La version `traefik:v2.10` est trop ancienne. J'ai mis à jour le fichier pour utiliser `traefik:v3.0`.

**Sur le VPS, exécutez :**

```bash
cd ~/projets/Projet_N8N_Collab

# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Mettre à jour le fichier (si pas déjà fait)
git pull

# Redémarrer avec la nouvelle version
docker-compose -f docker-compose.prod.yml up -d
```

---

## ✅ Solution 2 : Corriger le mot de passe PostgreSQL

Le problème vient du fait que la base de données existante utilise un ancien mot de passe, ou que les mots de passe ne correspondent pas entre les services.

### Option A : Supprimer la base de données et repartir à zéro (Recommandé)

Si vous n'avez pas de données importantes :

```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Supprimer le volume de la base de données
docker volume rm projet_n8n_collab_db_data

# Redémarrer (créera une nouvelle base avec le bon mot de passe)
docker-compose -f docker-compose.prod.yml up -d
```

### Option B : Changer le mot de passe dans la base existante

Si vous avez des données importantes :

```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Démarrer seulement PostgreSQL avec l'ancien mot de passe
# (Modifiez temporairement docker-compose.prod.yml pour utiliser l'ancien mot de passe)
# Puis exécutez :
docker-compose -f docker-compose.prod.yml up -d postgres

# Se connecter à PostgreSQL
docker exec -it projet_n8n_collab-postgres-1 psql -U n8n

# Dans PostgreSQL, changer le mot de passe :
ALTER USER n8n WITH PASSWORD 'Ayla220223@@';
\q

# Arrêter
docker-compose -f docker-compose.prod.yml down

# Redémarrer tout
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Vérification

Après avoir appliqué les solutions :

```bash
# Voir les logs (plus d'erreurs Traefik)
docker-compose -f docker-compose.prod.yml logs traefik

# Voir les logs n8n (plus d'erreur d'authentification)
docker-compose -f docker-compose.prod.yml logs n8n

# Vérifier que tous les services sont "Up"
docker-compose -f docker-compose.prod.yml ps
```

Tous les services doivent être "Up" sans erreurs.

---

## 📋 Checklist de Résolution

- [ ] Traefik mis à jour vers v3.0 (déjà fait dans le fichier)
- [ ] Base de données supprimée OU mot de passe corrigé
- [ ] Services redémarrés
- [ ] Plus d'erreurs dans les logs Traefik
- [ ] Plus d'erreurs d'authentification PostgreSQL
- [ ] Tous les services "Up" et fonctionnels

---

## 🚀 Commandes Complètes (Recommandé)

```bash
cd ~/projets/Projet_N8N_Collab

# Arrêter tout
docker-compose -f docker-compose.prod.yml down

# Supprimer la base (si pas de données importantes)
docker volume rm projet_n8n_collab_db_data

# Mettre à jour depuis GitHub (si vous avez poussé les modifications)
git pull

# Redémarrer avec la nouvelle configuration
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Résultat Attendu

Après ces étapes :
- ✅ Traefik démarre sans erreurs
- ✅ PostgreSQL accepte la connexion
- ✅ n8n se connecte à la base de données
- ✅ Tous les services fonctionnent

---

**Si les problèmes persistent, partagez les nouveaux logs !**

