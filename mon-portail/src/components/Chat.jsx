import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

// Génère un ID de session unique
const generateSessionId = () => {
  return 'A' + Array.from({ length: 31 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const WEBHOOK_URL = 'https://zoniahub.fr/n8n/webhook-test/415ff9ab-535b-4b03-a19a-1afde95867be';

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    // Ajouter le message de l'utilisateur
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
      
      // Ajouter la réponse de l'assistant
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
      
      // Ajouter un message d'erreur dans le chat
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
      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h1 className="chat-title">Assistant n8n</h1>
              <span className="chat-status">
                <span className="status-dot"></span>
                En ligne
              </span>
            </div>
          </div>
          <button className="clear-button" onClick={clearChat} title="Effacer la conversation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <h2>Bienvenue !</h2>
              <p>Posez votre question pour commencer la conversation.</p>
              <div className="session-info">
                <span>Session ID: {sessionId.substring(0, 8)}...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message message-${message.type}`}>
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">{message.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message message-assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={sendMessage}>
          <div className="input-wrapper">
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
              className="send-button"
            >
              {isLoading ? (
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
