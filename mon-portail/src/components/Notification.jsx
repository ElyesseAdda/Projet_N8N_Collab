import React, { useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'info', onClose, duration = 5000, hasRefreshButton = false, onRefresh }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{message}</span>
        <div className="notification-actions">
          {hasRefreshButton && onRefresh && (
            <button 
              className="notification-refresh-btn" 
              onClick={onRefresh}
              title="Rafraîchir le workflow"
            >
              🔄 Rafraîchir
            </button>
          )}
          <button className="notification-close" onClick={onClose} title="Fermer">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notification;

