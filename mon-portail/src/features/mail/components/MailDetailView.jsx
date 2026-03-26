import React from 'react';
import { Clock, Paperclip, Reply, Forward, Archive, Trash2, Download, FileText, FileSpreadsheet, Image, File, FolderPlus } from 'lucide-react';
import { Badge } from '../../../components/ui';

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return <FileText size={16} className="mail-att-icon mail-att-icon--pdf" />;
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet size={16} className="mail-att-icon mail-att-icon--excel" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return <Image size={16} className="mail-att-icon mail-att-icon--image" />;
  return <File size={16} className="mail-att-icon" />;
}

const MailDetailView = ({
  mail,
  classifiedAttachmentIds = [],
  classifiedAttachmentPaths = {},
  onClassifyAttachment,
}) => {
  if (!mail) return null;
  const getDrivePathLabel = (attachment) =>
    classifiedAttachmentPaths[attachment.id] ||
    `/Drive/Mails/recus/a-faire/contact-test/${attachment.name}`;

  return (
    <div className="mail-detail-view">
      <div className="mail-detail-view-header">
        <div className="mail-detail-view-sender-row">
          <div className="mail-detail-view-avatar">
            {mail.sender.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="mail-detail-view-sender">{mail.sender}</div>
            <div className="mail-detail-view-email">{mail.email}</div>
          </div>
        </div>
        <div className="mail-detail-view-meta">
          <Clock size={13} />
          {mail.fullDate}
        </div>
      </div>

      <div className="mail-detail-view-actions-bar">
        <button type="button" className="mail-detail-action-btn" title="Répondre">
          <Reply size={15} />
          <span>Répondre</span>
        </button>
        <button type="button" className="mail-detail-action-btn" title="Transférer">
          <Forward size={15} />
          <span>Transférer</span>
        </button>
        <div className="mail-detail-actions-spacer" />
        <button type="button" className="mail-detail-action-btn" title="Archiver">
          <Archive size={15} />
        </button>
        <button type="button" className="mail-detail-action-btn mail-detail-action-btn--danger" title="Supprimer">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mail-detail-view-subject">{mail.subject}</div>
      <div className="mail-detail-view-body">{mail.body}</div>
      {mail.attachments && mail.attachments.length > 0 && (
        <div className="mail-detail-view-attachments">
          <div className="mail-detail-view-attachments-title">
            <Paperclip size={14} />
            Pièces jointes ({mail.attachments.length})
          </div>
          {mail.attachments.map((att) => (
            <div key={att.id} className="mail-detail-view-attachment">
              <div className="mail-detail-view-attachment-info">
                {getFileIcon(att.name)}
                <span className="mail-detail-view-attachment-name">{att.name}</span>
              </div>
              <div className="mail-detail-view-attachment-right">
                <span className="mail-detail-view-attachment-size">{att.size}</span>
                {classifiedAttachmentIds.includes(att.id) ? (
                  <Badge
                    variant="green"
                    className="mail-detail-view-attachment-drive-badge"
                    title={`Classe dans Drive: ${getDrivePathLabel(att)}`}
                  >
                    Classé dans Drive
                  </Badge>
                ) : (
                  <button
                    type="button"
                    className="mail-detail-view-attachment-drive"
                    title="Classer dans Drive"
                    onClick={() => onClassifyAttachment?.(mail.id, att)}
                  >
                    <FolderPlus size={14} />
                  </button>
                )}
                <button type="button" className="mail-detail-view-attachment-dl" title="Télécharger">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MailDetailView;
