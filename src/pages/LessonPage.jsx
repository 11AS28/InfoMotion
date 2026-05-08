import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsData } from '../lessonsData';
import { useAuth } from '../context/AuthContext'; 
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';

// Importă componentele tale de animație
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';
import DivideAnim from '../components/animatii/DivideAnim';
import GreedyAnim from '../components/animatii/greedyAnim';

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser, verificaDacaEGata } = useAuth();
  const [esteGata, setEsteGata] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  
  const lectie = lessonsData.find(l => l.id === idLectie);

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

  const renderAnimation = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim": return <BubbleSortAnim />;
      case "CautareBinaraAnim": return <CautareBinaraAnim />;
      case "DivideAnim": return <DivideAnim />;
      case "GreedyAnim": return <GreedyAnim />;
      default: return <div className="animation-placeholder">Animația va fi disponibilă curând.</div>;
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

        <section className="lesson-code">
          <h2>💻 Cod C++</h2>
          <pre><code>{lectie.codCPlusPlus}</code></pre>
        </section>

        {/* 1. REPARARE PBINFO: Secțiunea pentru problemele de pe Pbinfo */}
        <section className="lesson-problems">
          <h2>📝 Probleme Pbinfo recomandate</h2>
          <div className="problems-grid">
            {lectie.problemePbinfo && lectie.problemePbinfo.length > 0 ? (
              lectie.problemePbinfo.map((prob, index) => (
                <a key={index} href={prob.url} target="_blank" rel="noopener noreferrer" className="problem-card">
                  <span className="prob-id">{prob.idProblema}</span>
                  <span className="prob-title">{prob.titluProblema}</span>
                </a>
              ))
            ) : (
              <p>Nu sunt probleme Pbinfo asociate acestei lecții.</p>
            )}
          </div>
        </section>

        {/* 2 & 3. REPARARE QUIZ & FINALIZEAZĂ: Logica pentru Modal */}
        <section className="lesson-finish-action">
          {esteGata ? (
            <div className="lesson-completed-msg">
              <span className="check-icon">✔</span> Lecție finalizată! Ai stăpânit acest concept.
            </div>
          ) : (
            <div className="finish-container">
              <p>Ești gata să testezi ce ai învățat?</p>
              <button 
                className="finish-btn" 
                onClick={() => setIsQuizOpen(true)}
              >
                Finalizează Lecția (Quiz + Codeforces)
              </button>
            </div>
          )}
        </section>

        {/* Modalul care se deschide la click pe buton */}
        <QuizModal 
          isOpen={isQuizOpen} 
          onClose={() => setIsQuizOpen(false)} 
          lectie={lectie} 
          onSucces={() => {
            setIsQuizOpen(false);
            setEsteGata(true);
          }}
        />
      </main>
    </div>
  );
}

export default LessonPage;