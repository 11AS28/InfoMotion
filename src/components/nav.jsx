import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; 
import SidebarStats from './SidebarStats'; 
import '../components_css/nav.css';
import { UserRound } from 'lucide-react';
import { ShoppingBag } from 'lucide-react';


function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  //  FUNCȚIE PENTRU CONFIGURAREA BADGE-ULUI (Text și Culori discrete)
  const getRoleBadge = () => {
    if (!currentUser) return null;
    
    if (currentUser.role === 'teacher') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: '#e3f2fd', // fundal albastru deschis
          color: '#0d47a1',          // text albastru închis
          marginLeft: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Profesor
        </span>
      );
    }
    
    // Default sau dacă e explicit 'student'
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: '#e8f5e9', // fundal verde deschis
        color: '#1b5e20',          // text verde închis
        marginLeft: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Elev
      </span>
    );
  };

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
        <Link to="/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors">
  <ShoppingBag size={20} className="text-amber-400" />
  <span>Marketplace</span>
</Link>
        {currentUser?.role === 'teacher' && (
          <li><Link to="/trimite-lectie" onClick={() => setIsOpen(false)}>Trimite Lecție</Link></li>
        )}
        {/*  OPTIONAL: Ascundem Arena dacă e profesor, ca să nu încurce */}
        {currentUser?.role !== 'teacher' && (
          <li><Link to="/arena" onClick={() => setIsOpen(false)}>Arena</Link></li>
          
        )}
        
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
            {/* Adăugat display: flex și alignItems ca să stea badge-ul perfect pe mijloc la aliniere */}
            <div className="nav-user-badge" onClick={() => setIsSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="user-icon-mini"><UserRound size={16} color="#8f4ebb" strokeWidth={2.5} /></span> 
              <span className="user-name-text">
                {currentUser.nume || currentUser.email.split('@')[0]}
              </span>
              {/*  AICI injectăm badge-ul custom de rol */}
              {getRoleBadge()}
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