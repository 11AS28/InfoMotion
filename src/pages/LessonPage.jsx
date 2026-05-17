import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';

// Importă Firebase
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Importă componentele de animație
import BubbleSortAnim from '../components/animatii/BubbleSortAnim';
import CautareBinaraAnim from '../components/animatii/CautareBinaraAnim';
import DivideAnim from '../components/animatii/DivideAnim';
import GreedyAnim from '../components/animatii/greedyAnim';
import InterclasareAnim from '../components/animatii/InterclasareAnim';
import AflareMaximAnim from '../components/animatii/AflareMaximAnim';
import VariabileAnim from '../components/animatii/VariabileAnim';
import SirurideCaractere from '../components/animatii/SirurideCaractere';
import Prim from '../components/animatii/Prim';
import DescomPrim from '../components/animatii/DescomPrim';
import CifreNr from '../components/animatii/CifreNr';
import Siruri from '../components/animatii/Siruri';


function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser } = useAuth();

  const [lectie, setLectie] = useState(null);
  const [toateLectiileDinClasa, setToateLectiileDinClasa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esteGata, setEsteGata] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    async function incarcaDatePagina() {
      setLoading(true);
      setEsteGata(false);

      try {
        // 1. Luăm datele lecției din Firestore
        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dateLectie = docSnap.data();
          setLectie(dateLectie);

          // 2. Aducem toate lecțiile din aceeași clasă (pentru sidebar)
          if (dateLectie.clasa) {
            const q = query(
              collection(db, "lectii"),
              where("clasa", "==", dateLectie.clasa)
            );
            const querySnapshot = await getDocs(q);
            const lista = [];
            querySnapshot.forEach((d) => {
              lista.push({ id: d.id, ...d.data() });
            });
            setToateLectiileDinClasa(lista);
          }

          // 3. Verificăm progresul utilizatorului
          if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              const terminate = userData.lectiiTerminate || [];
              const gasit = terminate.some(id => String(id) === String(idLectie));
              setEsteGata(gasit);
            }
          }
        } else {
          console.error("Lecția nu a fost găsită!");
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      } finally {
        setLoading(false);
      }
    }

    incarcaDatePagina();
  }, [idLectie, currentUser]);

  if (loading) return <div className="page-wrapper"><div className="loader">Se încarcă teoria...</div></div>;
  if (!lectie) return <div className="page-wrapper"><h2>Lecție negăsită în baza de date.</h2></div>;

  const renderAnimation = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim": return <BubbleSortAnim />;
      case "CautareBinaraAnim": return <CautareBinaraAnim />;
      case "DivideAnim": return <DivideAnim />;
      case "GreedyAnim": return <GreedyAnim />;
      case "InterclasareAnim": return <InterclasareAnim />;
      case "AflareMaximAnim": return <AflareMaximAnim />;
      case "VariabileAnim": return <VariabileAnim />;
      case "SirurideCaractere": return <SirurideCaractere/>
      case "Prim": return <Prim/>
      case "DescomPrim": return <DescomPrim/>
      case "CifreNr": return <CifreNr/>
      case "Siruri": return <Siruri/>
      default: return <div className="animation-placeholder">Animația va fi disponibilă curând.</div>;
    }
  };

  return (
    <div className="page-wrapper">
      <br />
      <div className="lesson-main-content-flex">


        <aside className="lessons-sidebar">
          <div className="sidebar-header">
            <h3>Lecții {lectie.clasa?.toUpperCase()}</h3>
          </div>
          <nav className="sidebar-nav">
            {toateLectiileDinClasa.map((item) => (
              <Link
                key={item.id}
                to={`/lectie/${item.id}`}
                className={`sidebar-item ${item.id === idLectie ? 'active' : ''}`}
              >
                {item.titlu}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lesson-container">
          {/* Aici rămâne restul codului tău: Link înapoi, titlu, teorie, etc. */}
          <Link to="/lectii" className="back-link">← Înapoi la Module</Link>
          <header className="lesson-header">
            <div className="lesson-badge">{lectie.clasa?.toUpperCase()}</div>
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
                    <span className="prob-id">{prob.idProblema || prob.id}</span>
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
              <div className="lesson-completed-success-msg">
                <span className="check-icon">✔</span> <br />Lecție finalizată! Ai stăpânit acest concept.
              </div>
            ) : (
              <div className="finish-container">
                <p>Ești gata să testezi ce ai învățat?</p>
                <button className="finish-btn" onClick={() => setIsQuizOpen(true)}>
                  Finalizează Lecția (Quiz + Codeforces)
                </button>
              </div>
            )}
          </section>

          {isQuizOpen && (
            <QuizModal
              lessonId={idLectie}
              quizData={lectie.quiz}
              cfData={lectie.codeforces}
              onClose={() => setIsQuizOpen(false)}
              onFinished={() => {
                setIsQuizOpen(false);
                setEsteGata(true);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default LessonPage;