import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import './RowDeleteConfirmModal.css';

const RowDeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, message }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Supprimer la ligne"
    loading={loading}
    className="row-delete-confirm-modal"
  >
    <p className="row-delete-confirm-text">
      {message ?? 'Êtes-vous sûr de vouloir supprimer cette ligne ?'}
    </p>
    <div className="row-delete-confirm-footer">
      <Button variant="ghost" onClick={onClose} disabled={loading}>
        Annuler
      </Button>
      <Button
        variant="primary"
        onClick={onConfirm}
        loading={loading}
        disabled={loading}
        icon={!loading ? <Trash2 size={18} /> : undefined}
        className="row-delete-confirm-btn"
      >
        Supprimer
      </Button>
    </div>
  </Modal>
);

export default RowDeleteConfirmModal;
