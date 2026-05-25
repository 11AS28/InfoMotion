import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';

const BubbleSortAnim = React.lazy(() => import('../components/animatii/BubbleSortAnim'));
const CautareBinaraAnim = React.lazy(() => import('../components/animatii/CautareBinaraAnim'));
const DivideAnim = React.lazy(() => import('../components/animatii/DivideAnim'));
const GreedyAnim = React.lazy(() => import('../components/animatii/greedyAnim'));
const InterclasareAnim = React.lazy(() => import('../components/animatii/InterclasareAnim'));
const AflareMaximAnim = React.lazy(() => import('../components/animatii/AflareMaximAnim'));
const VariabileAnim = React.lazy(() => import('../components/animatii/VariabileAnim'));
const SirurideCaractere = React.lazy(() => import('../components/animatii/SirurideCaractere'));
const Prim = React.lazy(() => import('../components/animatii/Prim'));
const DescomPrim = React.lazy(() => import('../components/animatii/DescomPrim'));
const CifreNr = React.lazy(() => import('../components/animatii/CifreNr'));
const Siruri = React.lazy(() => import('../components/animatii/Siruri'));
const SumePartiale1D = React.lazy(() => import('../components/animatii/SumePartiale1D'));
const SumePartiale2D = React.lazy(() => import('../components/animatii/SumePartiale2D'));
const SmenulMars = React.lazy(() => import('../components/animatii/SmenulMars'));
const SlindingWindow = React.lazy(() => import('../components/animatii/SlindingWindow'));
const MergeSort = React.lazy(() => import('../components/animatii/MergeSort'));
const QuickSort = React.lazy(() => import('../components/animatii/QuickSort'));
const StivaMonotona = React.lazy(() => import('../components/animatii/StivaMonotona'));
const StructuriNeomogene = React.lazy(() => import('../components/animatii/StructuriNeomogeneAnim'));
const Matrici = React.lazy(() => import('../components/animatii/MatriciAnim'));
const OperatoriAnim = React.lazy(() => import('../components/animatii/OperatoriAnim'));
const CombinatoricaAnim = React.lazy(() => import('../components/animatii/CombinatoricaAnim'));



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

        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dateLectie = docSnap.data();
          setLectie(dateLectie);


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

  const ComponentaAnimatie = () => {
    switch (lectie.animatie) {
      case "BubbleSortAnim": return <BubbleSortAnim />;
      case "CautareBinaraAnim": return <CautareBinaraAnim />;
      case "DivideAnim": return <DivideAnim />;
      case "GreedyAnim": return <GreedyAnim />;
      case "InterclasareAnim": return <InterclasareAnim />;
      case "AflareMaximAnim": return <AflareMaximAnim />;
      case "VariabileAnim": return <VariabileAnim />;
      case "SirurideCaractere": return <SirurideCaractere />;
      case "Prim": return <Prim />;
      case "DescomPrim": return <DescomPrim />;
      case "CifreNr": return <CifreNr />;
      case "Siruri": return <Siruri />;
      case "SumePartiale1D": return <SumePartiale1D />;
      case "SumePartiale2D": return <SumePartiale2D />;
      case "SmenulMars": return <SmenulMars />;
      case "SlindingWindow": return <SlindingWindow />;
      case "MergeSort": return <MergeSort />;
      case "QuickSort": return <QuickSort />;
      case "StivaMonotona": return <StivaMonotona />;
      case "StructuriNeomogene": return <StructuriNeomogene />;
      case "Matrici": return <Matrici />;
      case "OperatoriAnim": return <OperatoriAnim />;
      case "CombinatoricaAnim": return <CombinatoricaAnim />;
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

          <Link to="/lectii" className="back-link">← Înapoi la Module</Link>
          <header className="lesson-header">
            <div className="lesson-badge">{lectie.clasa?.toUpperCase()}</div>
            <h1>{lectie.titlu}</h1>
          </header>

          <section className="lesson-content">
            <div className="lesson-theory">
              <h2>📖 Teorie</h2>
              <div className="lesson-theory-content">
                <Markdown>{lectie.teorie}</Markdown>
              </div>
            </div>

            <div className="lesson-animation">
              <h2>🎮 Animație Interactivă</h2>

              <Suspense fallback={<div className="loader">Se încarcă animația...</div>}>
                {lectie.animatie ? <ComponentaAnimatie /> : <div className="animation-placeholder">Animația va fi disponibilă curând.</div>}
              </Suspense>
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
                  Finalizează Lecția (Quiz)
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
