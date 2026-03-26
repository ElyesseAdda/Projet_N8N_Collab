import React, { useState } from 'react';
import { Building2, MoreVertical } from 'lucide-react';
import { formatDate } from '../../utils/formatting';
import { Button } from '../../components/ui';
import TableauActionsModal from './components/TableauActionsModal';

const TableauCard = ({ tableau, isSelected, onClick, onRefresh, onTableauDeleted, onTableauUpdated }) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const resumeTable = tableau.resume_table ?? tableau.Resume_table;
  const createdAt = tableau.created_at;

  const handleActionsClick = (e) => {
    e.stopPropagation();
    setActionsOpen(true);
  };

  return (
    <>
      <div
        className={`tableau-card ${isSelected ? 'tableau-card-selected' : ''}`}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && !e.target.closest('.tableau-card-actions') && onClick?.()}
        role="button"
        tabIndex={0}
      >
        <div className="tableau-card-header">
          <div className="tableau-card-title">
            <Building2 size={18} className="tableau-card-title-icon" />
            <h3>{resumeTable || 'Sans titre'}</h3>
          </div>
          <div className="tableau-card-header-right">
            {createdAt && (
              <span className="tableau-card-header-date">{formatDate(createdAt)}</span>
            )}
            <Button
              variant="icon"
              size="sm"
              className="tableau-card-actions"
              icon={<MoreVertical size={18} />}
              onClick={handleActionsClick}
              title="Modifier ou supprimer"
              aria-label="Actions sur le tableau"
            />
          </div>
        </div>
      </div>
      <TableauActionsModal
        isOpen={actionsOpen}
        onClose={() => setActionsOpen(false)}
        tableau={tableau}
        onSuccess={onRefresh}
        onTableauDeleted={onTableauDeleted}
        onTableauUpdated={onTableauUpdated}
      />
    </>
  );
};

export default TableauCard;
