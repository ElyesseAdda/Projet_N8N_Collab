import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronUp, ChevronDown, X } from 'lucide-react';
import { ZoniaAvatar } from '../../../components/ui';

const INITIAL_MESSAGES = [
  { id: 'sys-1', type: 'assistant', content: 'Je suis votre assistant mail. Demandez-moi de reformuler, proposer une autre réponse, ou posez des questions sur vos mails.' },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getTimeLabel = (dateTime = '') => {
  const parts = dateTime.split('—');
  return parts.length > 1 ? parts[1].trim() : dateTime;
};

/**
 * Mini chat contextuel pour interagir avec l'IA sur le mail sélectionné.
 */
const MailMiniChat = ({ prefillContext = null, prefillToken = 0 }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [contextCard, setContextCard] = useState(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!prefillContext) return;
    setIsOpen(true);
    setContextCard(prefillContext);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [prefillContext, prefillToken]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: `user-${Date.now()}`, type: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMsg = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: 'Voici une suggestion alternative. (Donnée de test — sera connectée au webhook IA)',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const handleRootClick = () => {
    setIsOpen((open) => !open);
  };

  const handleBodyClick = (e) => {
    if (isOpen) e.stopPropagation();
  };

  const clearContextChip = () => {
    setContextCard(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div
      className={`mail-mini-chat ${isOpen ? 'mail-mini-chat--open' : ''} ${!isOpen ? 'mail-mini-chat--closed' : ''}`}
      onClick={handleRootClick}
      role={!isOpen ? 'button' : undefined}
      tabIndex={!isOpen ? 0 : -1}
      onKeyDown={(e) => {
        if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsOpen(true);
        } else if (isOpen && e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
        }
      }}
      aria-label={isOpen ? 'Replier le chat assistant mail' : 'Ouvrir le chat assistant mail'}
      aria-expanded={isOpen}
    >
      <div className="mail-mini-chat-header">
        <div className="mail-mini-chat-header-title">
          <Sparkles size={14} className="mail-mini-chat-header-icon" />
          Assistant Mail IA
        </div>
        <button
          type="button"
          className="mail-mini-chat-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((value) => !value);
          }}
          aria-label={isOpen ? 'Replier le chat' : 'Ouvrir le chat'}
          title={isOpen ? 'Replier le chat' : 'Ouvrir le chat'}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      <div className="mail-mini-chat-body" onClick={handleBodyClick}>
        <div className="mail-mini-chat-messages" ref={messagesContainerRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mail-mini-chat-msg ${msg.type === 'user' ? 'mail-mini-chat-msg--user' : 'mail-mini-chat-msg--ai'}`}
            >
              {msg.type === 'assistant' && <ZoniaAvatar className="mail-mini-chat-avatar" />}
              <div className="mail-mini-chat-bubble">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="mail-mini-chat-msg mail-mini-chat-msg--ai">
              <ZoniaAvatar loading className="mail-mini-chat-avatar" />
              <div className="mail-mini-chat-bubble mail-mini-chat-bubble--loading">Réflexion…</div>
            </div>
          )}
        </div>

        <form className="mail-mini-chat-form" onSubmit={handleSend}>
          <div className="mail-mini-chat-input-wrap">
            {contextCard && (
              <div className="mail-mini-chat-context-chip mail-mini-chat-context-chip--inside" title={`${contextCard.contact} - ${contextCard.subject}`}>
                <span className="mail-mini-chat-context-chip-initials">{getInitials(contextCard.contact)}</span>
                <span className="mail-mini-chat-context-chip-time">{getTimeLabel(contextCard.dateTime)}</span>
                <button
                  type="button"
                  className="mail-mini-chat-context-chip-remove"
                  aria-label="Supprimer le contexte mail"
                  title="Supprimer le contexte"
                  onClick={clearContextChip}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              className={`mail-mini-chat-input ${contextCard ? 'mail-mini-chat-input--with-chip' : ''}`}
              placeholder="Demander une autre réponse…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="mail-mini-chat-send" disabled={!input.trim() || isLoading}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MailMiniChat;
