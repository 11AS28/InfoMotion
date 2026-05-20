import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; 
import SidebarStats from './SidebarStats'; 
import '../components_css/nav.css';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="nav-header">
        <div className="nav-logo">
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}
          >
            <img 
              src="/logo-infomotion.svg?v=2" 
              alt="logo" 
              style={{ width: '50px', height: 'auto', display: 'block' }} 
            />

            <div>
            InfoMotion<span>.</span>
            </div>
          </Link>
        </div>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Acasă</Link></li>
        <li><Link to="/despre" onClick={() => setIsOpen(false)}>Despre</Link></li>
        <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
        <li><Link to="/arena" onClick={() => setIsOpen(false)}>Arena</Link></li>
        
        <li>
          <button
            className={`theme-toggle ${theme === 'dark' ? 'dark-active' : ''}`}
            onClick={toggleTheme}
            aria-label="Schimbă tema"
          >
            <div className="theme-toggle-track">
              <span className="icon-sun">☀️</span>
              <span className="icon-moon">🌙</span>
              <div className="theme-toggle-thumb"></div>
            </div>
          </button>
        </li>

        
        {currentUser ? (
          <li className="nav-user-info">
    <div className="nav-user-badge" onClick={() => setIsSidebarOpen(true)}>
      <span className="user-icon-mini">👤</span> 
      <span className="user-name-text">
        {currentUser.nume || currentUser.email.split('@')[0]}
      </span>
    </div>
  </li>
        ) : (
          <li><Link to="/auth" className="btn-login" onClick={() => setIsOpen(false)}>Logare</Link></li>
        )}

        <li className="nav-cta">
          <Link to="/lectii" className="btn-accent" onClick={() => setIsOpen(false)}>Începe să înveți</Link>
        </li>
      </ul>

      
      <SidebarStats 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </nav>
  );
}

export default Nav;
