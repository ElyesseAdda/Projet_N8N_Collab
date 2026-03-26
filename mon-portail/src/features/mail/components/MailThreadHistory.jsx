import React from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Historique / mails lies au fil de conversation selectionne.
 * @param {Array} thread
 * @param {boolean} isExpanded
 * @param {function} onToggle
 */
const MailThreadHistory = ({ thread = [], isExpanded, onToggle }) => {
  if (thread.length === 0) return null;

  return (
    <div className="mail-thread-history">
      <button type="button" className="mail-thread-history-toggle" onClick={onToggle}>
        <Clock size={14} />
        <span>Historique de conversation ({thread.length} message{thread.length > 1 ? 's' : ''})</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isExpanded && (
        <div className="mail-thread-history-list">
          {thread.map((msg) => (
            <div key={msg.id} className="mail-thread-history-item">
              <div className="mail-thread-history-item-header">
                <span className="mail-thread-history-item-author">{msg.author}</span>
                <span className="mail-thread-history-item-date">{msg.date}</span>
              </div>
              <div className="mail-thread-history-item-preview">{msg.preview}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MailThreadHistory;
