# Zonia sur le VPS

Document de référence pour les collaborateurs. Il décrit le serveur en production au 20 octobre 2026. Aucun mot de passe n’est écrit ici : les secrets sont uniquement dans `/opt/zonia/.env` sur le VPS.

## Accès

| Quoi | Adresse |
|---|---|
| Vitrine publique | https://zoniahub.fr |
| Connexion au portail | https://zoniahub.fr/connect |
| n8n | https://zoniahub.fr/n8n/ |
| Serveur (SSH) | `root@72.60.90.127` |
| Nom interne du serveur | `srv965557` |

`srv965557` ne fonctionne pas depuis un PC. Pour copier un fichier, utiliser l’IP `72.60.90.127`.

Les comptes du portail sont `yacineAA`, `ElyesseAA` et `KevinD`. Les mots de passe ont été choisis au déploiement et hashés dans `/opt/zonia/mon-portail/users.json` sur le serveur. Ils ne sont pas dans Git.

## Ce qu’il ne faut jamais faire

Ce VPS héberge déjà les applications de trois sociétés. Zonia est à côté, pas à la place.

Ne pas toucher à ces dossiers et fichiers :

- `/opt/onlyoffice`
- les sites Nginx déjà présents : `myp3000app`, `elekable.conf`, `mjrservice.conf`, `office.elekable.fr`, `office.mjrserviceapp.com`

Ne pas lancer, sur ce VPS, les fichiers `docker-compose.yml` et `docker-compose.prod.yml` de ce dépôt. Ils démarrent Traefik sur les ports 80, 443 et 8080, déjà pris par Nginx et OnlyOffice.

Ne pas publier le port 5432 : un Postgres de la machine écoute déjà sur `127.0.0.1:5432`. Le Postgres de Zonia reste dans Docker, sans port ouvert sur l’hôte.

Ne jamais lancer `docker compose down` en dehors de `/opt/zonia`, et ne jamais ajouter `-v` : cela efface la base n8n.

## Ports

| Port | Qui l’utilise | Visible sur Internet |
|---|---|---|
| 80 et 443 | Nginx, déjà en place | oui |
| 8080 | OnlyOffice | ne pas y toucher |
| 5432 | Postgres de la machine, en local seulement | non |
| 3000 | Portail Zonia, sur `127.0.0.1` seulement | non, Nginx le relaie |
| 5678 | n8n, sur `127.0.0.1` seulement | non, Nginx le relaie |

## Où sont les fichiers

| Élément | Chemin sur le VPS |
|---|---|
| Projet | `/opt/zonia` |
| Code du portail | `/opt/zonia/mon-portail` |
| Variables secrètes | `/opt/zonia/.env` |
| Compose utilisé | `/opt/zonia/docker-compose.vps.yml` |
| Site Nginx | `/etc/nginx/sites-available/zoniahub.fr` |
| Lien activé | `/etc/nginx/sites-enabled/zoniahub.fr` |
| Copie de Nginx avant Zonia | `/root/nginx-backup` |
| Certificat | `/etc/letsencrypt/live/zoniahub.fr/` |

Le certificat Let’s Encrypt expire le 18 janvier 2027. Certbot le renouvelle seul.

Le code sur le VPS a été copié par archive, ce n’est pas un clone Git. Pour mettre à jour, renvoyer les fichiers puis reconstruire le portail (commande plus bas). Ne pas écraser `/opt/zonia/.env` ni `mon-portail/users.json`.

## Conteneurs Docker

Le projet Docker s’appelle `zonia`. Toutes les commandes se lancent depuis `/opt/zonia`.

| Conteneur | Rôle |
|---|---|
| `zonia-mon-portail-1` | Site React + API Express |
| `zonia-n8n-1` | n8n |
| `zonia-postgres-1` | Base de n8n uniquement |

Voir l’état :

```bash
cd /opt/zonia
docker compose -p zonia -f docker-compose.vps.yml ps
```

Voir les logs du portail :

