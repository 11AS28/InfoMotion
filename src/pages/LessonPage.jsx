import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsData } from '../lessonsData';
import { useAuth } from '../context/AuthContext'; // Importăm Auth
import { completeazaLectie, verificaProgres } from '../services/progresService'; // Importăm serviciul de progres
import '../pages_css/lessons.css';

// Importăm componentele de animație
import CodeSnippet from '../components/CodeSnippet';
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser } = useAuth(); // Luăm user-ul logat
  const [esteGata, setEsteGata] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const lectie = lessonsData.find(l => l.id === idLectie);

  // Verificăm dacă lecția este deja terminată când se încarcă pagina
  useEffect(() => {
    async function checkProgres() {
      if (currentUser && idLectie) {
        const status = await verificaProgres(currentUser.uid, idLectie);
        setEsteGata(status);
      }
    }
    checkProgres();
  }, [idLectie, currentUser]);

  if (!lectie) {
    return (
      <div className="page-wrapper">
        <main className="not-found-lesson">
          <h2>Lecția nu a fost găsită.</h2>
          <Link to="/lectii" className="back-btn">Înapoi la lecții</Link>
        </main>
      </div>
    );
  }

  const handleFinish = async () => {
    setLoading(true);
    await completeazaLectie(currentUser.uid, idLectie);
    setEsteGata(true);
    setLoading(false);
    // Opțional: un efect de confetti sau un mesaj de succes
  };

  const renderAnimation = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim":
        return <BubbleSortAnim />;
      case "CautareBinaraAnim":
        return <CautareBinaraAnim />;
      default:
        return (
          <div className="animation-placeholder">
             Această lecție nu conține o animație interactivă momentan.
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper">
      <main className="lesson-container">
        <Link to="/lectii" className="back-link">← Înapoi la Module</Link>
        
        <header className="lesson-header">
          <div className="lesson-badge">{lectie.clasa.toUpperCase().replace('-', ' ')}</div>
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

        {/* ZONA DE FINALIZARE LECȚIE */}
        <section className="lesson-finish-action">
          {esteGata ? (
            <div className="lesson-completed-msg">
              <span className="check-icon">✔</span> Ai finalizat această lecție!
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
          <pre>
            <code>{lectie.codCPlusPlus}</code>
          </pre>
        </section>

        {lectie.problemePbinfo && lectie.problemePbinfo.length > 0 && (
          <section className="lesson-practice">
            <h2>🏋️‍♂️ Exersează pe PbInfo</h2>
            <p>Recomandăm următoarele probleme pentru practică:</p>
            <div className="pbinfo-links">
              {lectie.problemePbinfo.map((problema, index) => (
                <a key={index} href={problema.url} target="_blank" rel="noopener noreferrer" className="pbinfo-card">
                  <span className="pbinfo-id">{problema.idProblema}</span>
                  <span className="pbinfo-title">{problema.titluProblema}</span>
                  <span className="pbinfo-arrow">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default LessonPage;