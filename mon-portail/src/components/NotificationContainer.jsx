import React from 'react';
import Notification from './Notification';
import './NotificationContainer.css';

function NotificationContainer({ notifications, onRemove, onRefreshWorkflow }) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id)}
          duration={notification.duration}
          hasRefreshButton={notification.hasRefreshButton}
          workflowId={notification.workflowId}
          onRefresh={() => {
            if (notification.workflowId && onRefreshWorkflow) {
              onRefreshWorkflow(notification.workflowId);
              onRemove(notification.id);
            }
          }}
        />
      ))}
    </div>
  );
}

export default NotificationContainer;

