import React, { useState } from 'react';
import { MessageSquare, LayoutGrid, Mail, Menu, ChevronRight } from 'lucide-react';
import { ZoniaLogo } from '../../components/ui';
import { useTimeSaved } from '../../hooks/useTimeSaved';
import TimeSavedWidget from './components/TimeSavedWidget';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'tableaux', label: 'Mes Tableaux', icon: LayoutGrid },
  { id: 'mail', label: 'Mail', icon: Mail },
];

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timeSavedData = useTimeSaved();

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'app-sidebar-collapsed' : ''}`}>
      <div className="sidebar-header-wrapper">
        <div className="sidebar-header">
          <ZoniaLogo size={32} />
          <span className="sidebar-title">ZONIA</span>
          {!isCollapsed && (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setIsCollapsed(true)}
              title="Reduire le menu"
              aria-label="Reduire le menu"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            type="button"
            className="sidebar-tab"
            onClick={() => setIsCollapsed(false)}
            title="Ouvrir le menu"
            aria-label="Ouvrir le menu"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <TimeSavedWidget timeSavedData={timeSavedData} isCollapsed={isCollapsed} />

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">Zonia Platform</div>
      </div>
    </aside>
  );
};

export default Sidebar;
