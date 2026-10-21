import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  LayoutGrid,
  Mail,
  Menu,
  ChevronRight,
  ChevronDown,
  UserRoundSearch,
} from 'lucide-react';
import { ZoniaLogo } from '../../components/ui';
import { useTimeSaved } from '../../hooks/useTimeSaved';
import TimeSavedWidget from './components/TimeSavedWidget';
import './Sidebar.css';

const NAV_ITEMS_TOP = [{ id: 'chat', label: 'Chat', icon: MessageSquare }];

const TABLEAUX_GROUP = {
  label: 'Mes Tableaux',
  icon: LayoutGrid,
  children: [{ id: 'tableaux', label: 'Enrichissement de lead', icon: UserRoundSearch }],
};

const NAV_ITEMS_BOTTOM = [{ id: 'mail', label: 'Mail', icon: Mail }];

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tableauxGroupOpen, setTableauxGroupOpen] = useState(activeSection === 'tableaux');
  const timeSavedData = useTimeSaved();

  useEffect(() => {
    if (activeSection === 'tableaux') setTableauxGroupOpen(true);
  }, [activeSection]);

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
        {NAV_ITEMS_TOP.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}

        {isCollapsed ? (
          <button
            type="button"
            className={`sidebar-nav-item ${activeSection === 'tableaux' ? 'sidebar-nav-item-active' : ''}`}
            onClick={() => onSectionChange('tableaux')}
            title="Enrichissement de lead"
          >
            <UserRoundSearch size={20} />
            <span className="sidebar-nav-label">Enrichissement de lead</span>
          </button>
        ) : (
          <div className="sidebar-nav-group">
            <button
              type="button"
              className={`sidebar-nav-group-toggle ${activeSection === 'tableaux' ? 'sidebar-nav-group-toggle-active' : ''}`}
              onClick={() => setTableauxGroupOpen((o) => !o)}
              aria-expanded={tableauxGroupOpen}
              title={TABLEAUX_GROUP.label}
            >
              <LayoutGrid size={20} />
              <span className="sidebar-nav-label">{TABLEAUX_GROUP.label}</span>
              <span className="sidebar-nav-group-chevron" aria-hidden>
                {tableauxGroupOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
            </button>
            <div className="sidebar-nav-group-items" hidden={!tableauxGroupOpen}>
              {TABLEAUX_GROUP.children.map((child) => {
                const ChildIcon = child.icon;
                const isActive = activeSection === child.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    className={`sidebar-nav-item sidebar-nav-subitem ${isActive ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => onSectionChange(child.id)}
                    title={child.label}
                  >
                    <ChildIcon size={18} />
                    <span className="sidebar-nav-label">{child.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {NAV_ITEMS_BOTTOM.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
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
