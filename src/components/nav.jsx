import '../components_css/nav.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; 

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth(); 

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="nav-header">
        <div className="nav-logo">
          <Link to="/">InfoMotion<span>.</span></Link>
        </div>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/">Acasă</Link></li>
        <li><Link to="/despre">Despre</Link></li>
        
        {/* Contactul a revenit la locul lui de cinste */}
        <li><Link to="/contact">Contact</Link></li>

        <li>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Schimbă tema"
          >
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </div>
          </button>
        </li>

        {/* Zona de User: Login sau Logout */}
        {currentUser ? (
          <li className="nav-user-info">
            <span className="user-email">{currentUser.email.split('@')[0]}</span>
            <button onClick={() => logout()} className="btn-logout">Ieșire</button>
          </li>
        ) : (
          <li><Link to="/auth" className="btn-login">Logare</Link></li>
        )}

        <li className="nav-cta">
          <Link to="/lectii" className="btn-accent">Începe să înveți</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;