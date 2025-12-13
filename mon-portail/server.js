import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialiser Socket.io avec gestion d'erreur
let io;
try {
    io = new Server(server);
    console.log('✅ Socket.io initialisé');
} catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Socket.io:', error);
    process.exit(1);
}

// Middleware pour parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des headers de sécurité
// Note: Certains headers (comme Cross-Origin-Opener-Policy) nécessitent HTTPS pour fonctionner
// Ils seront automatiquement ignorés en HTTP mais fonctionneront dès que HTTPS sera configuré
app.use((req, res, next) => {
    // Détecter si la requête arrive via HTTPS (via Traefik ou directement)
    const isSecure = req.secure || 
                     req.headers['x-forwarded-proto'] === 'https' ||
                     process.env.FORCE_HTTPS === 'true';
    
    // Headers de sécurité généraux (fonctionnent en HTTP et HTTPS)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Headers qui nécessitent HTTPS pour être appliqués
    // En HTTP, ces headers seront envoyés mais ignorés par le navigateur
    // En HTTPS, ils seront actifs et le warning disparaîtra
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // HSTS uniquement en HTTPS (sinon ignoré)
    if (isSecure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Permettre les iframes depuis la même origine (nécessaire pour intégrer n8n)
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    
    next();
});

// Configuration des sessions
// Faire confiance au proxy Traefik pour détecter HTTPS via X-Forwarded-Proto
app.set('trust proxy', 1);

// Détecter si on est en HTTPS (via env var ou via Traefik en production)
const useSecureCookies = process.env.SECURE_COOKIES === 'true' || 
                         (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true');

// Pour la production, on pourrait utiliser un store Redis ou un store de fichiers
// Pour l'instant, on utilise MemoryStore avec un warning accepté
// En production multi-instances, il faudra utiliser Redis ou un store partagé
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre-secret-session-tres-securise-changez-moi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // En HTTP: secure = false (sinon les cookies ne fonctionnent pas)
        // En HTTPS: mettre SECURE_COOKIES=true dans docker-compose.prod.yml après activation HTTPS
        secure: useSecureCookies,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'lax' // Protection CSRF
    }
    // Note: MemoryStore est utilisé par défaut
    // Pour la production multi-instances, utilisez un store Redis ou de fichiers
}));

// Charger les utilisateurs depuis le fichier JSON
function loadUsers() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        return [];
    }
}

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    // Pour les routes API, retourner un 401 JSON
    if (req.path.startsWith('/api')) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    // Pour les autres routes (pages), laisser passer pour que React gère l'authentification
    // React vérifiera l'authentification via /api/me et affichera le login si nécessaire
    return next();
}

// Routes d'authentification
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' });
    }

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.user = {
                username: user.username,
                displayName: user.displayName
            };
            res.json({ success: true, user: req.session.user });
        } else {
            res.status(401).json({ error: 'Identifiants invalides' });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.json({ success: true });
    });
});

// Route de test pour vérifier que le serveur répond
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'Le serveur répond correctement' });
});

app.get('/api/me', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Non authentifié' });
    }
});

// En production, servir les fichiers React buildés
// IMPORTANT: Ne pas intercepter /n8n - laissé au reverse proxy Traefik
if (process.env.NODE_ENV === 'production') {
    // Servir les fichiers statiques (CSS, JS, images, etc.) en premier
    // express.static servira automatiquement les fichiers qui existent dans dist/
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Protéger les routes API qui nécessitent une authentification
    // Les routes /api/* (sauf /api/login et /api/logout) nécessitent une authentification
    app.use('/api', (req, res, next) => {
        // Laisser passer /api/login et /api/logout sans authentification
        if (req.path === '/login' || req.path === '/logout') {
            return next();
        }
        // Pour les autres routes API, vérifier l'authentification
        requireAuth(req, res, next);
    });
    
    // Servir index.html pour toutes les routes restantes (SPA routing)
    // Cela permet à React Router de gérer le routing côté client
    // React vérifiera l'authentification via /api/me et affichera le login si nécessaire
    // IMPORTANT: Ce middleware doit être le dernier pour ne pas intercepter les routes API
    app.use((req, res, next) => {
        // Ne jamais servir index.html pour /n8n (doit être routé vers n8n par Traefik)
        if (req.path.startsWith('/n8n')) {
            return res.status(404).send('Not found');
        }
        // Ne pas servir index.html pour les routes API (déjà traitées)
        if (req.path.startsWith('/api')) {
            return next(); // Laisser passer, devrait déjà être traité
        }
        // Ne pas servir index.html pour les fichiers statiques (déjà servis par express.static)
        // Si on arrive ici, c'est que express.static n'a pas trouvé le fichier
        // Donc on sert index.html pour permettre le routing React
        res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi de index.html:', err);
                res.status(500).send('Erreur serveur');
            }
        });
    });
} else {
    // En développement, Vite s'occupe du frontend sur le port 5173
    // Le serveur Express ne sert que les API
}

