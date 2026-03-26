import React from 'react';
import { User, Send, Search, Database, Zap, Table2 } from 'lucide-react';
import { isSupabaseAvailable } from '../../lib/supabase';
import { ACCEPTED_FILE_TYPES } from '../../config/constants';
import { ZoniaAvatar, SearchInput, StatusMessage } from '../../components/ui';
import { decodeUnicodeEscapes } from '../../utils/formatting';
import ChatFileItem from './components/ChatFileItem';
import DocumentRow from './components/DocumentRow';
import './ChatPanel.css';

// ---------------------------------------------------------------------------
// ChatPanel – pure presentational component
// ---------------------------------------------------------------------------
const ChatPanel = ({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  sessionId,
  sendMessage,
  clearChat,
  messagesEndRef,
  chatContainerRef,
  inputRef,
  documentsExpanded,
  documents,
  documentsLoading,
  documentsError,
  documentSearchQuery,
  setDocumentSearchQuery,
  toggleDocumentsExpanded,
  isDragOver,
  uploadStatus,
  uploadMessage,
  uploadProgress,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleUploadZoneClick,
  handleFileInputChange,
  fileInputRef,
  onNavigateToTableau,
}) => {
  return (
    <div className="chat-card">
      {/* ── Knowledge-base sidebar ─────────────────────────────────────────── */}
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
              {!documentsError && documents.length > 0 && (
                <SearchInput
                  value={documentSearchQuery}
                  onChange={(e) => setDocumentSearchQuery(e.target.value)}
                  placeholder="Rechercher un fichier..."
                  size="sm"
                  className="chat-documents-search-wrap"
                />
              )}
              {documentsError && (
                <StatusMessage type="error" message={documentsError} />
              )}
              {!documentsError && documents.length === 0 && !documentsLoading && (
                <StatusMessage type="empty" message="Aucun document" />
              )}
              {!documentsError &&
                documents.length > 0 &&
                (() => {
                  const q = documentSearchQuery.trim().toLowerCase();
                  const filtered = q
                    ? documents.filter((row) => (row.title || '').toLowerCase().includes(q))
                    : documents;
                  return (
                    <div className="chat-documents-items">
                      {filtered.length === 0 ? (
                        <StatusMessage type="empty" message="Aucun résultat" />
                      ) : (
                        filtered.map((row, idx) => (
                          <DocumentRow
                            key={row.id ?? idx}
                            title={decodeUnicodeEscapes(row.title)}
                            url={row.url}
                          />
                        ))
                      )}
                    </div>
                  );
                })()}
            </div>
          )}
        </div>

        {/* Upload zone */}
        <div
          className={`chat-sidebar-footer chat-upload-zone ${isDragOver ? 'chat-upload-zone-dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadZoneClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUploadZoneClick();
            }
          }}
          title="Cliquez ou déposez des fichiers pour les envoyer vers Google Drive"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="chat-upload-input"
            onChange={handleFileInputChange}
            accept={ACCEPTED_FILE_TYPES}
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
              <div
                className={`chat-upload-progress-bar ${uploadStatus === 'error' ? 'chat-upload-progress-bar-error' : ''}`}
                style={{ width: uploadStatus === 'error' ? '100%' : `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Main chat area ─────────────────────────────────────────────────── */}
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-info">
            <ZoniaAvatar />
            <div>
              <div className="chat-title">Assistant Zonia</div>
              <div className="chat-status">
                <span className="chat-status-dot" />
                En ligne
              </div>
            </div>
          </div>
          <button type="button" className="chat-clear-button" onClick={clearChat} title="Effacer la conversation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>

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
                {message.tableauId && (
                  <button
                    type="button"
                    className="chat-tableau-link"
                    onClick={() => onNavigateToTableau?.(message.tableauId)}
                  >
                    <Table2 size={14} />
                    Voir mon tableau
                  </button>
                )}
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
            <button type="submit" disabled={isLoading || !inputMessage.trim()} className="chat-send-button">
              {isLoading ? <Search className="chat-send-spinner" /> : <Send className="chat-send-icon" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
