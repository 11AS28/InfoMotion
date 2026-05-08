import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsData } from '../lessonsData';
import { useAuth } from '../context/AuthContext'; 
import '../pages_css/lessons.css';

// Importă componentele tale de animație aici (păstrează-le pe ale tale)
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';
import DivideAnim from '../components/animatii/DivideAnim';
import GreedyAnim from '../components/animatii/greedyAnim';

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser, marcheazaLectieTerminata, verificaDacaEGata } = useAuth();
  const [esteGata, setEsteGata] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const lectie = lessonsData.find(l => l.id === idLectie);

  // Verificăm dacă lecția e terminată la încărcare
  useEffect(() => {
    async function checkProgres() {
      if (currentUser && idLectie) {
        const status = await verificaDacaEGata(idLectie);
        setEsteGata(status);
      }
    }
    checkProgres();
  }, [idLectie, currentUser, verificaDacaEGata]);

  if (!lectie) return <div className="page-wrapper"><h2>Lecție negăsită.</h2></div>;

  const handleFinish = async () => {
    if (!currentUser) {
      alert("Loghează-te pentru a salva progresul!");
      return;
    }
    setLoading(true);
    await marcheazaLectieTerminata(idLectie);
    setEsteGata(true);
    setLoading(false);
  };

  const renderAnimation = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim": return <BubbleSortAnim />;
      case "CautareBinaraAnim": return <CautareBinaraAnim />;
      case "DivideAnim": return <DivideAnim />;
      case "GreedyAnim": return <GreedyAnim />;
      default: return <div className="animation-placeholder">Fără animație momentan.</div>;
    }
  };

  return (
    <div className="page-wrapper">
      <main className="lesson-container">
        <Link to="/lectii" className="back-link">← Înapoi la Module</Link>
        
        <header className="lesson-header">
          <div className="lesson-badge">{lectie.clasa.toUpperCase()}</div>
          <h1>{lectie.titlu}</h1>
        </header>

        <section className="lesson-content">
          <div className="lesson-theory">
            <h2>📖 Teorie</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{lectie.teorie}</p>
          </div>
          
          <div className="lesson-animation">
            <h2>🎮 Animație Interactivă</h2>
            {renderAnimation()}
          </div>
        </section>

        <section className="lesson-finish-action">
          {esteGata ? (
            <div className="lesson-completed-msg">
              <span className="check-icon">✔</span> Lecție finalizată!
            </div>
          ) : (
            <button 
              className="btn-finish-lesson" 
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? "Se salvează..." : "Am înțeles lecția! 🎯"}
            </button>
          )}
        </section>

        <section className="lesson-code">
          <h2>💻 Cod C++</h2>
          <pre><code>{lectie.codCPlusPlus}</code></pre>
        </section>
      </main>
    </div>
  );
}

export default LessonPage;