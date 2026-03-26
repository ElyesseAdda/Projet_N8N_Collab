import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ControlCard from '../../components/ControlCard';
import NotificationContainer from '../../components/NotificationContainer';
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

  const extractWorkflowId = (url) => {
    if (!url) return null;
    try {
      const match = url.match(/\/workflow\/([^/?]+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  };

  const getWorkflowName = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return null;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const titleElement = iframeDoc.querySelector('.workflow-title, [data-workflow-name], h1');
      return titleElement ? titleElement.textContent.trim() : null;
    } catch (e) {
      return null;
    }
  };

  const fetchWorkflowName = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/refresh-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data.workflowName;
      }
    } catch (error) {
      // silent
    }
    return null;
  };

  const refreshWorkflowInIframe = (workflowId) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const workflowUrl = `/n8n/workflow/${workflowId}`;
      const refreshUrl = `${workflowUrl}?refresh=${Date.now()}`;
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.location) {
          const currentUrl = iframeWindow.location.href;
          if (currentUrl.includes(`/workflow/${workflowId}`)) {
            iframeWindow.location.reload();
          } else {
            iframeWindow.location.href = refreshUrl;
          }
          return;
        }
      } catch (e) { /* cross-origin */ }
      const currentSrc = iframe.src;
      if (currentSrc.includes(`/workflow/${workflowId}`)) {
        iframe.src = refreshUrl;
      } else {
        iframe.src = refreshUrl;
      }
    } catch (error) {
      console.error('Erreur lors du rafraichissement du workflow:', error);
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const checkWorkflow = () => {
      let workflowId = null;
      let workflowName = null;
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.location) {
          const currentUrl = iframeWindow.location.href;
          workflowId = extractWorkflowId(currentUrl);
          workflowName = getWorkflowName();
        }
      } catch (e) {
        workflowId = extractWorkflowId(iframe.src);
      }
      if (!workflowId) {
        workflowId = extractWorkflowId(window.location.href);
      }
      if (workflowId && workflowId !== currentWorkflow?.id) {
        fetchWorkflowName(workflowId).then((realName) => {
          const newWorkflow = { id: workflowId, name: realName || workflowName || `Workflow ${workflowId}` };
          setCurrentWorkflow(newWorkflow);
          currentWorkflowRef.current = newWorkflow;
          if (socket) {
            socket.emit('join_workflow', { workflowId, workflowName: newWorkflow.name });
          }
        }).catch(() => {
          const newWorkflow = { id: workflowId, name: workflowName || `Workflow ${workflowId}` };
          setCurrentWorkflow(newWorkflow);
          currentWorkflowRef.current = newWorkflow;
          if (socket) {
            socket.emit('join_workflow', { workflowId, workflowName: newWorkflow.name });
          }
        });
      }
    };
    checkWorkflow();
    const interval = setInterval(checkWorkflow, 2000);
    const observer = new MutationObserver(checkWorkflow);
    if (iframe) observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('popstate', checkWorkflow);
        iframe.contentWindow.addEventListener('hashchange', checkWorkflow);
      }
    } catch (e) { /* cross-origin */ }
    return () => {
      clearInterval(interval);
      observer.disconnect();
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.removeEventListener('popstate', checkWorkflow);
          iframe.contentWindow.removeEventListener('hashchange', checkWorkflow);
        }
      } catch (e) { /* ignore */ }
    };
  }, [socket, currentWorkflow]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    if (user) {
      newSocket.emit('authenticate', { username: user.username, displayName: user.displayName || user.username });
    }
    newSocket.on('workflow_users_update', (users) => setWorkflowUsers(users));
    newSocket.on('all_workflows', (workflows) => setAllWorkflows(workflows));
    newSocket.on('workflow_name_updated', (data) => {
      setCurrentWorkflow((prev) => {
        if (prev && prev.id === data.workflowId) {
          const updated = { ...prev, name: data.workflowName };
          currentWorkflowRef.current = updated;
          return updated;
        }
        return prev;
      });
      setAllWorkflows((prev) => prev.map((wf) => (wf.id === data.workflowId ? { ...wf, name: data.workflowName } : wf)));
    });
    newSocket.on('workflow_saved', (data) => {
      const workflow = currentWorkflowRef.current;
      if (workflow && workflow.id === data.workflowId) {
        const notificationId = notificationIdCounter.current++;
        const notification = { id: notificationId, message: 'Le workflow a ete sauvegarde.', type: 'info', duration: 8000, workflowId: data.workflowId, hasRefreshButton: true };
        setNotifications((prev) => [...prev, notification]);
      }
    });
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !currentWorkflow) return;
    heartbeatIntervalRef.current = setInterval(() => {
      if (currentWorkflow?.id) socket.emit('heartbeat', currentWorkflow.id);
    }, 5000);
    return () => { if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current); };
  }, [socket, currentWorkflow]);

  useEffect(() => {
    if (!socket || !currentWorkflow) return;
    let lastKnownUpdate = null;
    const checkWorkflowUpdate = async () => {
      try {
        const response = await fetch(`/api/workflows/${currentWorkflow.id}/check-update`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.updatedAt) {
            const currentUpdate = new Date(data.updatedAt).getTime();
            if (!lastKnownUpdate) { lastKnownUpdate = currentUpdate; return; }
            if (currentUpdate > lastKnownUpdate) {
              lastKnownUpdate = currentUpdate;
              socket.emit('workflow_save_notification', { workflowId: currentWorkflow.id });
            }
          }
        }
      } catch (error) { /* silent */ }
    };
    const interval = setInterval(checkWorkflowUpdate, 3000);
    return () => clearInterval(interval);
  }, [socket, currentWorkflow]);

  useEffect(() => {
    if (!socket) return;
    const fetchWorkflows = () => socket.emit('get_all_workflows');
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 5000);
    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (!currentWorkflow || allWorkflows.length === 0) return;
    const workflowFromList = allWorkflows.find((wf) => wf.id === currentWorkflow.id);
    if (workflowFromList && workflowFromList.name && workflowFromList.name !== `Workflow ${currentWorkflow.id}`) {
      if (currentWorkflow.name === `Workflow ${currentWorkflow.id}` || currentWorkflow.name !== workflowFromList.name) {
        setCurrentWorkflow((prev) => { const updated = { ...prev, name: workflowFromList.name }; currentWorkflowRef.current = updated; return updated; });
      }
    }
  }, [allWorkflows, currentWorkflow?.id]);

  useEffect(() => {
    if (!currentWorkflow || !socket) return;
    if (currentWorkflow.name === `Workflow ${currentWorkflow.id}`) {
      const refreshName = async () => {
        const realName = await fetchWorkflowName(currentWorkflow.id);
        if (realName && realName !== `Workflow ${currentWorkflow.id}`) {
          setCurrentWorkflow((prev) => { const updated = { ...prev, name: realName }; currentWorkflowRef.current = updated; return updated; });
          socket.emit('join_workflow', { workflowId: currentWorkflow.id, workflowName: realName });
        }
      };
      refreshName();
      const interval = setInterval(refreshName, 10000);
      return () => clearInterval(interval);
    }
  }, [currentWorkflow, socket]);

  const handleTestInjection = () => {
    const iframe = document.getElementById('n8n-frame');
    try {
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      innerDoc.body.style.border = '10px solid red';
      alert("Victoire ! Le portail controle l'iframe.");
    } catch (e) {
      console.error(e);
      alert('Echec de securite (Attendu) :\n' + e.message);
    }
  };

  const handleSetWorkflow = (workflowId) => {
    fetchWorkflowName(workflowId).then((realName) => {
      const newWorkflow = { id: workflowId, name: realName || `Workflow ${workflowId}` };
      setCurrentWorkflow(newWorkflow);
      currentWorkflowRef.current = newWorkflow;
      if (socket) socket.emit('join_workflow', { workflowId, workflowName: newWorkflow.name });
    }).catch(() => {
      const newWorkflow = { id: workflowId, name: `Workflow ${workflowId}` };
      setCurrentWorkflow(newWorkflow);
      currentWorkflowRef.current = newWorkflow;
      if (socket) socket.emit('join_workflow', { workflowId, workflowName: newWorkflow.name });
    });
  };

  const removeNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const hasMultipleUsers = workflowUsers.length > 1;
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div className="dashboard">
      {isDevelopment ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#fff', color: '#333', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Mode Developpement</h2>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>N8N n est pas disponible en developpement.</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Le Dashboard fonctionnera en production avec N8N integre.</p>
        </div>
      ) : (
        <iframe id="n8n-frame" ref={iframeRef} src="/n8n/" title="n8n Workflow" allow="fullscreen" />
      )}
      {hasMultipleUsers && currentWorkflow && (
        <div className="multi-user-warning-badge">
          <div className="warning-icon">&#9888;&#65039;</div>
          <div className="warning-content">
            <div className="warning-title">{workflowUsers.length} utilisateur{workflowUsers.length > 1 ? 's' : ''} sur ce workflow</div>
            <div className="warning-message">Attention lors de la sauvegarde</div>
          </div>
        </div>
      )}
      <button className="toggle-card-btn" onClick={() => setIsCardOpen(!isCardOpen)} title="Ouvrir le panneau de controle">&#9776;</button>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} onRefreshWorkflow={refreshWorkflowInIframe} />
      {isCardOpen && (
        <ControlCard user={user} currentWorkflow={currentWorkflow} workflowUsers={workflowUsers} allWorkflows={allWorkflows} onClose={() => setIsCardOpen(false)} onLogout={onLogout} onTestInjection={handleTestInjection} onSetWorkflow={handleSetWorkflow} />
      )}
    </div>
  );
}

export default Dashboard;
