import React, { useMemo, useState } from 'react';
import { Sparkles, Send, RotateCcw } from 'lucide-react';
import { Button, SearchInput } from '../../../components/ui';

/**
 * Brouillon de reponse genere par l'IA, editable par l'utilisateur.
 * Inclut les pieces jointes Drive avec checkbox de validation.
 * @param {Object} draft
 * @param {function} onDraftChange
 * @param {Array} driveFiles
 * @param {Array} suggestedFiles
 * @param {Array} selectedFiles - ids des fichiers coches
 * @param {function} onFileToggle
 * @param {function} onSend
 * @param {function} onRegenerate
 */
const MailAIDraft = ({
  draft,
  onDraftChange,
  driveFiles = [],
  suggestedFiles = [],
  selectedFiles = [],
  onFileToggle,
  onSend,
  onRegenerate,
}) => {
  if (!draft) return null;
  const [driveSearchQuery, setDriveSearchQuery] = useState('');

  const filteredDriveFiles = useMemo(() => {
    const q = driveSearchQuery.trim().toLowerCase();
    if (!q) return driveFiles;
    return driveFiles.filter((file) => file.name.toLowerCase().includes(q));
  }, [driveFiles, driveSearchQuery]);

  return (
    <div className="mail-ai-draft">
      <div className="mail-ai-draft-header">
        <div className="mail-ai-draft-title">
          <Sparkles size={16} className="mail-ai-draft-icon" />
          Réponse Zonia IA
        </div>
        <div className="mail-ai-draft-actions">
          <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={onRegenerate}>
            Régénérer
          </Button>
        </div>
      </div>

      <div className="mail-ai-draft-to">
        À : <span>{draft.to}</span>
      </div>
      <div className="mail-ai-draft-subject">
        Objet : <span>{draft.subject}</span>
      </div>

      <textarea
        className="mail-ai-draft-body"
        value={draft.body}
        onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
        rows={10}
      />

      {(suggestedFiles.length > 0 || driveFiles.length > 0) && (
        <div className="mail-ai-draft-files">
          {suggestedFiles.length > 0 && (
            <>
              <div className="mail-ai-draft-files-title">Pièces jointes suggérées</div>
              <div className="mail-ai-draft-files-list">
                {suggestedFiles.map((file) => (
                  <label key={`suggested-${file.id}`} className="mail-ai-draft-file-row">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => onFileToggle(file.id)}
                      className="mail-ai-draft-file-checkbox"
                    />
                    <span className="mail-ai-draft-file-name">{file.name}</span>
                    <span className="mail-ai-draft-file-size">{file.size}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {driveFiles.length > 0 && (
            <>
              <div className="mail-ai-draft-files-title mail-ai-draft-files-title--drive">
                Fichiers Drive
              </div>
              <div className="mail-ai-draft-drive-search">
                <SearchInput
                  value={driveSearchQuery}
                  onChange={(e) => setDriveSearchQuery(e.target.value)}
                  placeholder="Rechercher un fichier Drive..."
                  size="sm"
                />
              </div>
              <div className="mail-ai-draft-files-list">
                {filteredDriveFiles.length === 0 && (
                  <div className="mail-ai-draft-files-empty">Aucun fichier Drive trouvé</div>
                )}
                {filteredDriveFiles.map((file) => (
                  <label key={`drive-${file.id}`} className="mail-ai-draft-file-row">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => onFileToggle(file.id)}
                      className="mail-ai-draft-file-checkbox"
                    />
                    <span className="mail-ai-draft-file-name">{file.name}</span>
                    <span className="mail-ai-draft-file-size">{file.size}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mail-ai-draft-send-bar">
        <Button variant="primary" icon={<Send size={14} />} onClick={onSend}>
          Envoyer la réponse
        </Button>
        <span className="mail-ai-draft-hint">
          Zonia est une IA et peut se tromper. Vérifiez le contenu avant envoi.
        </span>
      </div>
    </div>
  );
};

export default MailAIDraft;
