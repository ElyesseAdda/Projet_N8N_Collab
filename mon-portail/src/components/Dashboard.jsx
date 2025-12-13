import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ControlCard from './ControlCard';
import NotificationContainer from './NotificationContainer';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflowUsers, setWorkflowUsers] = useState([]);
  const [allWorkflows, setAllWorkflows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const iframeRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const notificationIdCounter = useRef(0);
  const currentWorkflowRef = useRef(null);

  // Fonction pour extraire l'ID du workflow depuis l'URL de n8n
  const extractWorkflowId = (url) => {
    if (!url) return null;
    try {
      // Format n8n: /workflow/{id} ou /workflow/{id}?...
      const match = url.match(/\/workflow\/([^/?]+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  };

  // Fonction pour obtenir le nom du workflow depuis l'iframe
  const getWorkflowName = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return null;
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      // Chercher le titre du workflow dans le DOM de n8n
      const titleElement = iframeDoc.querySelector('.workflow-title, [data-workflow-name], h1');
      return titleElement ? titleElement.textContent.trim() : null;
    } catch (e) {
      // Cross-origin ou autre erreur
      return null;
    }
  };

  // Fonction pour récupérer le nom réel du workflow depuis l'API backend
  const fetchWorkflowName = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/refresh-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.workflowName;
      }
    } catch (error) {
      // Erreur silencieuse
    }
    return null;
  };

  // Fonction pour rafraîchir le workflow dans l'iframe sans le déconnecter
  const refreshWorkflowInIframe = (workflowId) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const workflowUrl = `/n8n/workflow/${workflowId}`;
      const refreshUrl = `${workflowUrl}?refresh=${Date.now()}`;
      
      // Méthode 1: Essayer d'accéder à contentWindow pour naviguer (si même origine)
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.location) {
          const currentUrl = iframeWindow.location.href;
          // Vérifier si on est déjà sur ce workflow
          if (currentUrl.includes(`/workflow/${workflowId}`)) {
            // On est déjà sur le workflow, utiliser reload() pour rafraîchir
            iframeWindow.location.reload();
          } else {
            // Naviguer vers le workflow
            iframeWindow.location.href = refreshUrl;
          }
          return;
        }
      } catch (e) {
        // Cross-origin: on ne peut pas accéder directement
      }

      // Méthode 2: Si cross-origin, vérifier l'URL actuelle de l'iframe
      const currentSrc = iframe.src;
      if (currentSrc.includes(`/workflow/${workflowId}`)) {
        // On est déjà sur le workflow, ajouter un paramètre de cache-busting
        // Cela forcera le rechargement sans déconnecter l'utilisateur
        iframe.src = refreshUrl;
      } else {
        // Naviguer vers le workflow
        iframe.src = refreshUrl;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du workflow:', error);
    }
  };

  // Surveiller les changements d'URL dans l'iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const checkWorkflow = () => {
      let workflowId = null;
      let workflowName = null;

      try {
        // Essayer d'accéder au contenu de l'iframe (peut échouer si cross-origin)
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.location) {
          const currentUrl = iframeWindow.location.href;
          workflowId = extractWorkflowId(currentUrl);
          workflowName = getWorkflowName();
        }
      } catch (e) {
        // Cross-origin: on ne peut pas accéder au contenu
        // On utilise l'URL de l'iframe directement
        workflowId = extractWorkflowId(iframe.src);
      }

      // Si on n'a pas trouvé dans l'iframe, essayer avec l'URL actuelle
      if (!workflowId) {
        workflowId = extractWorkflowId(window.location.href);
      }

      if (workflowId && workflowId !== currentWorkflow?.id) {
        // D'abord, essayer de récupérer le nom réel depuis l'API
        fetchWorkflowName(workflowId).then((realName) => {
          const newWorkflow = { 
            id: workflowId, 
            name: realName || workflowName || `Workflow ${workflowId}` 
          };
          setCurrentWorkflow(newWorkflow);
          currentWorkflowRef.current = newWorkflow;

          // Notifier le serveur
          if (socket) {
            socket.emit('join_workflow', {
              workflowId: workflowId,
              workflowName: newWorkflow.name
            });
          }
        }).catch(() => {
          // En cas d'erreur, utiliser le nom par défaut
          const newWorkflow = { 
            id: workflowId, 
            name: workflowName || `Workflow ${workflowId}` 
          };
          setCurrentWorkflow(newWorkflow);
          currentWorkflowRef.current = newWorkflow;

          if (socket) {
            socket.emit('join_workflow', {
              workflowId: workflowId,
              workflowName: newWorkflow.name
            });
          }
        });
      }
    };

    // Vérifier immédiatement
    checkWorkflow();

    // Vérifier périodiquement (toutes les 2 secondes)
    const interval = setInterval(checkWorkflow, 2000);

    // Écouter les changements de src de l'iframe
    const observer = new MutationObserver(checkWorkflow);
    if (iframe) {
      observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
    }

    // Écouter les événements de navigation dans l'iframe si possible
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('popstate', checkWorkflow);
        iframe.contentWindow.addEventListener('hashchange', checkWorkflow);
      }
    } catch (e) {
      // Cross-origin, on ignore
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.removeEventListener('popstate', checkWorkflow);
          iframe.contentWindow.removeEventListener('hashchange', checkWorkflow);
        }
      } catch (e) {
        // Ignorer
      }
    };
  }, [socket, currentWorkflow]);

  useEffect(() => {
    // Initialiser la connexion Socket.io
    const newSocket = io();
    setSocket(newSocket);

    // Authentifier l'utilisateur
    if (user) {
      newSocket.emit('authenticate', {
        username: user.username,
        displayName: user.displayName || user.username
      });
    }

    // Écouter les mises à jour des utilisateurs du workflow
    newSocket.on('workflow_users_update', (users) => {
      setWorkflowUsers(users);
    });

    // Écouter les mises à jour de tous les workflows
    newSocket.on('all_workflows', (workflows) => {
      setAllWorkflows(workflows);
    });

    // Écouter les mises à jour de nom de workflow
    newSocket.on('workflow_name_updated', (data) => {
      // Mettre à jour le workflow actuel si c'est le sien
      setCurrentWorkflow(prev => {
        if (prev && prev.id === data.workflowId) {
          const updated = {
            ...prev,
            name: data.workflowName
          };
          currentWorkflowRef.current = updated;
          return updated;
        }
        return prev;
      });
      
      // Mettre à jour aussi la liste des workflows
      setAllWorkflows(prev => 
        prev.map(wf => 
          wf.id === data.workflowId 
            ? { ...wf, name: data.workflowName }
            : wf
        )
      );
    });


    // Écouter les notifications de sauvegarde de workflow
    newSocket.on('workflow_saved', (data) => {
      // Vérifier que c'est bien le workflow actuel (utiliser la ref pour avoir la valeur actuelle)
      const workflow = currentWorkflowRef.current;
      if (workflow && workflow.id === data.workflowId) {
        // Afficher une notification avec option de rafraîchissement
        const notificationId = notificationIdCounter.current++;
        const notification = {
          id: notificationId,
          message: 'Le workflow a été sauvegardé.',
          type: 'info',
          duration: 8000, // Plus de temps pour que l'utilisateur puisse cliquer
          workflowId: data.workflowId,
          hasRefreshButton: true // Indicateur pour afficher un bouton de rafraîchissement
        };
        
        setNotifications(prev => [...prev, notification]);
      }
    });


    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      newSocket.close();
    };
  }, [user]);

  // Envoyer des heartbeats périodiques
  useEffect(() => {
    if (!socket || !currentWorkflow) return;

    heartbeatIntervalRef.current = setInterval(() => {
      if (currentWorkflow?.id) {
        socket.emit('heartbeat', currentWorkflow.id);
      }
    }, 5000); // Toutes les 5 secondes

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [socket, currentWorkflow]);

  // Surveiller les changements du workflow pour détecter les sauvegardes
  useEffect(() => {
    if (!socket || !currentWorkflow) return;

    let lastKnownUpdate = null;

    const checkWorkflowUpdate = async () => {
      try {
        // Récupérer les informations du workflow depuis l'API backend
        const response = await fetch(`/api/workflows/${currentWorkflow.id}/check-update`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.updatedAt) {
            const currentUpdate = new Date(data.updatedAt).getTime();
            
            // Si c'est la première vérification, juste stocker le timestamp
            if (!lastKnownUpdate) {
              lastKnownUpdate = currentUpdate;
              return;
            }

            // Si le workflow a été modifié depuis la dernière vérification
            if (currentUpdate > lastKnownUpdate) {
              lastKnownUpdate = currentUpdate;
              
              // Notifier le serveur que cet utilisateur a probablement sauvegardé
              // (on suppose que si le workflow a changé et que l'utilisateur est actif dessus, c'est lui)
              socket.emit('workflow_save_notification', {
                workflowId: currentWorkflow.id
              });
            }
          }
        }
      } catch (error) {
        // Ignorer les erreurs silencieusement
      }
    };

    // Vérifier toutes les 3 secondes
    const interval = setInterval(checkWorkflowUpdate, 3000);

    return () => clearInterval(interval);
  }, [socket, currentWorkflow]);

  // Demander la liste des workflows actifs périodiquement
  useEffect(() => {
    if (!socket) return;

    const fetchWorkflows = () => {
      socket.emit('get_all_workflows');
    };

    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 5000);

    return () => clearInterval(interval);
  }, [socket]);

  // Synchroniser le nom du workflow actuel avec la liste des workflows
  useEffect(() => {
    if (!currentWorkflow || allWorkflows.length === 0) return;

    const workflowFromList = allWorkflows.find(wf => wf.id === currentWorkflow.id);
    if (workflowFromList && workflowFromList.name && workflowFromList.name !== `Workflow ${currentWorkflow.id}`) {
      // Mettre à jour seulement si le nom actuel est encore par défaut ou différent
      if (currentWorkflow.name === `Workflow ${currentWorkflow.id}` || currentWorkflow.name !== workflowFromList.name) {
        setCurrentWorkflow(prev => {
          const updated = {
            ...prev,
            name: workflowFromList.name
          };
          currentWorkflowRef.current = updated;
          return updated;
        });
      }
    }
  }, [allWorkflows, currentWorkflow?.id]);

  // Rafraîchir le nom du workflow actuel périodiquement
  useEffect(() => {
    if (!currentWorkflow || !socket) return;

    // Si le nom est encore par défaut, essayer de le récupérer
    if (currentWorkflow.name === `Workflow ${currentWorkflow.id}`) {
      const refreshName = async () => {
        const realName = await fetchWorkflowName(currentWorkflow.id);
        if (realName && realName !== `Workflow ${currentWorkflow.id}`) {
          setCurrentWorkflow(prev => {
            const updated = {
              ...prev,
              name: realName
            };
            currentWorkflowRef.current = updated;
            return updated;
          });
          
          // Notifier le serveur du nom mis à jour
          socket.emit('join_workflow', {
            workflowId: currentWorkflow.id,
            workflowName: realName
          });
        }
      };
      
      refreshName();
      const interval = setInterval(refreshName, 10000); // Toutes les 10 secondes
      return () => clearInterval(interval);
    }
  }, [currentWorkflow, socket]);

  const handleTestInjection = () => {
    const iframe = document.getElementById('n8n-frame');
    try {
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      innerDoc.body.style.border = '10px solid red';
      alert("Victoire ! Le portail contrôle l'iframe.");
    } catch (e) {
      console.error(e);
      alert("Échec de sécurité (Attendu) :\n" + e.message);
    }
  };

  const handleSetWorkflow = (workflowId) => {
    // Essayer de récupérer le nom réel du workflow
    fetchWorkflowName(workflowId).then((realName) => {
      const newWorkflow = { 
        id: workflowId, 
        name: realName || `Workflow ${workflowId}` 
      };
      setCurrentWorkflow(newWorkflow);
      currentWorkflowRef.current = newWorkflow;

      if (socket) {
        socket.emit('join_workflow', {
          workflowId: workflowId,
          workflowName: newWorkflow.name
        });
      }
    }).catch(() => {
      // En cas d'erreur, utiliser le nom par défaut
      const newWorkflow = { 
        id: workflowId, 
        name: `Workflow ${workflowId}` 
      };
      setCurrentWorkflow(newWorkflow);
      currentWorkflowRef.current = newWorkflow;

      if (socket) {
        socket.emit('join_workflow', {
          workflowId: workflowId,
          workflowName: newWorkflow.name
        });
      }
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Vérifier si plusieurs utilisateurs sont sur le workflow actuel
  const hasMultipleUsers = workflowUsers.length > 1;

  return (
    <div className="dashboard">
      <iframe 
        id="n8n-frame" 
        ref={iframeRef}
        src="/n8n/" 
        title="n8n Workflow"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      ></iframe>
      
      {/* Badge d'avertissement pour plusieurs utilisateurs */}
      {hasMultipleUsers && currentWorkflow && (
        <div className="multi-user-warning-badge">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <div className="warning-title">
              {workflowUsers.length} utilisateur{workflowUsers.length > 1 ? 's' : ''} sur ce workflow
            </div>
            <div className="warning-message">
              Attention lors de la sauvegarde
            </div>
          </div>
        </div>
      )}
      
      <button
        className="toggle-card-btn"
        onClick={() => setIsCardOpen(!isCardOpen)}
        title="Ouvrir le panneau de contrôle"
      >
        ☰
      </button>

      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
        onRefreshWorkflow={refreshWorkflowInIframe}
      />

      {isCardOpen && (
        <ControlCard
          user={user}
          currentWorkflow={currentWorkflow}
          workflowUsers={workflowUsers}
          allWorkflows={allWorkflows}
          onClose={() => setIsCardOpen(false)}
          onLogout={onLogout}
          onTestInjection={handleTestInjection}
          onSetWorkflow={handleSetWorkflow}
        />
      )}
    </div>
  );
}

export default Dashboard;

