import React, { useState } from 'react';
import { Mail, Send, Paperclip, CalendarClock } from 'lucide-react';
import { Modal, Input, Button } from '../../../components/ui';
import './ComposeMailModal.css';

const INITIAL_FORM = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  priority: 'normale',
  scheduleAt: '',
};

const ComposeMailModal = ({ isOpen, onClose }) => {
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [composeForm, setComposeForm] = useState(INITIAL_FORM);
  const [composeAttachments, setComposeAttachments] = useState([]);

  const updateComposeField = (field, value) => {
    setComposeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAttachment = () => {
    const nextId = composeAttachments.length + 1;
    setComposeAttachments((prev) => [
      ...prev,
      { id: `new-att-${nextId}`, name: `Piece_jointe_${nextId}.pdf`, size: '120 Ko' },
    ]);
  };

  const handleRemoveAttachment = (attId) => {
    setComposeAttachments((prev) => prev.filter((att) => att.id !== attId));
  };

  const resetComposeForm = () => {
    setComposeForm(INITIAL_FORM);
    setComposeAttachments([]);
    setShowCcBcc(false);
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleComposeSaveDraft = () => {
    alert('Brouillon enregistre (mock) — sera connecte a Supabase');
  };

  const handleComposeSend = () => {
    alert('Mail envoye (mock) — sera connecte au backend');
    onClose?.();
    resetComposeForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouveau message"
      icon={<Mail size={18} />}
      className="mail-compose-modal"
    >
      <div className="mail-compose-modal-layout">
        <div className="mail-compose-modal-row">
          <label className="mail-compose-modal-label">A</label>
          <Input
            value={composeForm.to}
            onChange={(e) => updateComposeField('to', e.target.value)}
            placeholder="destinataire@entreprise.com"
            className="mail-compose-modal-input"
          />
        </div>

        <div className="mail-compose-modal-row mail-compose-modal-row--inline">
          <button
            type="button"
            className="mail-compose-link-btn"
            onClick={() => setShowCcBcc((value) => !value)}
          >
            {showCcBcc ? 'Masquer CC/BCC' : 'Ajouter CC/BCC'}
          </button>

          <div className="mail-compose-priority-wrap">
            <label className="mail-compose-modal-label">Priorite</label>
            <select
              value={composeForm.priority}
              onChange={(e) => updateComposeField('priority', e.target.value)}
              className="mail-compose-select"
            >
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
            </select>
          </div>
        </div>

        {showCcBcc && (
          <>
            <div className="mail-compose-modal-row">
              <label className="mail-compose-modal-label">CC</label>
              <Input
                value={composeForm.cc}
                onChange={(e) => updateComposeField('cc', e.target.value)}
                placeholder="copie@entreprise.com"
                className="mail-compose-modal-input"
              />
            </div>
            <div className="mail-compose-modal-row">
              <label className="mail-compose-modal-label">BCC</label>
              <Input
                value={composeForm.bcc}
                onChange={(e) => updateComposeField('bcc', e.target.value)}
                placeholder="copie-cachee@entreprise.com"
                className="mail-compose-modal-input"
              />
            </div>
          </>
        )}

        <div className="mail-compose-modal-row">
          <label className="mail-compose-modal-label">Objet</label>
          <Input
            value={composeForm.subject}
            onChange={(e) => updateComposeField('subject', e.target.value)}
            placeholder="Objet du message"
            className="mail-compose-modal-input"
          />
        </div>

        <div className="mail-compose-modal-row">
          <Input
            as="textarea"
            rows={10}
            value={composeForm.body}
            onChange={(e) => updateComposeField('body', e.target.value)}
            placeholder="Ecrivez votre message..."
            className="mail-compose-modal-textarea"
          />
        </div>

        <div className="mail-compose-modal-tools">
          <button type="button" className="mail-compose-tool-btn" onClick={handleAddAttachment}>
            <Paperclip size={14} />
            Ajouter une piece jointe
          </button>
          <div className="mail-compose-schedule">
            <CalendarClock size={14} />
            <input
              type="datetime-local"
              value={composeForm.scheduleAt}
              onChange={(e) => updateComposeField('scheduleAt', e.target.value)}
              className="mail-compose-schedule-input"
            />
          </div>
        </div>

        {composeAttachments.length > 0 && (
          <div className="mail-compose-attachments">
            {composeAttachments.map((att) => (
              <div key={att.id} className="mail-compose-attachment-item">
                <span>{att.name} ({att.size})</span>
                <button type="button" onClick={() => handleRemoveAttachment(att.id)}>Supprimer</button>
              </div>
            ))}
          </div>
        )}

        <div className="mail-compose-modal-actions">
          <Button variant="ghost" onClick={handleComposeSaveDraft}>Enregistrer brouillon</Button>
          <Button variant="primary" icon={<Send size={14} />} onClick={handleComposeSend}>
            Envoyer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComposeMailModal;
