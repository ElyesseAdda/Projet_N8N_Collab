import React, { useState } from 'react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { TABLE_TABLEAU } from '../../config/constants';
import { generateSessionId } from '../../utils/session';
import { useChat } from '../../hooks/useChat';
import { useDocuments } from '../../hooks/useDocuments';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Sidebar } from '../../features/sidebar';
import { ChatPanel } from '../../features/chat';
import { MesTableauxPanel, TableauDetailSection } from '../../features/tableaux';
import { MailPanel } from '../../features/mail';
import '../../styles/variables.css';
import './ZoniaProject.css';

function ZoniaProject() {
  // ── Shared state ───────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('chat');
  const [openTableaux, setOpenTableaux] = useState([]);
  const [sessionId] = useState(() => generateSessionId());

  // ── Custom hooks ───────────────────────────────────────────────────────────
  const chat = useChat(sessionId);
  const docs = useDocuments();
  const upload = useFileUpload(docs.loadDocuments);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTableauToggle = (tableau) => {
    setOpenTableaux((prev) => {
      const exists = prev.some((t) => t.id === tableau.id);
      if (exists) return prev.filter((t) => t.id !== tableau.id);
      return [...prev, tableau];
    });
  };

  const handleTableauClose = (tableauId) => {
    setOpenTableaux((prev) => prev.filter((t) => t.id !== tableauId));
  };

  const handleTableauDeleted = (tableauId) => {
    setOpenTableaux((prev) => prev.filter((t) => t.id !== tableauId));
  };

  const handleTableauUpdated = (updatedTableau) => {
    if (!updatedTableau?.id) return;
    setOpenTableaux((prev) =>
      prev.map((t) => (t.id === updatedTableau.id ? { ...t, ...updatedTableau } : t))
    );
  };

  // ── Navigate from chat to a specific tableau ────────────────────────────────
  const handleNavigateToTableau = async (tableauId) => {
    setActiveSection('tableaux');
    // Already open → nothing to do
    if (openTableaux.some((t) => t.id === tableauId)) return;
    // Fetch the tableau and auto-select it
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from(TABLE_TABLEAU)
          .select('*')
          .eq('id', tableauId)
          .single();
        if (!error && data) {
          setOpenTableaux((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error('[Supabase] Erreur navigation tableau:', err);
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className={`app-main app-main--${activeSection}`}>
        <div className="app-content">
          {activeSection === 'chat' && (
            <div className="content-panel content-panel-enter">
              <ChatPanel
                messages={chat.messages}
                inputMessage={chat.inputMessage}
                setInputMessage={chat.setInputMessage}
                isLoading={chat.isLoading}
                sessionId={sessionId}
                sendMessage={chat.sendMessage}
                clearChat={chat.clearChat}
                messagesEndRef={chat.messagesEndRef}
                chatContainerRef={chat.chatContainerRef}
                inputRef={chat.inputRef}
                documentsExpanded={docs.documentsExpanded}
                documents={docs.documents}
                documentsLoading={docs.documentsLoading}
                documentsError={docs.documentsError}
                documentSearchQuery={docs.documentSearchQuery}
                setDocumentSearchQuery={docs.setDocumentSearchQuery}
                toggleDocumentsExpanded={docs.toggleDocumentsExpanded}
                isDragOver={upload.isDragOver}
                uploadStatus={upload.uploadStatus}
                uploadMessage={upload.uploadMessage}
                uploadProgress={upload.uploadProgress}
                handleDragOver={upload.handleDragOver}
                handleDragLeave={upload.handleDragLeave}
                handleDrop={upload.handleDrop}
                handleUploadZoneClick={upload.handleUploadZoneClick}
                handleFileInputChange={upload.handleFileInputChange}
                fileInputRef={upload.fileInputRef}
                onNavigateToTableau={handleNavigateToTableau}
              />
            </div>
          )}

          {activeSection === 'tableaux' && (
            <div className="content-panel content-panel-enter content-panel-tableaux">
              <MesTableauxPanel
                openTableaux={openTableaux}
                onTableauToggle={handleTableauToggle}
                onTableauDeleted={handleTableauDeleted}
                onTableauUpdated={handleTableauUpdated}
              />
              <div className="tableau-detail-sections-wrap">
                {openTableaux.map((tableau) => (
                  <TableauDetailSection
                    key={tableau.id}
                    selectedTableau={tableau}
                    onClose={() => handleTableauClose(tableau.id)}
                    onTableauDeleted={handleTableauDeleted}
                    onTableauUpdated={handleTableauUpdated}
                    sessionId={sessionId}
                  />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'mail' && (
            <div className="content-panel content-panel-enter">
              <MailPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ZoniaProject;
