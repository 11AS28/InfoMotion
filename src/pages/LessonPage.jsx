import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsData } from '../lessonsData';
import Nav from '../components/nav';
import Footer from '../components/footer';
// 1. Corectat importul CSS-ului pentru această pagină
import '../pages_css/lessons.css';


// Importăm componentele de animație
import CodeSnippet from '../components/CodeSnippet';
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';

function LessonPage() {
  const { idLectie } = useParams();
  
  const lectie = lessonsData.find(l => l.id === idLectie);

  if (!lectie) {
    return (
      <div className="page-wrapper">
        <Nav />
        <main className="not-found-lesson">
          <h2>Lecția nu a fost găsită.</h2>
          <Link to="/lectii" className="back-btn">Înapoi la lecții</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Funcție care decide ce componentă de animație să încarce
  const renderAnimation = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim":
        return <BubbleSortAnim />;
      case "CautareBinaraAnim":
        return <CautareBinaraAnim />;
      // Aici poți adăuga case-uri pentru viitoarele tale animații
      // case "InsertionSortAnim": return <InsertionSortAnim />;
      default:
        // Dacă lecția nu are o animație setată (e.g. lectie.animatie === null)
        return (
          <div className="animation-placeholder">
             Această lecție nu conține o animație interactivă momentan.
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper">
      <Nav />
      <main className="lesson-container">
        <Link to="/lectii" className="back-link">← Înapoi la Module</Link>
        
        <header className="lesson-header">
          <div className="lesson-badge">{lectie.clasa.toUpperCase().replace('-', ' ')}</div>
          <h1>{lectie.titlu}</h1>
        </header>

        <section className="lesson-content">
          <div className="lesson-theory">
            <h2>📖 Teorie</h2>
            {/* Folosim CSS white-space: pre-wrap dacă vrem să păstrăm aliniatele din JSON */}
            <p style={{ whiteSpace: "pre-wrap" }}>{lectie.teorie}</p>
          </div>
          
          <div className="lesson-animation">
            <h2>🎮 Animație Interactivă</h2>
            {/* 3. Aici apelăm funcția care randează animația corectă */}
            {renderAnimation()}
          </div>
        </section>

        <section className="lesson-code">
          <h2>💻 Cod C++</h2>
          <pre>
            <code>{lectie.codCPlusPlus}</code>
          </pre>
        </section>

        {/* =========================================
            SECȚIUNEA EXERSEAZĂ PE PBINFO
            ========================================= */}
        {lectie.problemePbinfo && lectie.problemePbinfo.length > 0 && (
          <section className="lesson-practice">
            <h2>🏋️‍♂️ Exersează pe PbInfo</h2>
            <p>Pentru a stăpâni acest concept, îți recomandăm să rezolvi următoarele probleme:</p>
            
            <div className="pbinfo-links">
              {lectie.problemePbinfo.map((problema, index) => (
                <a 
                  key={index} 
                  href={problema.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pbinfo-card"
                >
                  <span className="pbinfo-id">{problema.idProblema}</span>
                  <span className="pbinfo-title">{problema.titluProblema}</span>
                  <span className="pbinfo-arrow">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default LessonPage;