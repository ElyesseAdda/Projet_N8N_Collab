import React, { useState } from 'react';
import './ControlCard.css';

function ControlCard({ user, currentWorkflow, workflowUsers = [], allWorkflows = [], onClose, onLogout, onTestInjection, onSetWorkflow }) {
  const displayName = user?.displayName || user?.username || 'Utilisateur';
  const initial = displayName.charAt(0).toUpperCase();
  const [manualWorkflowId, setManualWorkflowId] = useState('');

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      onLogout();
    }
  };

  const handleSetWorkflow = () => {
    if (manualWorkflowId.trim()) {
      if (onSetWorkflow) {
        onSetWorkflow(manualWorkflowId.trim());
        setManualWorkflowId('');
      }
    }
  };


  return (
    <>
      <div className="card-overlay" onClick={onClose}></div>
      <div className="control-card">
        <div className="card-header">
          <h3>🎛️ Contrôles</h3>
          <button className="close-btn" onClick={onClose} title="Fermer">
            ×
          </button>
        </div>
        <div className="card-body">
          <div className="user-section">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-status">
                <span className="status-dot"></span>
                <span>En ligne</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>
          <div className="workflow-section">
            <div className="section-title">📋 Workflow Actuel</div>
            {currentWorkflow ? (
              <div className="workflow-info">
                <div className="workflow-name">{currentWorkflow.name}</div>
                <div className="workflow-id">ID: {currentWorkflow.id}</div>
              </div>
            ) : (
              <div className="workflow-info no-workflow">
                <div className="workflow-name">Aucun workflow détecté</div>
                <div className="manual-workflow-input">
                  <input
                    type="text"
                    placeholder="Entrer l'ID du workflow"
                    value={manualWorkflowId}
                    onChange={(e) => setManualWorkflowId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSetWorkflow()}
                    className="workflow-input"
                  />
                  <button onClick={handleSetWorkflow} className="workflow-set-btn">
                    Définir
                  </button>
                </div>
              </div>
            )}
          </div>

          {workflowUsers.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="users-section">
                <div className="section-title">👥 Utilisateurs sur ce workflow ({workflowUsers.length})</div>
                <div className="users-list">
                  {workflowUsers.map((u, index) => {
                    const userInitial = (u.displayName || u.username).charAt(0).toUpperCase();
                    const isCurrentUser = u.username === user?.username;
                    return (
                      <div key={u.socketId || index} className={`user-item ${isCurrentUser ? 'current-user' : ''}`}>
                        <div className="user-item-avatar">{userInitial}</div>
                        <div className="user-item-info">
                          <div className="user-item-name">
                            {u.displayName || u.username}
                            {isCurrentUser && <span className="you-badge">(Vous)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {allWorkflows.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="workflows-section">
                <div className="section-title">🌐 Tous les workflows actifs ({allWorkflows.length})</div>
                <div className="workflows-list">
                  {allWorkflows.map((wf) => (
                    <div key={wf.id} className="workflow-item">
                      <div className="workflow-item-name">{wf.name || `Workflow ${wf.id}`}</div>
                      <div className="workflow-item-users">
                        {wf.users.length} utilisateur{wf.users.length > 1 ? 's' : ''}
                      </div>
                      <div className="workflow-item-users-list">
                        {wf.users.map((u, idx) => (
                          <span key={idx} className="workflow-user-tag">
                            {u.displayName || u.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="divider"></div>

          <div className="actions-section">
            <button className="action-btn primary" onClick={onTestInjection}>
              🧪 Tester l'Injection
            </button>
            <button className="action-btn danger" onClick={handleLogout}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ControlCard;

