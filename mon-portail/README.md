# Portail Collaboratif n8n

Portail web collaboratif pour n8n avec gestion des rôles et verrous.

## Structure du Projet

```
mon-portail/
├── src/                    # Code source React
│   ├── components/         # Composants React
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── ControlCard.jsx
│   ├── App.jsx            # Composant principal
│   ├── main.jsx           # Point d'entrée
│   └── index.css           # Styles globaux
├── public/                 # Fichiers statiques
├── server.js              # Serveur Express + Socket.io
├── vite.config.js         # Configuration Vite
└── package.json

```

## Développement

### Installation des dépendances

```bash
npm install
```

### Lancer en mode développement

Le mode développement lance à la fois Vite (frontend React) et le serveur Express :

```bash
npm run dev:full
```

Ou séparément :

```bash
# Terminal 1 - Frontend React (Vite)
npm run dev

# Terminal 2 - Backend Express
npm run server
```

### Build pour la production

```bash
npm run build
```

Le build sera dans le dossier `dist/`.

## Technologies

- **Frontend**: React 18 + Vite
- **Backend**: Express.js + Socket.io
- **Authentification**: Express-session + bcrypt

