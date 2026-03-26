import { useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseAvailable,
  logSupabaseConfig,
} from '../lib/supabase';
import { TABLE_DOCUMENT_METADATA } from '../config/constants';

/**
 * Custom hook that manages the knowledge-base document list,
 * including search, loading, real-time subscription, and polling.
 *
 * @returns Document state & handlers.
 */
export function useDocuments() {
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');

  // ── Load documents from Supabase ───────────────────────────────────────────
  const loadDocuments = async () => {
    logSupabaseConfig();
    if (!isSupabaseAvailable() || !supabase) {
      console.warn('[Supabase] Client non disponible');
      return;
    }
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const response = await supabase
        .from(TABLE_DOCUMENT_METADATA)
        .select('id, title, url');
      const { data, error: err } = response;
      if (err) throw err;
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Supabase] Erreur:', err);
      setDocumentsError(err?.message || 'Erreur chargement documents');
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // ── Toggle expanded state ──────────────────────────────────────────────────
  const toggleDocumentsExpanded = () => {
    const next = !documentsExpanded;
    setDocumentsExpanded(next);
    if (next && !documentsLoading) loadDocuments();
  };

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseAvailable() || !supabase) return;
    const channel = supabase
      .channel('document_metadata_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_DOCUMENT_METADATA },
        () => {
          loadDocuments();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Polling when expanded ──────────────────────────────────────────────────
  useEffect(() => {
    if (!documentsExpanded || !isSupabaseAvailable()) return;
    const interval = setInterval(loadDocuments, 4000);
    return () => clearInterval(interval);
  }, [documentsExpanded]);

  return {
    documentsExpanded,
    documents,
    documentsLoading,
    documentsError,
    documentSearchQuery,
    setDocumentSearchQuery,
    toggleDocumentsExpanded,
    loadDocuments,
  };
}
