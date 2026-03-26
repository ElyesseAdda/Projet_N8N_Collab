import React, { useState } from 'react';
import { Clock, ChevronDown, Sparkles } from 'lucide-react';
import { ZoniaAvatar } from '../../../components/ui';
import './TimeSavedWidget.css';

/**
 * Widget affichant le temps économisé par Zonia pour l'utilisateur.
 * Se place en bas de la sidebar. Supporte un mode compact (sidebar collapsed).
 *
 * @param {{ timeSavedData: ReturnType<import('../../../hooks/useTimeSaved').useTimeSaved>, isCollapsed: boolean }} props
 */
const TimeSavedWidget = ({ timeSavedData, isCollapsed }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const {
    hours,
    remainingMinutes,
    actionCount,
    byType,
    selectedMonth,
    selectedYear,
    setFilter,
    availableMonths,
  } = timeSavedData;

  const currentLabel = new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  if (isCollapsed) {
    return (
      <div className="time-saved-widget time-saved-widget--collapsed" title={`${hours}h ${remainingMinutes}min économisées`}>
        <div className="time-saved-collapsed-icon">
          <Clock size={18} />
        </div>
        <span className="time-saved-collapsed-value">{hours}h</span>
      </div>
    );
  }

  return (
    <div className="time-saved-widget">
      <div className="time-saved-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="time-saved-avatar-row">
          <ZoniaAvatar />
          <Sparkles size={14} className="time-saved-sparkle" />
        </div>

        <div className="time-saved-text">
          <span className="time-saved-label">Zonia a travaillé</span>
          <span className="time-saved-value">
            {hours}h{remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}
          </span>
          <span className="time-saved-label">pour vous ce mois-ci</span>
        </div>
      </div>

      <div className="time-saved-month-selector">
        <button
          type="button"
          className="time-saved-month-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowMonthPicker(!showMonthPicker);
          }}
        >
          <Clock size={13} />
          <span>{currentLabel}</span>
          <ChevronDown size={13} className={`time-saved-chevron ${showMonthPicker ? 'time-saved-chevron--open' : ''}`} />
        </button>

        {showMonthPicker && (
          <div className="time-saved-month-dropdown">
            {availableMonths.map((m) => (
              <button
                key={`${m.year}-${m.month}`}
                type="button"
                className={`time-saved-month-option ${m.month === selectedMonth && m.year === selectedYear ? 'time-saved-month-option--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter(m.month, m.year);
                  setShowMonthPicker(false);
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="time-saved-details">
          <div className="time-saved-stat-row">
            <span className="time-saved-stat-label">Actions réalisées</span>
            <span className="time-saved-stat-value">{actionCount}</span>
          </div>
          <div className="time-saved-breakdown">
            {Object.entries(byType).map(([key, data]) => (
              <div key={key} className="time-saved-breakdown-item">
                <span className="time-saved-breakdown-label">{data.label}</span>
                <span className="time-saved-breakdown-value">
                  {data.count} × ~{Math.round(data.minutes / data.count)}min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSavedWidget;
