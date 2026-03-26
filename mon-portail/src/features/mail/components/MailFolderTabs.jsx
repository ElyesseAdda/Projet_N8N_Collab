import React, { useState } from 'react';
import {
  CheckSquare,
  Forward,
  FileText,
  Receipt,
  FolderOpen,
  Inbox,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { Badge } from '../../../components/ui';

const FOLDERS = [
  { id: 'tout',       label: 'Tout',              icon: Inbox,       badgeVariant: 'default' },
  { id: 'a-faire',    label: 'À faire',           icon: CheckSquare, badgeVariant: 'cyan' },
  { id: 'transferer', label: 'Transférer',        icon: Forward,     badgeVariant: 'gold' },
  { id: 'contrat',    label: 'Contrat',           icon: FileText,    badgeVariant: 'green' },
  { id: 'facture',    label: 'Facture',           icon: Receipt,     badgeVariant: 'red' },
  { id: 'document',   label: 'Demande Document',  icon: FolderOpen,  badgeVariant: 'default' },
];

/**
 * Onglets de dossiers IA pour le tri automatique des mails.
 * @param {string} activeFolder
 * @param {function} onFolderChange
 * @param {Object} folderCounts - { 'a-faire': 3, 'facture': 2, ... }
 */
const MailFolderTabs = ({
  folders = FOLDERS,
  activeFolder,
  onFolderChange,
  folderCounts = {},
  onCreateFolder,
  onRenameFolder,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const handleCreateSubmit = () => {
    const label = newFolderName.trim();
    if (!label) return;
    const createdId = onCreateFolder?.(label);
    setNewFolderName('');
    setIsCreating(false);
    if (createdId) onFolderChange?.(createdId);
  };

  const startRename = (folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.label);
  };

  const cancelRename = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const submitRename = (folderId) => {
    const label = editingFolderName.trim();
    if (!label) return;
    onRenameFolder?.(folderId, label);
    cancelRename();
  };

  return (
    <div className="mail-folders">
      <div className="mail-folders-toolbar">
        <div className="mail-folders-title">
          <span className="mail-folders-title-dot" />
          Mes Dossiers
        </div>
        <div className="mail-folders-toolbar-actions">
          <button
            type="button"
            className="mail-folders-add-btn"
            onClick={() => setIsCreating((value) => !value)}
            aria-label={isCreating ? 'Annuler la creation' : 'Creer une section'}
            title={isCreating ? 'Annuler' : 'Creer une section'}
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="mail-folders-toggle"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Replier les dossiers' : 'Afficher tous les dossiers'}
            title={isExpanded ? 'Replier' : 'Afficher tout'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="mail-folder-create-row">
          <input
            type="text"
            className="mail-folder-input"
            placeholder="Nom de la nouvelle section..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateSubmit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className="mail-folder-inline-btn mail-folder-inline-btn--confirm"
            onClick={handleCreateSubmit}
            title="Valider"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            className="mail-folder-inline-btn"
            onClick={() => {
              setIsCreating(false);
              setNewFolderName('');
            }}
            title="Annuler"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <nav className={`mail-folders-nav ${isExpanded ? 'mail-folders-nav--expanded' : ''}`}>
        {folders.map((folder, index) => {
          if (index === 0) return null;
          const Icon = folder.icon;
          const count = folderCounts[folder.id] || 0;
          const isActive = activeFolder === folder.id;
          const isEditing = editingFolderId === folder.id;
          return (
            <div key={folder.id} className="mail-folder-item">
              <button
                type="button"
                className={`mail-folder-btn ${isActive ? 'mail-folder-btn--active' : ''} ${isEditing ? 'mail-folder-btn--editing' : ''}`}
                onClick={() => onFolderChange(folder.id)}
                onDoubleClick={() => {
                  if (!isEditing) startRename(folder);
                }}
                title={!isEditing ? 'Double-cliquez pour renommer' : undefined}
              >
                <Icon size={16} />
                {isEditing ? (
                  <input
                    type="text"
                    className="mail-folder-input"
                    value={editingFolderName}
                    style={{ width: `${Math.min(18, Math.max(6, editingFolderName.length + 1))}ch` }}
                    onChange={(e) => setEditingFolderName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitRename(folder.id);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="mail-folder-label">{folder.label}</span>
                )}
                {count > 0 && !isEditing && (
                  <Badge variant={folder.badgeVariant} className="mail-folder-badge">
                    {count}
                  </Badge>
                )}
                {isEditing && (
                  <div className="mail-folder-edit-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="mail-folder-inline-btn mail-folder-inline-btn--confirm"
                    onClick={(e) => {
                      e.stopPropagation();
                      submitRename(folder.id);
                    }}
                    title="Valider le nom"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    className="mail-folder-inline-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelRename();
                    }}
                    title="Annuler"
                  >
                    <X size={13} />
                  </button>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default MailFolderTabs;
export { FOLDERS };
