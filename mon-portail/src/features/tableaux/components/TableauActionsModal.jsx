import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../../lib/supabase';
import {
  TABLE_TABLEAU,
  TABLE_TABLEAU_TEST,
  TABLE_CONTACT_SOCIETY,
  FK_COLUMN,
  FK_CONTACT_TO_SOCIETY,
} from '../../../config/constants';
import { Modal, Button, Input } from '../../../components/ui';
import './TableauActionsModal.css';

const VIEW = { CHOICE: 'choice', EDIT: 'edit', DELETE: 'delete' };

/**
 * Modal pour modifier les infos d'un tableau ou le supprimer de la DB.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {object} tableau - { id, resume_table, ... }
 * @param {function} onSuccess - appelé après mise à jour ou suppression (pour rafraîchir la liste)
 * @param {function} onTableauDeleted - appelé avec (tableauId) après suppression (pour retirer des sélectionnés)
 * @param {function} onTableauUpdated - appelé avec (updatedTableau) après mise à jour (pour rafraîchir l’affichage)
 */
const TableauActionsModal = ({
  isOpen,
  onClose,
  tableau,
  onSuccess,
  onTableauDeleted,
  onTableauUpdated,
}) => {
  const [view, setView] = useState(VIEW.CHOICE);
  const [resumeTable, setResumeTable] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  const title = tableau?.resume_table ?? tableau?.Resume_table ?? 'Tableau';

  useEffect(() => {
    if (!isOpen || !tableau) return;
    setView(VIEW.CHOICE);
    setResumeTable((tableau.resume_table ?? tableau.Resume_table ?? '').toString());
    setError(null);
  }, [isOpen, tableau]);

  const handleClose = () => {
    if (saveLoading || deleteLoading) return;
    setError(null);
    onClose?.();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tableau?.id || !isSupabaseAvailable() || !supabase) return;
    setError(null);
    setSaveLoading(true);
    try {
      const newValue = resumeTable.trim() || null;
      const { error: err } = await supabase
        .from(TABLE_TABLEAU)
        .update({ Resume_table: newValue })
        .eq('id', tableau.id);
      if (err) throw err;
      onSuccess?.();
      onTableauUpdated?.({ ...tableau, resume_table: newValue, Resume_table: newValue });
      handleClose();
    } catch (err) {
      console.error('[TableauActionsModal] Update error:', err);
      setError(err?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tableau?.id || !isSupabaseAvailable() || !supabase) return;
    setError(null);
    setDeleteLoading(true);
    try {
      const tableauId = tableau.id;

      const { data: rows } = await supabase
        .from(TABLE_TABLEAU_TEST)
        .select('id')
        .eq(FK_COLUMN, tableauId);
      const rowIds = (rows ?? []).map((r) => r.id).filter(Boolean);

      if (rowIds.length > 0) {
        const { error: errContacts } = await supabase
          .from(TABLE_CONTACT_SOCIETY)
          .delete()
          .in(FK_CONTACT_TO_SOCIETY, rowIds);
        if (errContacts) throw errContacts;
      }

      const { error: errTest } = await supabase
        .from(TABLE_TABLEAU_TEST)
        .delete()
        .eq(FK_COLUMN, tableauId);
      if (errTest) throw errTest;

      const { error: err } = await supabase.from(TABLE_TABLEAU).delete().eq('id', tableauId);
      if (err) throw err;

      onTableauDeleted?.(tableauId);
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('[TableauActionsModal] Delete error:', err);
      setError(err?.message ?? 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const loading = saveLoading || deleteLoading;

  const modalTitle =
    view === VIEW.CHOICE
      ? 'Actions'
      : view === VIEW.EDIT
        ? 'Modifier le tableau'
        : 'Supprimer le tableau';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      loading={loading}
      className="tableau-actions-modal"
    >
      {view === VIEW.CHOICE && (
        <div className="tableau-actions-choice">
          <p className="tableau-actions-choice-label">{title} </p>
          <div className="tableau-actions-choice-btns">
            <Button
              variant="ghost"
              className="tableau-actions-choice-btn tableau-actions-choice-btn--edit"
              icon={<Pencil size={18} />}
              onClick={() => setView(VIEW.EDIT)}
              disabled={loading}
            >
              Modifier les infos
            </Button>
            <Button
              variant="ghost"
              className="tableau-actions-choice-btn tableau-actions-choice-btn--danger"
              icon={<Trash2 size={18} />}
              onClick={() => setView(VIEW.DELETE)}
              disabled={loading}
            >
              Supprimer de la base
            </Button>
          </div>
        </div>
      )}

      {view === VIEW.EDIT && (
        <form onSubmit={handleSave} className="tableau-actions-edit">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="tableau-actions-back"
            icon={<ArrowLeft size={16} />}
            onClick={() => setView(VIEW.CHOICE)}
            disabled={loading}
          >
            Retour
          </Button>
          {error && (
            <div className="tableau-actions-error" role="alert">
              {error}
            </div>
          )}
          <label className="tableau-actions-field">
            <span className="tableau-actions-field-label">Titre / Résumé</span>
            <Input
              value={resumeTable}
              onChange={(e) => setResumeTable(e.target.value)}
              placeholder="Nom du tableau"
              disabled={loading}
            />
          </label>
          <div className="tableau-actions-edit-footer">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              disabled={loading}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      )}

      {view === VIEW.DELETE && (
        <div className="tableau-actions-delete">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="tableau-actions-back"
            icon={<ArrowLeft size={16} />}
            onClick={() => setView(VIEW.CHOICE)}
            disabled={loading}
          >
            Retour
          </Button>
          {error && (
            <div className="tableau-actions-error" role="alert">
              {error}
            </div>
          )}
          <p className="tableau-actions-delete-text">
            Êtes-vous sûr de vouloir supprimer &laquo; {title} &raquo; ? Cette action est
            irréversible.
          </p>
          <div className="tableau-actions-delete-footer">
            <Button variant="ghost" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={deleteLoading}
              disabled={loading}
              icon={!deleteLoading ? <Trash2 size={18} /> : undefined}
              className="tableau-actions-delete-btn"
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TableauActionsModal;