// Stockage des utilisateurs connectés et leurs workflows
// Structure: { socketId: { userId, username, displayName, workflowId, workflowName, lastHeartbeat } }
const connectedUsers = new Map();

// Stockage des workflows actifs
// Structure: { workflowId: { name, users: [socketId1, socketId2, ...] } }
const activeWorkflows = new Map();

// Stockage du dernier utilisateur qui a sauvegardé chaque workflow
// Structure: { workflowId: { socketId, username, displayName, timestamp } }
const lastWorkflowSaver = new Map();

// Stockage temporaire des sessions utilisateur par socket
// On récupérera l'utilisateur lors de la première connexion

// Fonction pour récupérer le nom réel du workflow depuis l'API n8n
async function getWorkflowNameFromN8n(workflowId) {
    try {
        // L'API n8n est accessible via le reverse proxy Traefik
        // n8n utilise l'endpoint /api/v1/workflows/{id} (pas /rest/workflows)
        const n8nApiUrl = process.env.N8N_API_URL || 'http://n8n:5678';
        const n8nApiKey = process.env.N8N_API_KEY; // Clé API optionnelle
        
        // Préparer les en-têtes
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Ajouter la clé API si elle est configurée
        if (n8nApiKey) {
            headers['X-N8N-API-KEY'] = n8nApiKey;
        }
        
        // Créer un AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Essayer d'abord avec /api/v1/workflows/{id}
        let response = await fetch(`${n8nApiUrl}/api/v1/workflows/${workflowId}`, {
            method: 'GET',
            headers: headers,
            signal: controller.signal
        });

        // Si ça ne fonctionne pas, essayer avec /rest/workflows/{id}
        if (!response.ok && response.status === 404) {
            clearTimeout(timeoutId);
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
            
            response = await fetch(`${n8nApiUrl}/rest/workflows/${workflowId}`, {
                method: 'GET',
                headers: headers,
                signal: controller2.signal
            });
            clearTimeout(timeoutId2);
        } else {
            clearTimeout(timeoutId);
        }

        if (response.ok) {
            const workflow = await response.json();
            // Le nom du workflow peut être dans workflow.name ou workflow.data.name selon la version
            const workflowName = workflow.name || workflow.data?.name || null;
            if (workflowName) {
                return workflowName;
            }
            return null;
        } else {
            return null;
        }
    } catch (error) {
        // Si n8n n'est pas accessible (pas encore démarré, erreur réseau, timeout, etc.)
        return null;
    }
}

// Cache pour éviter de faire trop de requêtes à l'API n8n
const workflowNameCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache pour les timestamps de dernière modification des workflows
const workflowUpdateTimestamps = new Map();

async function getCachedWorkflowName(workflowId) {
    const cached = workflowNameCache.get(workflowId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.name;
    }

    const name = await getWorkflowNameFromN8n(workflowId);
    if (name) {
        workflowNameCache.set(workflowId, {
            name: name,
            timestamp: Date.now()
        });
    }
    return name;
}

