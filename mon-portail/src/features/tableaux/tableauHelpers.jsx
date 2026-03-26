import React from 'react';
import { formatCellValue } from '../../utils/formatting';

// ─── Column keys for company name (priority left→right) ──────────────────────
const SOCIETE_COLUMN_KEYS = [
  'societe_name', 'societe', 'Societe_name', 'Societe', 'company', 'company_name',
];

// ─── Column keys for city ─────────────────────────────────────────────────────
const VILLE_COLUMN_KEYS = ['ville', 'city', 'Ville', 'City'];

export const getSocieteColumnKey = (row) => {
  if (!row || typeof row !== 'object') return null;
  for (const key of SOCIETE_COLUMN_KEYS) {
    if (
      Object.prototype.hasOwnProperty.call(row, key) &&
      row[key] != null &&
      String(row[key]).trim() !== ''
    ) {
      return key;
    }
  }
  return null;
};

export const getVilleColumnKey = (row) => {
  if (!row || typeof row !== 'object') return null;
  for (const key of VILLE_COLUMN_KEYS) {
    if (
      Object.prototype.hasOwnProperty.call(row, key) &&
      row[key] != null &&
      String(row[key]).trim() !== ''
    ) {
      return key;
    }
  }
  return null;
};

/**
 * Returns a list of unique "Company, City" strings from the rows.
 */
export const getEntreprisesFromRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const societeKey = getSocieteColumnKey(rows[0]);
  if (!societeKey) return [];
  const villeKey = getVilleColumnKey(rows[0]);
  const set = new Set();
  rows.forEach((row) => {
    const nom = row[societeKey];
    if (nom == null || String(nom).trim() === '') return;
    const societeStr = String(nom).trim();
    const villeVal = villeKey ? row[villeKey] : null;
    const villeStr =
      villeVal != null && String(villeVal).trim() !== ''
        ? String(villeVal).trim()
        : '';
    const label = villeStr ? `${societeStr} à ${villeStr}` : societeStr;
    set.add(label);
  });
  return Array.from(set);
};

// ─── Website helpers ──────────────────────────────────────────────────────────

const isWebsiteColumn = (key) =>
  key.toLowerCase() === 'website' || key.toLowerCase() === 'site';

const getUrlForWebsite = (value) => {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

/**
 * Renders a cell value, turning website columns into clickable links.
 */
export const renderCellContent = (col, value) => {
  const formatted = formatCellValue(col, value);
  if (formatted === '-') return formatted;
  if (isWebsiteColumn(col)) {
    const url = getUrlForWebsite(value);
    if (url) {
      const displayText = (value || '')
        .replace(/^https?:\/\//i, '')
        .replace(/\/$/, '');
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="tableau-detail-website-link"
        >
          {displayText || url}
        </a>
      );
    }
  }
  return formatted;
};
