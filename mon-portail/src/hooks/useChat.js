import { useState, useEffect, useRef } from 'react';
import { WEBHOOK_URL } from '../config/constants';

/**
 * Custom hook that manages chat messages, sending, and scroll behaviour.
 *
 * @param {string} sessionId – The active session identifier.
 * @returns Chat state & handlers.
 */
export function useChat(sessionId) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // ── Auto-scroll to bottom on new messages ──────────────────────────────────
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          chatInput: trimmedMessage,
        }),
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      // The API may return an array (e.g. [{ output, tableau_id, ... }])
      const payload = Array.isArray(data) ? data[0] : data;
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content:
          payload.output || payload.response || payload.message || JSON.stringify(data),
        tableauId: payload.tableau_id ?? null,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      setError(`Erreur: ${err.message}`);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Impossible d'obtenir une réponse: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Clear conversation ─────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    sendMessage,
    clearChat,
    messagesEndRef,
    chatContainerRef,
    inputRef,
  };
}