// Fonction pour récupérer les informations complètes du workflow depuis n8n
async function getWorkflowFromN8n(workflowId) {
    try {
        const n8nApiUrl = process.env.N8N_API_URL || 'http://n8n:5678';
        const n8nApiKey = process.env.N8N_API_KEY;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (n8nApiKey) {
            headers['X-N8N-API-KEY'] = n8nApiKey;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        let response = await fetch(`${n8nApiUrl}/api/v1/workflows/${workflowId}`, {
            method: 'GET',
            headers: headers,
            signal: controller.signal
        });

        if (!response.ok && response.status === 404) {
            clearTimeout(timeoutId);
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
            
            response = await fetch(`${n8nApiUrl}/rest/workflows/${workflowId}`, {
                method: 'GET',
                headers: headers,
                signal: controller2.signal
            });
            clearTimeout(timeoutId2);
        } else {
            clearTimeout(timeoutId);
        }

        if (response.ok) {
            const workflow = await response.json();
            return {
                name: workflow.name || workflow.data?.name || null,
                updatedAt: workflow.updatedAt || workflow.data?.updatedAt || null,
                versionId: workflow.versionId || workflow.data?.versionId || null
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Gestion des connexions en temps réel
if (!io) {
    console.error('❌ Socket.io n\'est pas initialisé');
    process.exit(1);
}

io.on('connection', (socket) => {
    console.log(`✅ Nouvelle connexion Socket.io: ${socket.id}`);
    let user = { username: 'anonymous', displayName: 'Anonyme' };

    // Récupérer les informations utilisateur depuis la session
    socket.on('authenticate', async (userData) => {
        user = userData || { username: 'anonymous', displayName: 'Anonyme' };
    });

    socket.on('join_workflow', async (data) => {
        const workflowId = typeof data === 'string' ? data : data.workflowId;
        let workflowName = typeof data === 'object' ? data.workflowName : null;
        
        // Quitter l'ancien workflow si l'utilisateur en avait un
        if (connectedUsers.has(socket.id)) {
            const oldData = connectedUsers.get(socket.id);
            if (oldData.workflowId) {
                leaveWorkflow(socket.id, oldData.workflowId);
            }
        }

        // Récupérer le nom réel du workflow depuis n8n si on ne l'a pas
        if (!workflowName || workflowName === `Workflow ${workflowId}`) {
            workflowName = await getCachedWorkflowName(workflowId);
        }
        
        // Fallback si on n'a pas pu récupérer le nom
        if (!workflowName) {
            // Vérifier si le workflow existe déjà dans notre cache
            if (activeWorkflows.has(workflowId)) {
                workflowName = activeWorkflows.get(workflowId).name;
            } else {
                workflowName = `Workflow ${workflowId}`;
            }
        }

        // Rejoindre le nouveau workflow
        socket.join(workflowId);
        
        // Initialiser ou mettre à jour les données de l'utilisateur
        const userData = {
            userId: user.username,
            username: user.username,
            displayName: user.displayName || user.username,
            workflowId: workflowId,
            workflowName: workflowName,
            lastHeartbeat: Date.now()
        };

        // Vérifier si le workflow existe déjà
        if (!activeWorkflows.has(workflowId)) {
            // Créer un nouveau workflow
            activeWorkflows.set(workflowId, {
                name: workflowName,
                users: [socket.id]
            });
        } else {
            // Ajouter l'utilisateur au workflow existant
            const workflow = activeWorkflows.get(workflowId);
            // Toujours mettre à jour le nom si on a réussi à le récupérer depuis n8n
            if (workflowName && workflowName !== `Workflow ${workflowId}`) {
                workflow.name = workflowName;
                // Mettre à jour aussi tous les utilisateurs connectés à ce workflow
                for (const [sid, userData] of connectedUsers.entries()) {
                    if (userData.workflowId === workflowId) {
                        userData.workflowName = workflowName;
                    }
                }
            }
            if (!workflow.users.includes(socket.id)) {
                workflow.users.push(socket.id);
            }
        }
        
        // Si le nom n'a pas été récupéré (workflowName est null ou par défaut), essayer de le récupérer en arrière-plan
        if (!workflowName || workflowName === `Workflow ${workflowId}`) {
            // Récupérer le nom en arrière-plan sans bloquer
            getCachedWorkflowName(workflowId).then((realName) => {
                if (realName && realName !== `Workflow ${workflowId}`) {
                    // Mettre à jour le workflow
                    if (activeWorkflows.has(workflowId)) {
                        activeWorkflows.get(workflowId).name = realName;
                    }
                    // Mettre à jour tous les utilisateurs
                    for (const [sid, userData] of connectedUsers.entries()) {
                        if (userData.workflowId === workflowId) {
                            userData.workflowName = realName;
                        }
                    }
                    // Notifier tous les clients
                    io.to(workflowId).emit('workflow_name_updated', {
                        workflowId,
                        workflowName: realName
                    });
                    io.to(workflowId).emit('workflow_users_update', getWorkflowUsers(workflowId));
                }
            }).catch((err) => {
                // Ignorer les erreurs silencieusement
            });
        }

        connectedUsers.set(socket.id, userData);
        
        // Notifier tous les utilisateurs du workflow de la mise à jour
        io.to(workflowId).emit('workflow_users_update', getWorkflowUsers(workflowId));
    });

    socket.on('heartbeat', (workflowId) => {
        if (connectedUsers.has(socket.id)) {
            const userData = connectedUsers.get(socket.id);
            if (userData.workflowId === workflowId) {
                userData.lastHeartbeat = Date.now();
            }
        }
    });

    // Écouter les notifications de sauvegarde depuis les clients
    socket.on('workflow_save_notification', (data) => {
        const workflowId = data.workflowId;
        if (!workflowId || !connectedUsers.has(socket.id)) return;

        const userData = connectedUsers.get(socket.id);
        if (userData.workflowId === workflowId) {
            const now = Date.now();
            const existingSaver = lastWorkflowSaver.get(workflowId);
            
            // Toujours mettre à jour si c'est plus récent ou si l'existant est trop ancien (> 5 secondes)
            // Cela permet de capturer les notifications même si elles arrivent après la détection du serveur
            if (!existingSaver || 
                (now - existingSaver.timestamp) > 5000 || 
                now > existingSaver.timestamp) {
                // Enregistrer qui a sauvegardé
                lastWorkflowSaver.set(workflowId, {
                    socketId: socket.id,
                    username: userData.username,
                    displayName: userData.displayName,
                    timestamp: now
                });
            }
        }
    });

    socket.on('get_active_users', (workflowId) => {
        socket.emit('active_users', getWorkflowUsers(workflowId));
    });

    socket.on('get_all_workflows', () => {
        const allWorkflows = Array.from(activeWorkflows.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            users: data.users.map(sid => {
                const user = connectedUsers.get(sid);
                return user ? {
                    username: user.username,
                    displayName: user.displayName
                } : null;
            }).filter(Boolean)
        }));
        socket.emit('all_workflows', allWorkflows);
    });

    socket.on('disconnect', () => {
        if (connectedUsers.has(socket.id)) {
            const userData = connectedUsers.get(socket.id);
            if (userData.workflowId) {
                leaveWorkflow(socket.id, userData.workflowId);
            }
            connectedUsers.delete(socket.id);
        }
    });
});

// Fonction pour quitter un workflow
function leaveWorkflow(socketId, workflowId) {
    if (!activeWorkflows.has(workflowId)) return;

    const workflow = activeWorkflows.get(workflowId);
    workflow.users = workflow.users.filter(id => id !== socketId);

    // Si plus personne sur le workflow, le supprimer
    if (workflow.users.length === 0) {
        activeWorkflows.delete(workflowId);
    } else {
        // Notifier les autres utilisateurs
        io.to(workflowId).emit('workflow_users_update', getWorkflowUsers(workflowId));
    }
}

// Fonction pour obtenir les utilisateurs d'un workflow
function getWorkflowUsers(workflowId) {
    if (!activeWorkflows.has(workflowId)) return [];

    const workflow = activeWorkflows.get(workflowId);
    return workflow.users.map(socketId => {
        const user = connectedUsers.get(socketId);
        if (!user) return null;
        return {
            socketId,
            username: user.username,
            displayName: user.displayName,
            workflowId: user.workflowId,
            workflowName: user.workflowName
        };
    }).filter(Boolean);
}

// Watchdog : Vérifie les heartbeats toutes les 10 secondes
setInterval(() => {
    const now = Date.now();
    const TIMEOUT_LIMIT = 60000; // 60 secondes

    for (const [socketId, userData] of connectedUsers.entries()) {
        if (now - userData.lastHeartbeat > TIMEOUT_LIMIT) {
            console.log(`Timeout détecté pour l'utilisateur ${userData.username} (${socketId})`);
            if (userData.workflowId) {
                leaveWorkflow(socketId, userData.workflowId);
            }
            connectedUsers.delete(socketId);
        }
    }
}, 10000);

// Nettoyer les anciennes entrées de sauvegardeur (plus de 30 secondes)
setInterval(() => {
    const now = Date.now();
    for (const [workflowId, saverInfo] of lastWorkflowSaver.entries()) {
        if (now - saverInfo.timestamp > 30000) {
            lastWorkflowSaver.delete(workflowId);
        }
    }
}, 10000); // Vérifier toutes les 10 secondes

// Rafraîchir les noms des workflows actifs toutes les 30 secondes
setInterval(async () => {
    for (const [workflowId, workflow] of activeWorkflows.entries()) {
        // Ne rafraîchir que si le nom est encore par défaut ou si le cache est expiré
        const cached = workflowNameCache.get(workflowId);
        const shouldRefresh = !cached || (Date.now() - cached.timestamp) > CACHE_DURATION;
        
        if (shouldRefresh || workflow.name === `Workflow ${workflowId}`) {
            getCachedWorkflowName(workflowId).then((realName) => {
                if (realName && realName !== `Workflow ${workflowId}` && realName !== workflow.name) {
                    // Mettre à jour le nom
                    workflow.name = realName;
                    
                    // Mettre à jour tous les utilisateurs
                    for (const [sid, userData] of connectedUsers.entries()) {
                        if (userData.workflowId === workflowId) {
                            userData.workflowName = realName;
                        }
                    }
                    
                    // Notifier tous les clients
                    io.to(workflowId).emit('workflow_name_updated', {
                        workflowId,
                        workflowName: realName
                    });
                    io.to(workflowId).emit('workflow_users_update', getWorkflowUsers(workflowId));
                }
            }).catch(() => {
                // Ignorer les erreurs silencieusement
            });
        }
    }
}, 30000); // Toutes les 30 secondes

// Surveiller les changements de workflow pour détecter les sauvegardes
setInterval(async () => {
    for (const [workflowId, workflow] of activeWorkflows.entries()) {
        // Ne vérifier que si plusieurs utilisateurs sont sur le workflow
        if (workflow.users.length > 1) {
            getWorkflowFromN8n(workflowId).then((workflowData) => {
                if (workflowData && workflowData.updatedAt) {
                    const lastKnownUpdate = workflowUpdateTimestamps.get(workflowId);
                    const currentUpdate = new Date(workflowData.updatedAt).getTime();
                    
                    // Si c'est la première fois qu'on vérifie ce workflow, juste stocker le timestamp
                    if (!lastKnownUpdate) {
                        workflowUpdateTimestamps.set(workflowId, currentUpdate);
                        return;
                    }
                    
                    // Si le workflow a été modifié depuis la dernière vérification
                    if (currentUpdate > lastKnownUpdate) {
                        workflowUpdateTimestamps.set(workflowId, currentUpdate);
                        
                        // Message simple sans mentionner l'utilisateur
                        const message = `Le workflow a été sauvegardé.`;
                        
                        // Récupérer l'info du sauvegardeur
                        // On accepte les notifications jusqu'à 30 secondes avant la détection
                        const now = Date.now();
                        const saverInfo = lastWorkflowSaver.get(workflowId);
                        let saverSocketId = null;
                        
                        // Vérifier si l'info du sauvegardeur est encore valide (moins de 30 secondes)
                        if (saverInfo && (now - saverInfo.timestamp) < 30000) {
                            saverSocketId = saverInfo.socketId;
                        }
                        
                        // Notifier tous les utilisateurs du workflow SAUF celui qui a sauvegardé
                        const notificationData = {
                            workflowId,
                            workflowName: workflowData.name || workflow.name,
                            updatedAt: workflowData.updatedAt,
                            message: message
                        };
                        
                        if (saverSocketId) {
                            // Envoyer à tous sauf au sauvegardeur en utilisant except()
                            io.to(workflowId).except(saverSocketId).emit('workflow_saved', notificationData);
                        } else {
                            // Si on ne sait pas qui a sauvegardé, notifier tout le monde
                            io.to(workflowId).emit('workflow_saved', notificationData);
                        }
                        
                        // Ne PAS nettoyer immédiatement l'info du sauvegardeur
                        // On la garde pour les prochaines détections (elle sera nettoyée automatiquement après 30s)
                        // Cela permet de gérer les cas où le serveur détecte avant le client
                        
                        // Mettre à jour le nom si nécessaire
                        if (workflowData.name && workflowData.name !== workflow.name) {
                            workflow.name = workflowData.name;
                            
                            // Mettre à jour tous les utilisateurs
                            for (const [sid, userData] of connectedUsers.entries()) {
                                if (userData.workflowId === workflowId) {
                                    userData.workflowName = workflowData.name;
                                }
                            }
                            
                            io.to(workflowId).emit('workflow_name_updated', {
                                workflowId,
                                workflowName: workflowData.name
                            });
                        }
                    }
                }
            }).catch(() => {
                // Ignorer les erreurs silencieusement
            });
        }
    }
}, 5000); // Vérifier toutes les 5 secondes

// API pour récupérer tous les workflows actifs
app.get('/api/workflows', requireAuth, (req, res) => {
    const allWorkflows = Array.from(activeWorkflows.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        users: data.users.map(sid => {
            const user = connectedUsers.get(sid);
            return user ? {
                username: user.username,
                displayName: user.displayName
            } : null;
        }).filter(Boolean)
    }));
    res.json({ workflows: allWorkflows });
});

// API pour récupérer les utilisateurs d'un workflow spécifique
app.get('/api/workflows/:workflowId/users', requireAuth, (req, res) => {
    const { workflowId } = req.params;
    const users = getWorkflowUsers(workflowId);
    res.json({ users });
});

// API pour vérifier les mises à jour d'un workflow
app.get('/api/workflows/:workflowId/check-update', requireAuth, async (req, res) => {
    const { workflowId } = req.params;
    
    try {
        const workflowData = await getWorkflowFromN8n(workflowId);
        if (workflowData) {
            res.json({
                updatedAt: workflowData.updatedAt,
                name: workflowData.name
            });
        } else {
            res.status(404).json({ error: 'Workflow non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du workflow:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API pour mettre à jour le nom d'un workflow depuis n8n
app.post('/api/workflows/:workflowId/refresh-name', requireAuth, async (req, res) => {
    const { workflowId } = req.params;
    
    try {
        const workflowName = await getCachedWorkflowName(workflowId);
        
        if (workflowName) {
            // Mettre à jour le nom dans le workflow actif
            if (activeWorkflows.has(workflowId)) {
                activeWorkflows.get(workflowId).name = workflowName;
            }
            
            // Mettre à jour tous les utilisateurs connectés à ce workflow
            for (const [socketId, userData] of connectedUsers.entries()) {
                if (userData.workflowId === workflowId) {
                    userData.workflowName = workflowName;
                }
            }
            
            // Notifier tous les utilisateurs du workflow
            io.to(workflowId).emit('workflow_name_updated', {
                workflowId,
                workflowName
            });
            
            res.json({ success: true, workflowName });
        } else {
            res.status(404).json({ error: 'Workflow non trouvé dans n8n' });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du nom du workflow:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Gestion des signaux pour un arrêt propre
function gracefulShutdown(signal) {
    console.log(`\n${signal} reçu. Arrêt du serveur en cours...`);
    server.close(() => {
        console.log('✅ Serveur fermé proprement');
        process.exit(0);
    });
    
    // Forcer l'arrêt après 10 secondes si le serveur ne se ferme pas
    setTimeout(() => {
        console.error('⚠️ Forçage de l\'arrêt du serveur');
        process.exit(1);
    }, 10000);
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
});

// Lancement du serveur sur le port 3000
const PORT = 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Écouter les signaux de terminaison (UNIQUEMENT une fois, après la définition de gracefulShutdown)
process.on('SIGTERM', () => {
    console.log('\n⚠️ SIGTERM reçu. Arrêt du serveur en cours...');
    gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n⚠️ SIGINT reçu. Arrêt du serveur en cours...');
    gracefulShutdown('SIGINT');
});

server.listen(PORT, '0.0.0.0', () => {
    if (NODE_ENV === 'production') {
        console.log(`✅ Serveur Node en production`);
        console.log(`   Accessible via: http://zoniahub.fr ou http://www.zoniahub.fr`);
        console.log(`   Écoute sur le port ${PORT} (routé par Traefik)`);
    } else {
        console.log(`Serveur Node prêt sur http://localhost:${PORT}`);
    }
    console.log('✅ Serveur démarré avec succès. En attente de requêtes...');
});

// Gestion des erreurs de démarrage du serveur
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    
    switch (error.code) {
        case 'EACCES':
            console.error(`❌ ${bind} nécessite des privilèges élevés`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`❌ ${bind} est déjà utilisé`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

// Vérifier que le serveur écoute bien
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log(`✅ Serveur HTTP en écoute sur ${bind}`);
});