import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Spinner } from '../../../components/ui';

const ChatFileItem = ({ icon, iconClass, name, info, onClick, isExpanded, isLoading }) => (
  <div
    className={`chat-file-item chat-file-item-card ${onClick ? 'chat-file-item-clickable' : ''} ${isExpanded ? 'chat-file-item-expanded' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    aria-expanded={onClick ? isExpanded : undefined}
  >
    <div className={`chat-file-item-icon ${iconClass}`}>{icon}</div>
    <div className="chat-file-item-text">
      <div className="chat-file-item-name">{name}</div>
      <div className="chat-file-item-info">{info}</div>
    </div>
    {onClick && (
      <span className="chat-file-item-chevron">
        {isLoading ? <Spinner size="sm" /> : isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </span>
    )}
  </div>
);

export default ChatFileItem;
