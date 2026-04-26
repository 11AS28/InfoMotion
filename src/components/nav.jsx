import '../components_css/nav.css';
import { useState } from 'react';
// 1. IMPORTĂM COMPONENTA Link DIN REACT-ROUTER-DOM
import { Link } from 'react-router-dom';

function Nav() {
  // Aici ținem minte dacă meniul e deschis pe telefon
  const [isOpen, setIsOpen] = useState(false);

  // Funcția care deschide/închide meniul când apeși pe iconiță
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      {/* Grupează logo-ul și hamburger-ul într-un div */}
      <div className="nav-header">
        <div className="nav-logo">
          {/* Folosim Link și aici pentru a duce utilizatorul rapid pe Acasă */}
          <Link to="/">InfoMotion<span>.</span></Link>
        </div>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Linkurile rămân jos, în afara div-ului nav-header */}
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        {/* 2. ÎNLOCUIM TOATE ETICHETELE <a> CU <Link> */}
        <li><Link to="/">Acasă</Link></li>
        <li><Link to="/despre">Despre</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li className="nav-cta">
          {/* Butonul de call to action din meniu - duce către pagina despre */}
          <Link to="/lectii" className="btn-accent">Începe să înveți</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;