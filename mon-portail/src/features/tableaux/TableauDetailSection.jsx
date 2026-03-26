import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, X, Sparkles, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import {
  TABLE_TABLEAU_TEST,
  TABLE_CONTACT_SOCIETY,
  FK_COLUMN,
  FK_CONTACT_TO_SOCIETY,
  ENRICH_WEBHOOK_URL,
} from '../../config/constants';
import { getColumnLabel, COLUMNS_TO_HIDE, CONTACT_COLUMNS_TO_HIDE } from '../../utils/formatting';
import { getEntreprisesFromRows, renderCellContent } from './tableauHelpers.jsx';
import { Button, StatusMessage, Badge } from '../../components/ui';
import EnrichModal from './components/EnrichModal';
import TableauActionsModal from './components/TableauActionsModal';
import RowEditModal from './components/RowEditModal';
import RowDeleteConfirmModal from './components/RowDeleteConfirmModal';
import './TableauDetailSection.css';

const TableauDetailSection = ({ selectedTableau, onClose, sessionId, onTableauDeleted, onTableauUpdated }) => {
  const [rows, setRows] = useState([]);
  const [contactsByRowId, setContactsByRowId] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState(() => new Set());
  const [showEnrichModal, setShowEnrichModal] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState(null);
  const [tableauActionsOpen, setTableauActionsOpen] = useState(false);
  const [rowEdit, setRowEdit] = useState({ row: null, tableName: '', titleLabel: '' });
  const [rowDelete, setRowDelete] = useState({ row: null, tableName: '', titleLabel: '' });
  const [deleteRowLoading, setDeleteRowLoading] = useState(false);

  // ── Enrich submit ──────────────────────────────────────────────────────────
  const handleEnrichSubmit = async (postesText) => {
    const entreprises = getEntreprisesFromRows(rows);
    if (entreprises.length === 0) {
      setEnrichError(
        'Aucune entreprise trouvée dans le tableau (vérifiez la colonne Nom Société).',
      );
      return;
    }
    setEnrichError(null);
    setEnrichLoading(true);
    const message = `Trouve moi les ${postesText.trim()} des entreprise ${entreprises.join(', ')} et enregistrer les dans la table contact_society`;
    const body = { message, session_id: sessionId ?? '' };
    try {
      const res = await fetch(ENRICH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let detail = res.statusText || '';
        try {
          const text = await res.text();
          if (text) detail = text;
        } catch (_) {
          /* empty */
        }
        throw new Error(
          `Erreur ${res.status} côté serveur (n8n). ${detail ? `Détail: ${detail.slice(0, 200)}` : ''}`,
        );
      }
      setShowEnrichModal(false);
    } catch (err) {
      console.error('[Enrich] Webhook error:', err);
      setEnrichError(err?.message || "Erreur lors de l'envoi au webhook.");
    } finally {
      setEnrichLoading(false);
    }
  };

  const loadRows = useCallback(async () => {
    if (!selectedTableau?.id || !isSupabaseAvailable() || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(TABLE_TABLEAU_TEST)
        .select('*')
        .eq(FK_COLUMN, selectedTableau.id);
      if (err) throw err;
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Supabase] Erreur chargement tableau_test:', err);
      setError(err?.message || 'Erreur lors du chargement');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTableau?.id]);

  const loadContacts = useCallback(async () => {
    if (!isSupabaseAvailable() || !supabase || rows.length === 0) {
      setContactsByRowId({});
      return;
    }
    const rowIds = rows.map((r) => r.id).filter(Boolean);
    if (rowIds.length === 0) {
      setContactsByRowId({});
      return;
    }
    setContactsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from(TABLE_CONTACT_SOCIETY)
        .select('*')
        .in(FK_CONTACT_TO_SOCIETY, rowIds);
      if (err) throw err;
      const byId = {};
      (Array.isArray(data) ? data : []).forEach((c) => {
        const fk = c[FK_CONTACT_TO_SOCIETY];
        if (fk != null) {
          if (!byId[fk]) byId[fk] = [];
          byId[fk].push(c);
        }
      });
      setContactsByRowId(byId);
    } catch (err) {
      console.error('[Supabase] Erreur chargement contact_society:', err);
      setContactsByRowId({});
    } finally {
      setContactsLoading(false);
    }
  }, [rows]);

  useEffect(() => {
    if (!selectedTableau?.id) {
      setRows([]);
      setExpandedRowIds(new Set());
      return;
    }
    setExpandedRowIds(new Set());
    loadRows();
  }, [selectedTableau?.id, loadRows]);

  useEffect(() => {
    if (rows.length === 0) {
      setContactsByRowId({});
      return;
    }
    loadContacts();
  }, [rows, loadContacts]);

  if (!selectedTableau) return null;

  const columns =
    rows.length > 0
      ? Object.keys(rows[0]).filter((k) => !COLUMNS_TO_HIDE.includes(k.toLowerCase()))
      : [];

  const contactColumnsToHide = CONTACT_COLUMNS_TO_HIDE;
  const title = selectedTableau.resume_table ?? selectedTableau.Resume_table ?? 'Détails du tableau';

  return (
    <div className="tableau-detail-section">
      <div
        className="tableau-detail-header"
        onClick={() => setIsCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsCollapsed((c) => !c)}
      >
        <div className="tableau-detail-title">
          <span className="tableau-detail-toggle">
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </span>
          <span>{title}</span>
          <Button
            variant="icon"
            size="sm"
            className="tableau-detail-title-actions"
            icon={<MoreVertical size={18} />}
            onClick={(e) => {
              e.stopPropagation();
              setTableauActionsOpen(true);
            }}
            title="Modifier ou supprimer le tableau"
            aria-label="Actions sur le tableau"
          />
        </div>
        <div className="tableau-detail-header-actions">
          <button
            type="button"
            className="tableau-detail-enrich-btn"
            onClick={(e) => {
              e.stopPropagation();
              setEnrichError(null);
              setShowEnrichModal(true);
            }}
            title="Enrichir mes données"
          >
            <Sparkles size={16} />
            Enrichir mes données
          </button>
          <Button
            variant="icon"
            size="sm"
            className="tableau-detail-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Fermer"
            aria-label="Fermer"
            icon={<X size={18} />}
          />
        </div>
      </div>

      <TableauActionsModal
        isOpen={tableauActionsOpen}
        onClose={() => setTableauActionsOpen(false)}
        tableau={selectedTableau}
        onSuccess={loadRows}
        onTableauDeleted={(id) => {
          onTableauDeleted?.(id);
          onClose();
        }}
        onTableauUpdated={onTableauUpdated}
      />

      <EnrichModal
        isOpen={showEnrichModal}
        onClose={() => {
          setEnrichError(null);
          setShowEnrichModal(false);
        }}
        onSubmit={handleEnrichSubmit}
        loading={enrichLoading}
        error={enrichError}
      />

      {!isCollapsed && (
        <div className="tableau-detail-body">
          {loading && <StatusMessage type="loading" message="Chargement des lignes..." />}
          {error && <StatusMessage type="error" message={error} />}
          {!loading && !error && rows.length === 0 && (
            <StatusMessage type="empty" message="Aucune ligne dans ce tableau" />
          )}
          {!loading && !error && rows.length > 0 && (
            <div className="tableau-detail-table-wrap">
              <div
                className="tableau-detail-grid-header-row"
                style={{ gridTemplateColumns: `2.5rem repeat(${columns.length}, minmax(0, 1fr)) 4.5rem` }}
              >
                <div className="tableau-detail-grid-header tableau-detail-cell-expand" aria-label="Développer" />
                {columns.map((col) => (
                  <div key={col} className="tableau-detail-grid-header">
                    {getColumnLabel(col)}
                  </div>
                ))}
                <div className="tableau-detail-grid-header tableau-detail-cell-actions">Actions</div>
              </div>
              {rows.map((row, idx) => {
                const rowId = row.id ?? idx;
                const contacts = contactsByRowId[row.id] ?? [];
                const isExpanded = expandedRowIds.has(row.id);
                const contactColumns =
                  contacts.length > 0
                    ? Object.keys(contacts[0]).filter(
                        (k) => !contactColumnsToHide.includes(k.toLowerCase()),
                      )
                    : [];
                return (
                  <React.Fragment key={rowId}>
                    <div
                      className={`tableau-detail-grid-row ${isExpanded ? 'tableau-detail-row-expanded' : ''}`}
                      style={{ gridTemplateColumns: `2.5rem repeat(${columns.length}, minmax(0, 1fr)) 4.5rem` }}
                    >
                      <div className="tableau-detail-cell-expand">
                        {contacts.length > 0 ? (
                          <button
                            type="button"
                            className="tableau-detail-expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRowIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(row.id)) next.delete(row.id);
                                else next.add(row.id);
                                return next;
                              });
                            }}
                            title={isExpanded ? 'Replier les contacts' : 'Voir les contacts'}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <Badge variant="cyan">{contacts.length}</Badge>
                          </button>
                        ) : (
                          <span className="tableau-detail-no-contacts">0</span>
                        )}
                      </div>
                      {columns.map((col) => (
                        <div key={col} className="tableau-detail-grid-cell">
                          {renderCellContent(col, row[col])}
                        </div>
                      ))}
                      <div className="tableau-detail-cell-actions">
                        <Button
                          variant="icon"
                          size="sm"
                          className="tableau-detail-row-btn tableau-detail-row-btn--edit"
                          icon={<Pencil size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowEdit({ row, tableName: TABLE_TABLEAU_TEST, titleLabel: 'Modifier la ligne' });
                          }}
                          title="Modifier"
                        />
                        <Button
                          variant="icon"
                          size="sm"
                          className="tableau-detail-row-btn tableau-detail-row-btn--delete"
                          icon={<Trash2 size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowDelete({ row, tableName: TABLE_TABLEAU_TEST });
                          }}
                          title="Supprimer"
                        />
                      </div>
                    </div>
                    {isExpanded && contacts.length > 0 && (
                      <div className="tableau-detail-sub-row">
                        <div className="tableau-detail-sub-cell">
                          <div className="tableau-detail-contacts-block">
                            <div className="tableau-detail-contacts-title">Contacts</div>
                            {contactsLoading ? (
                              <StatusMessage type="loading" message="Chargement des contacts..." />
                            ) : (
                              <div className="tableau-detail-contacts-grid">
                                <div
                                  className="tableau-detail-contacts-row tableau-detail-contacts-header-row"
                                  style={{
                                    gridTemplateColumns: `repeat(${contactColumns.length}, minmax(0, 1fr)) 4.5rem`,
                                  }}
                                >
                                  {contactColumns.map((col) => (
                                    <div key={col} className="tableau-detail-contacts-header">
                                      {getColumnLabel(col)}
                                    </div>
                                  ))}
                                  <div className="tableau-detail-contacts-header tableau-detail-contacts-cell-actions">Actions</div>
                                </div>
                                {contacts.map((c, i) => (
                                  <div
                                    key={c.id ?? i}
                                    className="tableau-detail-contacts-row"
                                    style={{
                                      gridTemplateColumns: `repeat(${contactColumns.length}, minmax(0, 1fr)) 4.5rem`,
                                    }}
                                  >
                                    {contactColumns.map((col) => (
                                      <div key={col} className="tableau-detail-contacts-cell">
                                        {renderCellContent(col, c[col])}
                                      </div>
                                    ))}
                                    <div className="tableau-detail-contacts-cell tableau-detail-contacts-cell-actions">
                                      <Button
                                        variant="icon"
                                        size="sm"
                                        className="tableau-detail-row-btn tableau-detail-row-btn--edit"
                                        icon={<Pencil size={14} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRowEdit({ row: c, tableName: TABLE_CONTACT_SOCIETY, titleLabel: 'Modifier le contact' });
                                        }}
                                        title="Modifier"
                                      />
                                      <Button
                                        variant="icon"
                                        size="sm"
                                        className="tableau-detail-row-btn tableau-detail-row-btn--delete"
                                        icon={<Trash2 size={14} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRowDelete({ row: c, tableName: TABLE_CONTACT_SOCIETY });
                                        }}
                                        title="Supprimer"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}

      <RowEditModal
        isOpen={!!rowEdit.row}
        onClose={() => setRowEdit({ row: null, tableName: '', titleLabel: '' })}
        row={rowEdit.row}
        tableName={rowEdit.tableName}
        titleLabel={rowEdit.titleLabel}
        onSuccess={() => {
          if (rowEdit.tableName === TABLE_TABLEAU_TEST) loadRows();
          else loadContacts();
        }}
      />

      <RowDeleteConfirmModal
        isOpen={!!rowDelete.row}
        onClose={() => setRowDelete({ row: null, tableName: '' })}
        loading={deleteRowLoading}
        onConfirm={async () => {
          if (!rowDelete.row?.id || !rowDelete.tableName || !isSupabaseAvailable() || !supabase) return;
          setDeleteRowLoading(true);
          try {
            const { error: err } = await supabase
              .from(rowDelete.tableName)
              .delete()
              .eq('id', rowDelete.row.id);
            if (err) throw err;
            if (rowDelete.tableName === TABLE_TABLEAU_TEST) await loadRows();
            else await loadContacts();
            setRowDelete({ row: null, tableName: '' });
          } catch (err) {
            console.error('[TableauDetailSection] Delete row error:', err);
          } finally {
            setDeleteRowLoading(false);
          }
        }}
      />
    </div>
  );
};

export default TableauDetailSection;
