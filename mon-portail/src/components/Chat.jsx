import React, { useState, useEffect, useRef } from 'react';
import { User, Send, Search, Database, Zap, FileText, FileSpreadsheet, FileBarChart, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { supabase, isSupabaseAvailable, logSupabaseConfig } from '../lib/supabase';
import './Chat.css';

const TABLE_DOCUMENT_METADATA = 'document_metadata';

/** Retourne l'icône et la classe CSS selon l'extension du fichier */
function getDocumentIcon(extension) {
  const ext = (extension || '').toLowerCase().replace(/^\./, '');
  switch (ext) {
    case 'pdf':
      return { icon: <FileText size={16} />, iconClass: 'chat-file-icon-red' };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return { icon: <FileSpreadsheet size={16} />, iconClass: 'chat-file-icon-green' };
    case 'doc':
    case 'docx':
      return { icon: <FileText size={16} />, iconClass: 'chat-file-icon-blue' };
    default:
      return { icon: <FileText size={16} />, iconClass: 'chat-file-icon-cyan' };
  }
}

/** Extrait l'extension du titre si pas fournie (ex: "Rapport.pdf" -> "pdf") */
function getExtensionFromTitle(title, extension) {
  if (extension) return extension.replace(/^\./, '');
  const match = (title || '').match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : '';
}

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
        {isLoading ? <span className="chat-docs-spinner" /> : isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </span>
    )}
  </div>
);

const DocumentRow = ({ title, url }) => {
  const ext = getExtensionFromTitle(title, null);
  const { icon, iconClass } = getDocumentIcon(ext);
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <div
      className={`chat-document-row ${url ? 'chat-document-row-clickable' : ''}`}
      onClick={url ? handleClick : undefined}
      onKeyDown={url ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
      role={url ? 'button' : undefined}
      tabIndex={url ? 0 : undefined}
      title={url ? 'Ouvrir dans un nouvel onglet' : undefined}
    >
      <div className={`chat-file-item-icon ${iconClass}`}>{icon}</div>
      <span className="chat-document-row-title">{title || 'Sans titre'}</span>
    </div>
  );
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const WEBHOOK_URL = 'https://zoniahub.fr/n8n/webhook-test/415ff9ab-535b-4b03-a19a-1afde95867be';

  const loadDocuments = async () => {
    logSupabaseConfig();
    if (!isSupabaseAvailable() || !supabase) {
      console.warn('[Supabase] Client non disponible — VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis dans .env');
      return;
    }
    setDocumentsLoading(true);
    setDocumentsError(null);
    console.log('[Supabase] Requête:', { table: TABLE_DOCUMENT_METADATA, select: 'id, title, url' });
    try {
      const response = await supabase
        .from(TABLE_DOCUMENT_METADATA)
        .select('id, title, url');
      const { data, error: err } = response;
      console.log('[Supabase] Réponse brute:', {
        data,
        error: err ? { message: err.message, code: err.code, details: err.details, hint: err.hint } : null,
        count: Array.isArray(data) ? data.length : 0
      });
      if (err) throw err;
      const items = Array.isArray(data) ? data : [];
      setDocuments(items);
    } catch (err) {
      console.error('[Supabase] Erreur:', err);
      setDocumentsError(err?.message || 'Erreur chargement documents');
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const toggleDocumentsExpanded = () => {
    const next = !documentsExpanded;
    setDocumentsExpanded(next);
    if (next && documents.length === 0 && !documentsLoading) loadDocuments();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.length) uploadFilesToDrive(Array.from(files));
  };

  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files?.length) uploadFilesToDrive(Array.from(files));
    e.target.value = '';
  };

  const uploadFilesToDrive = (files) => {
    setUploadStatus('uploading');
    setUploadMessage('');
    setUploadProgress(0);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      } else {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }
    });
    xhr.addEventListener('load', () => {
      setUploadProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {}
        setUploadStatus('success');
        setUploadMessage(data.message || `${files.length} fichier(s) envoyé(s) vers Google Drive`);
      } else {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {}
        setUploadStatus('error');
        setUploadMessage(data.message || data.error || `Erreur ${xhr.status}`);
      }
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
        setUploadProgress(0);
      }, 5000);
    });
    xhr.addEventListener('error', () => {
      setUploadProgress(0);
      setUploadStatus('error');
      setUploadMessage('Erreur réseau');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    });
    xhr.open('POST', '/api/upload-drive');
    xhr.send(formData);
  };

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
              icon={<Database size={16} />}
              iconClass="chat-file-icon-cyan"
              name="Base de données"
              info={documentsExpanded ? `${documents.length} document(s)` : 'Supabase • Connectée'}
              onClick={isSupabaseAvailable() ? toggleDocumentsExpanded : undefined}
              isExpanded={documentsExpanded}
              isLoading={documentsLoading}
            />
            {documentsExpanded && (
              <div className="chat-documents-list">
                {documentsError && (
                  <div className="chat-documents-error">{documentsError}</div>
                )}
                {!documentsError && documents.length === 0 && !documentsLoading && (
                  <div className="chat-documents-empty">Aucun document</div>
                )}
                {!documentsError && documents.length > 0 && (
                  <div className="chat-documents-items">
                    {documents.map((row, idx) => (
                      <DocumentRow
                        key={row.id ?? idx}
                        title={row.title}
                        url={row.url}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className={`chat-sidebar-footer chat-upload-zone ${isDragOver ? 'chat-upload-zone-dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadZoneClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadZoneClick(); } }}
            title="Cliquez ou déposez des fichiers pour les envoyer vers Google Drive"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="chat-upload-input"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              aria-hidden="true"
            />
            <div className="chat-sidebar-footer-title">
              <Zap size={12} />
              Zonia RAG Engine
            </div>
            <div className="chat-sidebar-footer-hint">
              {uploadStatus === 'uploading' && 'Envoi en cours…'}
              {uploadStatus === 'success' && uploadMessage}
              {uploadStatus === 'error' && uploadMessage}
              {(uploadStatus === 'idle' || !uploadStatus) && 'Cliquez ou déposez des fichiers → Google Drive'}
            </div>
            {(uploadStatus === 'uploading' || uploadProgress > 0 || uploadStatus === 'error') && (
              <div className={`chat-upload-progress-wrap ${uploadStatus === 'error' ? 'chat-upload-progress-wrap-error' : ''}`}>
                <div className={`chat-upload-progress-bar ${uploadStatus === 'error' ? 'chat-upload-progress-bar-error' : ''}`} style={{ width: uploadStatus === 'error' ? '100%' : `${uploadProgress}%` }} />
              </div>
            )}
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
