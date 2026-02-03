import React, { useState, useEffect, useRef } from 'react';
import { User, Send, Search, FileText, FileBarChart, FileSpreadsheet, Zap } from 'lucide-react';
import './Chat.css';

// Génère un ID de session unique
const generateSessionId = () => {
  return 'A' + Array.from({ length: 31 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

const ZoniaAvatar = ({ loading = false }) => (
  <div className={`chat-zonia-avatar ${loading ? 'chat-zonia-avatar-loading' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
      <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="black" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="8" fill="black" />
    </svg>
  </div>
);

const ChatFileItem = ({ icon, iconClass, name, info }) => (
  <div className="chat-file-item">
    <div className={`chat-file-item-icon ${iconClass}`}>{icon}</div>
    <div className="chat-file-item-text">
      <div className="chat-file-item-name">{name}</div>
      <div className="chat-file-item-info">{info}</div>
    </div>
  </div>
);

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const WEBHOOK_URL = 'https://zoniahub.fr/n8n/webhook-test/415ff9ab-535b-4b03-a19a-1afde95867be';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          chatInput: trimmedMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.output || data.response || data.message || JSON.stringify(data),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError(`Erreur: ${err.message}`);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Impossible d'obtenir une réponse: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-blob" />
      <div className="chat-card">
        {/* Base de connaissances - sidebar gauche */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-title">Base de Connaissances</div>
          <div className="chat-file-list">
            <ChatFileItem
              icon={<FileText size={16} />}
              iconClass="chat-file-icon-red"
              name="Procédure_RH.pdf"
              info="1.2 MB • Hier"
            />
            <ChatFileItem
              icon={<FileBarChart size={16} />}
              iconClass="chat-file-icon-blue"
              name="Factures_Oct.pdf"
              info="840 KB • 2h"
            />
            <ChatFileItem
              icon={<FileSpreadsheet size={16} />}
              iconClass="chat-file-icon-green"
              name="Stock_Q4.xlsx"
              info="2.4 MB • 1j"
            />
          </div>
          <div className="chat-sidebar-footer">
            <div className="chat-sidebar-footer-title">
              <Zap size={12} />
              Zonia RAG Engine
            </div>
            <div className="chat-sidebar-footer-hint">Documents connectés au chat</div>
          </div>
        </div>

        {/* Zone chat */}
        <div className="chat-main">
          <div className="chat-header">
          <div className="chat-header-info">
            <ZoniaAvatar />
            <div>
              <div className="chat-title">Assistant n8n</div>
              <div className="chat-status">
                <span className="chat-status-dot" />
                En ligne
              </div>
            </div>
          </div>
          <button
            type="button"
            className="chat-clear-button"
            onClick={clearChat}
            title="Effacer la conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <ZoniaAvatar />
              <div className="chat-welcome-bubble">
                <p>Bonjour ! Posez votre question pour commencer la conversation.</p>
                <div className="chat-session-info">Session: {sessionId.substring(0, 8)}...</div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message-row msg-enter ${message.type === 'user' ? 'chat-message-row-user' : ''}`}
            >
              {message.type === 'user' ? (
                <div className="chat-avatar-user">
                  <User className="chat-avatar-icon" />
                </div>
              ) : (
                <ZoniaAvatar />
              )}
              <div
                className={`chat-bubble ${
                  message.type === 'user'
                    ? 'chat-bubble-user'
                    : message.type === 'error'
                    ? 'chat-bubble-error'
                    : 'chat-bubble-assistant'
                }`}
              >
                <p>{message.content}</p>
                <span className="chat-message-time">{message.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message-row msg-enter">
              <ZoniaAvatar loading />
              <div className="chat-loading-bubble">
                <span>Analyse en cours...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - style RAG */}
        <form className="chat-input-form" onSubmit={sendMessage}>
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="chat-send-button"
            >
              {isLoading ? (
                <Search className="chat-send-spinner" />
              ) : (
                <Send className="chat-send-icon" />
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}

export default Chat;
