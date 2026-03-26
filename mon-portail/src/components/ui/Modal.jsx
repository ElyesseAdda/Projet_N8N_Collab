import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Generic modal overlay + centered panel.
 * Rendered in a portal (document.body) so it appears above all parents (overflow, z-index).
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {React.ReactNode} icon - Optional title icon
 * @param {boolean} loading - When true the close button is disabled
 * @param {string} className
 */
const Modal = ({ isOpen, onClose, title, icon, loading = false, children, className = '' }) => {
  if (!isOpen) return null;

  const content = (
    <div
      className="ui-modal-overlay"
      onClick={loading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={`ui-modal ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">
            {icon && <span className="ui-modal__title-icon">{icon}</span>}
            {title}
          </h2>
          <button
            type="button"
            className="ui-modal__close"
            onClick={onClose}
            disabled={loading}
            title="Fermer"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default Modal;
