import '../components_css/nav.css';
import { useState } from 'react';


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
      <a href="/">InfoMotion<span>.</span></a>
    </div>

    <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </div>
  </div>

  {/* Linkurile rămân jos, în afara div-ului nav-header */}
  <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
    <li><a href="/">Acasă</a></li>
    <li><a href="/lectii">Lecții interactive</a></li>
    <li><a href="/contact">Contact</a></li>
    <li className="nav-cta">
      <a href="/lectii/intro" className="btn-accent">Începe să înveți</a>
    </li>
  </ul>
</nav>
  );
}

export default Nav;