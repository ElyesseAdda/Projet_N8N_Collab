import React, { useState } from 'react';
import { Sparkles, Archive, BookOpen, BookOpenCheck, MessageSquareText, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';

const FOLDER_LABELS = {
  'a-faire':    { label: 'À faire',          variant: 'cyan' },
  'transferer': { label: 'Transférer',       variant: 'gold' },
  'contrat':    { label: 'Contrat',          variant: 'green' },
  'facture':    { label: 'Facture',          variant: 'red' },
  'document':   { label: 'Demande Doc.',     variant: 'default' },
};

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const MailListItem = ({ mail, isSelected, onClick, onQuickAction }) => {
  const [hovered, setHovered] = useState(false);
  const folderInfo = FOLDER_LABELS[mail.folder];

  const handleQuickAction = (e, action) => {
    e.stopPropagation();
    onQuickAction?.(mail.id, action);
  };

  return (
    <button
      type="button"
      className={`mail-list-item ${isSelected ? 'mail-list-item--selected' : ''} ${mail.unread ? 'mail-list-item--unread' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mail-list-item-row">
        <div className="mail-list-item-avatar">
          {getInitials(mail.sender)}
          {mail.unread && <span className="mail-list-item-unread-dot" />}
        </div>

        <div className="mail-list-item-content">
          <div className="mail-list-item-top">
            <span className="mail-list-item-sender">{mail.sender}</span>
            <span className="mail-list-item-date">{mail.date}</span>
          </div>
          <div className="mail-list-item-subject">{mail.subject}</div>
          <div className="mail-list-item-preview">{mail.preview}</div>
          <div className="mail-list-item-footer">
            {folderInfo && (
              <Badge variant={folderInfo.variant} className="mail-list-item-tag">
                {folderInfo.label}
              </Badge>
            )}
            {mail.hasDraft && (
              <span className="mail-list-item-draft-indicator">
                <Sparkles size={12} />
                Brouillon Zonia
              </span>
            )}
          </div>
        </div>
      </div>

      {hovered && (
        <div className="mail-list-item-quick-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="mail-list-item-qa-btn"
            title={mail.unread ? 'Marquer comme lu' : 'Marquer non lu'}
            onClick={(e) => handleQuickAction(e, 'toggle-read')}
          >
            {mail.unread ? <BookOpenCheck size={13} /> : <BookOpen size={13} />}
          </button>
          <button
            type="button"
            className="mail-list-item-qa-btn"
            title="Envoyer au chat"
            onClick={(e) => handleQuickAction(e, 'send-to-chat')}
          >
            <MessageSquareText size={13} />
          </button>
          <button
            type="button"
            className="mail-list-item-qa-btn"
            title="Archiver"
            onClick={(e) => handleQuickAction(e, 'archive')}
          >
            <Archive size={13} />
          </button>
          <button
            type="button"
            className="mail-list-item-qa-btn mail-list-item-qa-btn--danger"
            title="Supprimer"
            onClick={(e) => handleQuickAction(e, 'delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </button>
  );
};

export default MailListItem;
