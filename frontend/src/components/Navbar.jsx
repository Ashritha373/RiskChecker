import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Database,
  GitCompare,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  X,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'assess', label: 'Risk assessment', icon: ClipboardList },
  { id: 'what-if', label: 'What-if analysis', icon: GitCompare },
  { id: 'models', label: 'Model evaluation', icon: BarChart3 },
  { id: 'dataset', label: 'Dataset explorer', icon: Database },
  { id: 'history', label: 'Assessment history', icon: Activity },
];

export default function Navbar({ activeTab, setActiveTab, isConnected, currentUser, onLogout }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="mobile-header">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button type="button" className="brand-lockup" onClick={() => navigate('dashboard')}>
          <span className="brand-mark"><Shield size={18} /></span>
          <span>RiskChecker</span>
        </button>
        <span className={`connection-state ${isConnected ? 'is-connected' : 'is-disconnected'}`}>
          <span className="connection-dot" />
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </header>

      {mobileOpen && <button type="button" className="sidebar-scrim" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} />}

      <aside className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <button type="button" className="brand-lockup sidebar-brand" onClick={() => navigate('dashboard')}>
          <span className="brand-mark"><Shield size={18} /></span>
          <span className="brand-name">RiskChecker</span>
        </button>
        <div className="workspace-label">RISK WORKSPACE</div>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id || (activeTab === 'result' && id === 'assess');
            return (
              <button
                type="button"
                key={id}
                className={`sidebar-link ${selected ? 'sidebar-link-active' : ''}`}
                onClick={() => navigate(id)}
                aria-current={selected ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className={`sidebar-connection ${isConnected ? 'is-connected' : 'is-disconnected'}`}>
            <span className="connection-dot" />
            <span>{isConnected ? 'Backend connected' : 'Backend unavailable'}</span>
          </div>

          {currentUser && (
            <div className="profile-area">
              {profileDropdownOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-user">
                    <strong>{currentUser.name || 'Analyst'}</strong>
                    <span>{currentUser.role || 'Risk Analyst'}</span>
                  </div>
                  <button
                    type="button"
                    className="profile-logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
              <button
                type="button"
                className="profile-button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
              >
                <span className="avatar">{currentUser.avatarInitials || 'AN'}</span>
                <span className="profile-name">{currentUser.name || 'Analyst'}</span>
                <ChevronDown size={15} />
              </button>
            </div>
          )}
          <div className="sidebar-version">Risk assessment platform</div>
        </div>
      </aside>
    </>
  );
}
