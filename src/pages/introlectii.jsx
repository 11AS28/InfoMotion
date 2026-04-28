import React from 'react';
import Nav from '../components/nav';
import Footer from '../components/footer';
import '../pages_css/intro.css'; // Va trebui să creezi acest CSS scurt

function Intro() {
  return (
    <div className="page-wrapper">
     
      
      <main className="intro-container">
        {/* Partea de sus: Titlu și Misiune */}
        <section className="intro-hero">
          <h1>Despre <span>Proiect</span></h1>
          <p className="intro-subtitle">
            Transformăm informatica din text abstract într-o experiență vizuală.
          </p>
        </section>

        {/* Secțiunea 1: De ce această platformă? */}
        <section className="intro-section">
          <h2>🎯 Misiunea Noastră</h2>
          <p>
            Algoritmii pot fi dificil de înțeles doar citind cod C++ de pe tablă. 
            Scopul acestei platforme este de a ajuta elevii claselor IX-XI să vizualizeze 
            logic cum funcționează structurile de date și metodele de sortare, oferindu-le 
            animații interactive și explicații pas cu pas, completate de probleme de pe <strong>PbInfo</strong>.
          </p>
        </section>

        {/* Secțiunea 2: Funcționalități Cheie */}
        <section className="intro-section">
          <h2>✨ Ce oferă platforma?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎮</span>
              <h3>Animații Interactive</h3>
              <p>Vezi exact cum se mută elementele unui vector în memorie în timp real.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💻</span>
              <h3>Cod Explicat</h3>
              <p>Fragmente de cod C++ gata de copiat, cu comentarii logice la fiecare pas.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Viteză & Rutare</h3>
              <p>O aplicație de tip Single Page Application (SPA) unde lecțiile se încarcă instant.</p>
            </div>
          </div>
        </section>

        {/* Secțiunea 3: Tehnologii */}
        <section className="intro-section tech-section">
          <h2>🛠️ Tehnologii Folosite</h2>
          <div className="tech-tags">
            <span className="tech-tag">React.js</span>
            <span className="tech-tag">Vite</span>
            <span className="tech-tag">React Router</span>
            <span className="tech-tag">CSS Grid & Flexbox</span>
            <span className="tech-tag">JavaScript ES6+</span>
            <span className="tech-tag">Firebase</span>
          </div>
        </section>

      </main>

      
    </div>
  );
}

export default Intro;