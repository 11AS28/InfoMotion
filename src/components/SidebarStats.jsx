import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';

function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout } = useAuth();
  const { theme } = useTheme(); 
  const stats = getStatistici();

  if (!currentUser) return null;

  // Calc lvl
  const { progresProcent } = getStatistici();

let nivel = "Începător";
if (progresProcent >= 80) {
  nivel = "Expert";
} else if (progresProcent >= 40) {
  nivel = "Intermediar";
}
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`} data-theme={theme}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="sidebar-header">
          <div className="user-avatar-placeholder">👤</div>
          <h3>{currentUser.nume || currentUser.email.split('@')[0]}</h3>
          <span className="badge-nivel">{nivel}</span>
        </div>

        <div className="sidebar-content">
          <h4>Centru Statistici</h4>
          
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Lecții Terminate</span>
              <span className="stat-value">{stats.terminate}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Puncte XP</span>
              <span className="stat-value">{stats.terminate * 50}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span>Progres Curs</span>
              <span>{Math.round(stats.progresProcent)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${stats.progresProcent}%` }}></div>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item">
              <span>Email:</span>
              <strong>{currentUser.email}</strong>
            </div>
            <div className="info-item">
              <span>Status:</span>
              <strong className="status-online">Activ</strong>
            </div>
          </div>
        </div>

        <button className="logout-btn-sidebar" onClick={() => { logout(); onClose(); }}>
          Deconectare Cont
        </button>
      </div>
    </>
  );
}

export default SidebarStats;