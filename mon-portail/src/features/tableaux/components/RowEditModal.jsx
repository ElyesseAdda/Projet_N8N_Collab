import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../../lib/supabase';
import { getColumnLabel, COLUMNS_EDIT_READONLY } from '../../../utils/formatting';
import { Modal, Button, Input } from '../../../components/ui';
import './RowEditModal.css';

const readonlySet = new Set(COLUMNS_EDIT_READONLY.map((c) => c.toLowerCase()));

function getEditableColumns(row) {
  if (!row || typeof row !== 'object') return [];
  return Object.keys(row).filter((k) => !readonlySet.has(k.toLowerCase()));
}

const RowEditModal = ({ isOpen, onClose, row, tableName, titleLabel, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editableColumns = getEditableColumns(row);

  useEffect(() => {
    if (!isOpen || !row) return;
    const cols = getEditableColumns(row);
    const initial = {};
    cols.forEach((col) => {
      initial[col] = row[col] != null ? String(row[col]) : '';
    });
    setFormData(initial);
    setError(null);
  }, [isOpen, row]);

  const handleChange = (col, value) => {
    setFormData((prev) => ({ ...prev, [col]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!row?.id || !tableName || !isSupabaseAvailable() || !supabase) return;
    setError(null);
    setLoading(true);
    try {
      const payload = {};
      editableColumns.forEach((col) => {
        const v = formData[col];
        payload[col] = v != null && String(v).trim() !== '' ? String(v).trim() : null;
      });
      const { error: err } = await supabase.from(tableName).update(payload).eq('id', row.id);
      if (err) throw err;
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('[RowEditModal] Update error:', err);
      setError(err?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleLabel ?? 'Modifier la ligne'}
      icon={<Pencil size={20} />}
      loading={loading}
      className="row-edit-modal"
    >
      <form onSubmit={handleSubmit} className="row-edit-form">
        {error && (
          <div className="row-edit-error" role="alert">
            {error}
          </div>
        )}
        <div className="row-edit-fields">
          {editableColumns.map((col) => (
            <label key={col} className="row-edit-field">
              <span className="row-edit-field-label">{getColumnLabel(col)}</span>
              <Input
                value={formData[col] ?? ''}
                onChange={(e) => handleChange(col, e.target.value)}
                placeholder={getColumnLabel(col)}
                disabled={loading}
              />
            </label>
          ))}
        </div>
        <div className="row-edit-footer">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RowEditModal;
