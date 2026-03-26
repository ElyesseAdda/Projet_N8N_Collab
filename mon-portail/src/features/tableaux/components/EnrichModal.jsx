import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Modal, Input, Button, Spinner } from '../../../components/ui';

const EnrichModal = ({ isOpen, onClose, onSubmit, loading, error }) => {
  const [postes, setPostes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = postes.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enrichir mes données"
      icon={<Sparkles size={22} />}
      loading={loading}
    >
      <form onSubmit={handleSubmit} className="tableau-enrich-modal-body">
        <p className="tableau-enrich-modal-label">
          Indiquez les postes à enrichir (un par ligne ou séparés par des virgules)
        </p>
        {error && (
          <div className="tableau-enrich-modal-error" role="alert">
            {error}
          </div>
        )}
        <div className="tableau-enrich-input-wrap">
          <Input
            as="textarea"
            value={postes}
            onChange={(e) => setPostes(e.target.value)}
            placeholder="Ex : Développeur, Chef de projet, Data Analyst..."
            rows={4}
            disabled={loading}
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!postes.trim() || loading}
            loading={loading}
            icon={!loading ? <Send size={18} /> : undefined}
            className="tableau-enrich-send"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrichModal;
