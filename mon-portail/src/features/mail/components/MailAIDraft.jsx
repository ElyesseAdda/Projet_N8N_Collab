import React from 'react';
import { Sparkles, Send, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui';

/**
 * Brouillon de reponse genere par l'IA, editable par l'utilisateur.
 * Inclut les pieces jointes Drive avec checkbox de validation.
 * @param {Object} draft
 * @param {function} onDraftChange
 * @param {Array} driveFiles
 * @param {Array} selectedFiles - ids des fichiers coches
 * @param {function} onFileToggle
 * @param {function} onSend
 * @param {function} onRegenerate
 */
const MailAIDraft = ({ draft, onDraftChange, driveFiles = [], selectedFiles = [], onFileToggle, onSend, onRegenerate }) => {
  if (!draft) return null;

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

      {driveFiles.length > 0 && (
        <div className="mail-ai-draft-files">
          <div className="mail-ai-draft-files-title">
            Pièces jointes 
          </div>
          <div className="mail-ai-draft-files-list">
            {driveFiles.map((file) => (
              <label key={file.id} className="mail-ai-draft-file-row">
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
