// ─── Column label mapping (French translations) ──────────────────────────────
export const COLUMN_LABELS = {
  societe_name: 'Nom Société',
  societe: 'Nom Société',
  adress: 'Adresse',
  address: 'Adresse',
  adresse: 'Adresse',
  city: 'Ville',
  ville: 'Ville',
  website: 'SiteWeb',
  site: 'SiteWeb',
  siteweb: 'SiteWeb',
  phone: 'Téléphone',
  telephone: 'Téléphone',
  tel: 'Téléphone',
  resume_activity: "Résumé d'activité",
  resume: "Résumé d'activité",
  activity: "Résumé d'activité",
};

// ─── Columns to hide ──────────────────────────────────────────────────────────
export const COLUMNS_TO_HIDE = [
  'tableau_id',
  'id_tableau',
  'table_id',
  'id',
  'created_at',
  'updated_at',
  'category',
];

export const CONTACT_COLUMNS_TO_HIDE = [
  'id',
  'created_at',
  'updated_at',
  'table_id',
];

/** Colonnes exclues du formulaire d’édition (lecture seule : source + techniques) */
export const COLUMNS_EDIT_READONLY = [
  'source',
  'id',
  'table_id',
  'created_at',
  'updated_at',
];

const DATE_COLUMNS = ['date', 'created_at', 'updated_at'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable label for a database column key.
 */
export const getColumnLabel = (key) => {
  const k = key.toLowerCase().replace(/\s/g, '_');
  return (
    COLUMN_LABELS[k] ??
    key
      .replace(/_/g, ' ')
      .replace(/^./, (s) => s.toUpperCase())
  );
};

/**
 * Formats a cell value for display (handles dates).
 */
export const formatCellValue = (key, value) => {
  if (value == null || value === '') return '-';
  if (DATE_COLUMNS.some((c) => key.toLowerCase().includes(c))) {
    try {
      const d = new Date(value);
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(value);
    }
  }
  return String(value);
};

/**
 * Formats a date string to French locale.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Decode literal Unicode escape sequences in a string (e.g. "\u00e9" -> "é").
 * Use for text from API/DB that may contain backslash-u-XXXX as literal characters.
 */
export function decodeUnicodeEscapes(str) {
  if (str == null || typeof str !== 'string') return str;
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}
