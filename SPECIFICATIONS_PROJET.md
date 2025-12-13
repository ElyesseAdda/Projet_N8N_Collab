s# Spécifications Techniques : Orchestrateur Collaboratif pour n8n

Ce document sert de référence technique pour la mise en place d'un portail web permettant la collaboration sécurisée sur une instance n8n centralisée via Docker.

---

## 1. Vue d'Ensemble & Architecture

L'objectif est de centraliser l'utilisation de n8n pour une équipe tout en gérant les conflits d'édition grâce à un système de verrouillage (Mutex) et de détection de présence (Heartbeat).

### La Stack Technique (Dockerisé sur VPS)
* **Infrastructure :** Docker & Docker Compose.
* **Routing :** Traefik (Reverse Proxy) pour gérer les sous-domaines et le SSL.
* **Base de Données :** PostgreSQL (Pour n8n, plus robuste que SQLite).
* **Cœur n8n :** Instance officielle n8n (Stateless).
* **Portail Collaboratif (Ton App) :**
    * **Backend :** Node.js + Socket.io (Gestion des verrous et Websockets).
    * **Frontend :** Interface Web intégrant n8n via `<iframe>`.

---

## 2. Glossaire Technique

| Terme | Définition & Rôle dans le projet |
| :--- | :--- |
| **VPS** (Virtual Private Server) | L'ordinateur distant où sera installé Docker. C'est le "terrain" où on construit l'usine. |
| **Reverse Proxy** (Traefik/Nginx) | Le "réceptionniste". Il reçoit les demandes (http://mon-site.com) et les redirige vers le bon conteneur Docker. Indispensable pour que le portail et n8n cohabitent proprement. |
| **Docker Compose** | Le plan de construction. Un fichier `.yml` qui dit : "Lance n8n, lance la base de données, lance le portail, et connecte-les ensemble". |
| **WebSocket** (Socket.io) | Un canal de communication ouvert en continu. Contrairement à une page web classique qui se recharge, le WebSocket permet au serveur de dire instantanément au client : *"Stop ! Michel vient de prendre la main"*. |
| **Heartbeat** (Battement de cœur) | Signal envoyé périodiquement par le navigateur de l'utilisateur vers le serveur pour dire "Je suis toujours là". Si le signal s'arrête, le serveur sait que l'utilisateur est parti (crash, coupure internet). |
| **Same-Origin Policy** | Règle de sécurité web. Pour que ton portail puisse modifier le comportement de n8n (cacher le bouton sauvegarde), ils doivent partager le même domaine racine (ex: `app.domaine.com` et `n8n.domaine.com`). |
| **Mutex** (Exclusion Mutuelle) | Logique qui garantit qu'une seule personne possède la "clé" (le droit d'écriture) à un instant T. |

---

## 3. Fonctionnalités & Logique Métier

### A. Gestion de la Concurrence (Qui a le droit ?)
1.  **Priorité au Premier Arrivé :** Le premier utilisateur qui ouvre un workflow devient **ÉDITEUR**.
2.  **Mode Spectateur Force :** Tout utilisateur suivant arrivant sur ce même workflow devient **SPECTATEUR**.
3.  **Restriction Technique :** * L'éditeur a l'interface n8n normale.
    * Le spectateur voit l'interface n8n, mais via une injection de script, le bouton "Sauvegarder" est masqué et les raccourcis clavier (Ctrl+S) sont bloqués.

### B. Passation de Droits (Handover)
* Une barre latérale sur le portail affiche les avatars des utilisateurs présents sur le workflow.
* L'ÉDITEUR peut cliquer sur l'avatar d'un SPECTATEUR pour lui transférer les droits ("Donner la main").
* Le système met à jour les rôles instantanément via WebSocket.

### C. Fiabilité & Déconnexion (Heartbeat)
* **Problème :** Si l'ÉDITEUR ferme son navigateur brutalement ou perd sa connexion Wi-Fi, le workflow reste verrouillé "à vie".
* **Solution (Heartbeat) :**
    * Le client envoie un `ping` toutes les 5 secondes.
    * Si le serveur ne reçoit pas de `ping` pendant **60 secondes**, il considère l'utilisateur comme "Mort".
    * Le serveur libère le verrou et le propose automatiquement au prochain utilisateur dans la file ou repasse le workflow en "libre".

