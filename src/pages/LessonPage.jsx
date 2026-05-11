import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizSection from '../components/QuizSection';

// Importă Firebase
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Importă componentele tale de animație
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';
import DivideAnim from '../components/animatii/DivideAnim';
import GreedyAnim from '../components/animatii/greedyAnim';

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser, verificaDacaEGata } = useAuth();

  const [lectie, setLectie] = useState(null); // Datele vin acum din DB
  const [loading, setLoading] = useState(true);
  const [esteGata, setEsteGata] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 1. Încărcăm datele lecției din Firestore
  useEffect(() => {
    async function fetchLectie() {
      setLoading(true);
      try {
        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLectie(docSnap.data());
        } else {
          console.error("Lecția nu a fost găsită în Firebase!");
        }
      } catch (error) {
        console.error("Eroare la preluarea lecției:", error);
      }
      setLoading(false);
    }

    fetchLectie();
  }, [idLectie]);

  // 2. Verificăm progresul userului
  useEffect(() => {
    if (currentUser && idLectie) {
      // verificaDacaEGata întoarce true/false direct din currentUser.progres
      const status = verificaDacaEGata(idLectie);
      setEsteGata(status);
    }
  }, [idLectie, currentUser, verificaDacaEGata]);

  if (loading) return <div className="page-wrapper"><div className="loader">Se încarcă teoria...</div></div>;
  if (!lectie) return <div className="page-wrapper"><h2>Lecție negăsită în baza de date.</h2></div>;

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
          <div className="lesson-badge">{lectie.clasa?.toUpperCase()}</div>
          <h1>{lectie.titlu}</h1>
        </header>

        <section className="lesson-content">
          <div className="lesson-theory">
            <h2>📖 Teorie</h2>
            {/* Folosim whiteSpace: pre-wrap ca să păstrăm formatarea din Admin */}
            <p style={{ whiteSpace: "pre-wrap" }}>{lectie.teorie}</p>
          </div>

          <div className="lesson-animation">
            <h2>🎮 Animație Interactivă</h2>
            {renderAnimation()}
          </div>
        </section>

        {lectie.codCPlusPlus && (
          <section className="lesson-code">
            <h2>💻 Cod C++</h2>
            <pre><code>{lectie.codCPlusPlus}</code></pre>
          </section>
        )}

        <section className="lesson-problems">
          <h2>📝 Probleme Pbinfo recomandate</h2>
          <div className="problems-grid">
            {lectie.problemePbinfo && lectie.problemePbinfo.length > 0 ? (
              lectie.problemePbinfo.map((prob, index) => (
                <a key={index} href={prob.url} target="_blank" rel="noopener noreferrer" className="problem-card">
                  <span className="prob-id"> {prob.idProblema || prob.id}</span>
                  <span className="prob-title">{prob.titluProblema || prob.titlu}</span>
                </a>
              ))
            ) : (
              <p>Nu sunt probleme Pbinfo asociate acestei lecții.</p>
            )}
          </div>
        </section>

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
                onClick={() => {
                  console.log("Datele lecției sunt:", lectie);
                  setIsQuizOpen(true);
                }}
              >
                Finalizează Lecția (Quiz + Codeforces)
              </button>
            </div>
          )}
        </section>

        <QuizSection
          lessonId={lectie.id}
          quizData={lectie.quiz}
          cfData={lectie.codeforces}
        />
      </main>
    </div>
  );
}

export default LessonPage;