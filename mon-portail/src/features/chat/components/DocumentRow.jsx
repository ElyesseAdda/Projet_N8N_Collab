import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDocumentIcon(extension) {
  const ext = (extension || '').toLowerCase().replace(/^\./, '');
  const iconSize = 12;
  switch (ext) {
    case 'pdf':
      return { icon: <FileText size={iconSize} />, iconClass: 'chat-file-icon-red' };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return { icon: <FileSpreadsheet size={iconSize} />, iconClass: 'chat-file-icon-green' };
    case 'doc':
    case 'docx':
      return { icon: <FileText size={iconSize} />, iconClass: 'chat-file-icon-blue' };
    default:
      return { icon: <FileText size={iconSize} />, iconClass: 'chat-file-icon-cyan' };
  }
}

function getExtensionFromTitle(title) {
  const match = (title || '').match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : '';
}

// ── Component ────────────────────────────────────────────────────────────────

const DocumentRow = ({ title, url }) => {
  const ext = getExtensionFromTitle(title);
  const { icon, iconClass } = getDocumentIcon(ext);
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`chat-document-row ${url ? 'chat-document-row-clickable' : ''}`}
      onClick={url ? handleClick : undefined}
      onKeyDown={
        url
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      role={url ? 'button' : undefined}
      tabIndex={url ? 0 : undefined}
      title={url ? 'Ouvrir dans un nouvel onglet' : undefined}
    >
      <div className={`chat-file-item-icon ${iconClass}`}>{icon}</div>
      <span className="chat-document-row-title">{title || 'Sans titre'}</span>
    </div>
  );
};

export default DocumentRow;