---

## 4. Feuille de Route d'Implémentation

### Étape 1 : Préparation Infrastructure
* [ ] Louer un VPS.
* [ ] Configurer le nom de domaine (DNS) pour `portail.tondomaine.com` et `n8n.tondomaine.com`.
* [ ] Installer Docker et Docker Compose sur le VPS.

### Étape 2 : Configuration Docker
Créer un `docker-compose.yml` incluant :
* Le service `traefik` (ou Nginx).
* Le service `postgres`.
* Le service `n8n` (avec les variables d'environnement `N8N_EDITOR_BASE_URL` configurées pour pointer vers le sous-domaine).
* Le service `mon-portail` (ton application Node.js).

### Étape 3 : Développement Backend (Node.js)
* [ ] Mettre en place un serveur Express simple.
* [ ] Installer `socket.io`.
* [ ] Coder la logique de "Room" (1 Room = 1 Workflow ID).
* [ ] Coder le "Watchdog" (boucle qui vérifie les Heartbeats).

### Étape 4 : Développement Frontend
* [ ] Créer la page avec l'Iframe n8n.
* [ ] Coder le script d'injection (Manipulation du DOM de l'iframe pour cacher les boutons).
* [ ] Connecter le client Socket.io pour envoyer les `heartbeats` et recevoir les changements de rôles.

---

## 5. Code Critique (Snippets)

### Backend : Gestion du Heartbeat et des Verrous (Server.js)

```javascript
const io = require('socket.io')(server);

// Stockage : { 'workflow_123': { editorId: 'socket_A', lastHeartbeat: 1700000000 } }
let rooms = {}; 

const TIMEOUT_LIMIT = 60000; // 60 secondes

io.on('connection', (socket) => {
    
    socket.on('join_workflow', (workflowId) => {
        socket.join(workflowId);
        
        // Initialisation de la room
        if (!rooms[workflowId]) {
            rooms[workflowId] = { editorId: socket.id, lastHeartbeat: Date.now() };
            socket.emit('role', 'EDITOR');
        } else {
            // Room déjà occupée -> Spectateur
            socket.emit('role', 'SPECTATOR');
        }
    });

    socket.on('heartbeat', (workflowId) => {
        if (rooms[workflowId] && rooms[workflowId].editorId === socket.id) {
            rooms[workflowId].lastHeartbeat = Date.now();
        }
    });
});

// Watchdog : Vérifie toutes les 10 secondes les inactifs
setInterval(() => {
    const now = Date.now();
    for (const [wfId, room] of Object.entries(rooms)) {
        if (now - room.lastHeartbeat > TIMEOUT_LIMIT) {
            console.log(`Timeout sur le workflow ${wfId}`);
            // Libérer la room ou assigner à quelqu'un d'autre
            delete rooms[wfId]; 
            io.to(wfId).emit('info', 'L\'éditeur a été déconnecté. Workflow libéré.');
            // Ici, on pourrait ajouter une logique pour élire un nouvel éditeur
        }
    }
}, 10000);

// Fonction pour sécuriser l'iframe en mode spectateur
function setReadOnlyMode(enable) {
    const iframe = document.getElementById('n8n-frame');
    // Accès au DOM interne de l'iframe (Possible car même domaine)
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

    if (enable) {
        // Injection CSS pour cacher le bouton Save
        const style = innerDoc.createElement('style');
        style.id = 'lock-style';
        style.innerHTML = `
            .n8n-workflow-save-button { display: none !important; }
            .n8n-workflow-activate-button { pointer-events: none !important; opacity: 0.5; }
        `;
        innerDoc.head.appendChild(style);
    } else {
        // Retirer la protection
        const style = innerDoc.getElementById('lock-style');
        if (style) style.remove();
    }
}