```bash
docker compose -p zonia -f docker-compose.vps.yml logs --tail 50 mon-portail
```

Redémarrer uniquement Zonia :

```bash
cd /opt/zonia
docker compose -p zonia -f docker-compose.vps.yml restart
```

Reconstruire le portail après un changement de code ou de variable `VITE_` :

```bash
cd /opt/zonia
docker compose -p zonia -f docker-compose.vps.yml up -d --force-recreate mon-portail
```

Le premier démarrage installe les paquets et construit le site. Attendre la ligne `Serveur démarré avec succès` dans les logs. `Ctrl+C` sur `logs -f` ferme l’affichage, pas le site.

## Fichier `.env`

Présent seulement sur le serveur. Les deux mots de passe Postgres sont identiques.

| Variable | Rôle | État au déploiement |
|---|---|---|
| `POSTGRES_PASSWORD` | Mot de passe du Postgres Docker | créé sur le serveur |
| `DB_POSTGRESDB_PASSWORD` | Le même, lu par n8n | créé sur le serveur |
| `N8N_ENCRYPTION_KEY` | Chiffre les identifiants n8n | clé neuve, à ne jamais changer ensuite |
| `SESSION_SECRET` | Sessions du portail | créé sur le serveur |
| `N8N_API_KEY` | Le portail appelle l’API n8n | vide |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Formulaire de contact | vides |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID` | Envoi vers Google Drive | vides |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Tableaux et chat | vides |

Sans Supabase, la vitrine et la connexion marchent, les tableaux et le chat non. Les variables `VITE_` sont lues au moment du build : après les avoir remplies, relancer la commande de reconstruction du portail.

`N8N_ENCRYPTION_KEY` ne doit plus changer. Une nouvelle clé rend illisibles les identifiants enregistrés dans n8n.

La clé API n8n se crée dans n8n : **Settings → API → Create an API key**, puis on la colle dans `N8N_API_KEY` et on reconstruit le portail.

## Nginx

Nginx est la seule entrée publique. Le fichier de Zonia envoie :

- `https://zoniahub.fr/n8n/` vers `127.0.0.1:5678`
- tout le reste du domaine vers `127.0.0.1:3000`

La ligne n8n doit se terminer par un slash :

```nginx
proxy_pass http://127.0.0.1:5678/;
```

Ce slash retire le préfixe `/n8n` avant d’atteindre n8n. Sans lui, l’éditeur s’affiche en page blanche : le navigateur reçoit du HTML à la place des fichiers JavaScript.

Après une modification de ce fichier :

```bash
nginx -t && systemctl reload nginx
```

Ne recharger que si le test affiche `syntax is ok` et `test is successful`. Deux avertissements `protocol options redefined` existaient déjà sur `myp3000app` et `office.mjrserviceapp.com`. Ils ne viennent pas de Zonia.

## Comptes du portail

Pour changer un mot de passe : éditer les mots de passe en clair dans `/opt/zonia/mon-portail/create-users.js`, puis :

```bash
cd /opt/zonia
docker compose -p zonia -f docker-compose.vps.yml exec mon-portail node create-users.js
```

Le fichier `users.json` est relu à chaque connexion. Inutile de redémarrer. Ne pas committer `users.json` ni `create-users.js` s’il contient des mots de passe en clair.

## Pièges déjà rencontrés

Le portail redémarre en boucle avec le code 127 si `NODE_ENV=production` est défini dans l’environnement Docker du conteneur. `npm install` ignore alors Vite. `NODE_ENV` est posé seulement au lancement de `node server.js`, dans la commande du conteneur.

`getent hosts zoniahub.fr` sur le VPS peut encore afficher l’ancienne IP `78.47.196.29` alors que le DNS public est déjà à `72.60.90.127`. Vérifier avec `nslookup zoniahub.fr 1.1.1.1`.

L’ancien serveur n’est plus accessible. Cette installation est neuve : pas d’anciens workflows n8n, pas d’ancien `.env`.
