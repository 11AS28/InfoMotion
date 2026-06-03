import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';
import ArrayVisualizer from '../components/ArrayVisualizer'; 
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpenText, Gamepad2, Code, NotebookPen, Check } from 'lucide-react';
import TreeVisualizer from '../components/TreeVisualizer';
import parse from 'html-react-parser';
import WikiPreviewLink from '../components/WikiPreviewLink';

// Lazy loading components...
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
const CstringSearchAnim = React.lazy(() => import("../components/animatii/CstringSearchAnim"));
const StrtokAnim = React.lazy(() => import('../components/animatii/StrtokAnim'));
const CStringCompareReverseAnim = React.lazy(() => import('../components/animatii/CStringCompareReverseAnim'));

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser } = useAuth();

  const [lectie, setLectie] = useState(null);
  const [toateLectiileDinClasa, setToateLectiileDinClasa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esteGata, setEsteGata] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const [customInput, setCustomInput] = useState("");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [loadingAnim, setLoadingAnim] = useState(false);


  const algoritmiBackend = [
    "bubbleSort", 
    "BubbleSortAnim", 
    "strlen_dinamic", 
    "strcpy_dinamic",
    "quick_sort_dinamic",
    "cautare_binara_div_imp"
  ];
  
  const proceseazaTeorie = (html) => {
    if (!html) return '';
    return html.replace(
      /###\s*(.+?)(?=<|\n|$)/g,
      (match, text) => {
        const textCurat = text.trim().replace(/:$/, '');
        return `<span class="theory-highlight-box">${textCurat}:</span>`;
      }
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function incarcaDatePagina() {
      setLoading(true);
      if (isMounted) {
        setAnimationSteps([]); 
        setCustomInput("");
      }

      try {
        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dateLectie = docSnap.data();
          if (isMounted) setLectie(dateLectie);

          const cachedLessonsRaw = localStorage.getItem('infomotion_lessons_cache');
          let gasitInCache = false;

          if (cachedLessonsRaw) {
            const toateLectiile = JSON.parse(cachedLessonsRaw);
            const filtrateLocal = toateLectiile.filter(l => l.clasa === dateLectie.clasa);
            if (filtrateLocal.length > 0) {
              if (isMounted) setToateLectiileDinClasa(filtrateLocal);
              gasitInCache = true;
            }
          }

          if (!gasitInCache && dateLectie.clasa) {
            const q = query(collection(db, "lectii"), where("clasa", "==", dateLectie.clasa));
            const querySnapshot = await getDocs(q);
            const lista = [];
            querySnapshot.forEach((d) => {
              lista.push({ id: d.id, ...d.data() });
            });
            if (isMounted) setToateLectiileDinClasa(lista);
          }

          if (currentUser) {
            const terminate = currentUser.lectiiTerminate || [];
            const gasit = terminate.some(id => String(id) === String(idLectie));
            if (isMounted) setEsteGata(gasit);
          }
        } else {
          console.error("Lecția nu a fost găsită!");
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    incarcaDatePagina();
    return () => { isMounted = false; };
  }, [idLectie, currentUser]);

  const handleGenerateAnimation = async () => {
    if (!customInput) return alert("Te rog introdu datele de test!");

    setLoadingAnim(true);
    try {
      const esteLectieSiruri = lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic";
      let parsedData;

      if (esteLectieSiruri) {
        const textCurat = customInput.replace(/,/g, '').trim();
        parsedData = textCurat.split('').map(litera => litera.charCodeAt(0));
      } else {
        parsedData = customInput
          .split(',')
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
      }

      if (parsedData.length === 0) {
        return alert(esteLectieSiruri ? "Te rog introdu un cuvânt valid!" : "Formatul numerelor este invalid!");
      }

      let targetVal = null;
      if (lectie.animatie === "cautare_binara_div_imp") {
        const targetInput = document.getElementById("target-search-input");
        targetVal = targetInput ? parseInt(targetInput.value) : null;
        if (isNaN(targetVal)) return alert("Te rog introdu și numărul pe care vrei să îl căutăm!");
      }

      const response = await fetch('https://infomotion.onrender.com/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithmType: lectie.animatie,
          inputData: parsedData,
          target: targetVal 
        })
      });

      const data = await response.json();

      if (data.steps) {
        let pasiCuratatiPentruVisualizer;

        if (esteLectieSiruri) {
          const textCurat = customInput.replace(/,/g, '').trim();
          const asciiArrayComplet = textCurat.split('').map(l => l.charCodeAt(0));
          asciiArrayComplet.push(0); 

          pasiCuratatiPentruVisualizer = data.steps.map((pas) => ({
            array: asciiArrayComplet, 
            highlights: pas.currentIndex !== undefined ? [pas.currentIndex] : [],
            explanation: pas.explanation || "",
            status: pas.status || "active"
          }));
        } else {
          pasiCuratatiPentruVisualizer = data.steps;
        }

        setAnimationSteps(pasiCuratatiPentruVisualizer);
      } else {
        alert("Eroare trimisă de server: " + (data.error || "Necunoscută"));
      }
    } catch (error) {
      console.error("Eroare conexiune backend:", error);
      alert("Nu s-a putut contacta serverul din backend.");
    } finally {
      setLoadingAnim(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="loader">Se încarcă teoria...</div></div>;
  if (!lectie) return <div className="page-wrapper"><h2>Lecție negăsită în baza de date.</h2></div>;

  const esteAnimatieNoua = algoritmiBackend.includes(lectie.animatie);
  
  // Flag ca să știm dacă ascundem elementele specifice claselor de concurs
  const esteConceptGeneral = lectie.clasa === 'concepte' || lectie.categorie === 'concepte';

  const ComponentaAnimatieVeche = () => {
    switch (lectie.animatie) {
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
      case "CstringSearchAnim": return <CStringSearchAnim />;
      case "StrtokAnim": return <StrtokAnim />;
      case "CStringCompareReverseAnim": return <CStringCompareReverseAnim />;
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
              <h2><BookOpenText size={60} color="#1fe0f9" strokeWidth={0.75} /> Teorie</h2>
              <div className="lesson-theory-content">
                {parse(proceseazaTeorie(lectie.teorie), {
                  replace: (domNode) => {
                    if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
                      const href = domNode.attribs.href;
                      if (href.startsWith('/lectie/')) {
                        const idLectieTinta = href.split('/').pop();
                        const textLink = domNode.children[0]?.data || '';
                        return (
                          <WikiPreviewLink href={href} idLectieTinta={idLectieTinta}>
                            {textLink}
                          </WikiPreviewLink>
                        );
                      }
                    }
                  }
                })}
              </div>
            </div>

            <div className="lesson-animation">
              <h2><Gamepad2 size={60} color="#1fe0f9" strokeWidth={0.75} /> Animație Interactivă</h2>
              <Suspense fallback={<div className="loader">Se încarcă animația...</div>}>
                {lectie.animatie ? (
                  esteAnimatieNoua ? (
                    <>
                      <div className="input-control-zone">
                        <label className="input-zone-label">
                          {lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic"
                            ? " INTRODU CUVÂNTUL TĂU DE TEST:"
                            : " INTRODU DATELE TALE DE TEST (NUMERE SEPARATE PRIN VIRGULĂ):"}
                        </label>

                        <div className="input-action-flex" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            className="custom-array-input"
                            placeholder={
                              lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic"
                                ? "Ex: infomotion"
                                : "Ex: 14, 8, 32, 5, 21"
                            }
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            disabled={loadingAnim}
                            style={{ width: '100%' }}
                          />

                          {lectie.animatie === "cautare_binara_div_imp" && (
                            <div style={{ width: '100%' }}>
                              <label className="input-zone-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#1fe0f9' }}>
                                 CE NUMĂR VREI SĂ CĂUTĂM ÎN VECTOR?
                              </label>
                              <input
                                type="number"
                                id="target-search-input"
                                className="custom-array-input"
                                placeholder="Ex: 32"
                                style={{ width: '200px' }}
                                disabled={loadingAnim}
                              />
                            </div>
                          )}

                          <button
                            className="generate-anim-btn"
                            onClick={handleGenerateAnimation}
                            disabled={loadingAnim}
                            style={{ marginTop: '5px' }}
                          >
                            {loadingAnim ? "Se calculează..." : "Generează Animație"}
                          </button>
                        </div>
                      </div>

                      <div className="animation-render-zone" style={{ marginTop: '20px', width: '100%' }}>
                        {animationSteps && animationSteps.length > 0 ? (
                          lectie.animatie === "cautare_binara_div_imp" ? (
                            <TreeVisualizer steps={animationSteps} />
                          ) : (
                            <ArrayVisualizer steps={animationSteps} />
                          )
                        ) : (
                          <div className="animation-placeholder">
                            💡 Introdu datele de test mai sus și apasă pe buton pentru a porni simularea dinamică.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <ComponentaAnimatieVeche />
                  )
                ) : (
                  <div className="animation-placeholder">Animația va fi disponibilă curând.</div>
                )}
              </Suspense>
            </div>
          </section>

          {lectie.codCPlusPlus && (
            <section className="lesson-code">
              <h2><Code size={60} color="#1fe0f9" strokeWidth={0.75} /> Cod C++</h2>
              <pre><code>{lectie.codCPlusPlus}</code></pre>
            </section>
          )}

          {/*  REZOLVARE PROBLEME PBINFO: Randăm doar dacă NU este concept general */}
          {!esteConceptGeneral && (
            <section className="lesson-problems">
              <h2><NotebookPen size={40} color="#1fe0f9" strokeWidth={0.75} /> Probleme Pbinfo recomandate</h2>
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
          )}

          {/*  REZOLVARE QUIZ INTERACTIV: Randăm doar dacă NU este concept general */}
          {!esteConceptGeneral && (
            <section className="lesson-finish-action">
              {esteGata ? (
                <div className="lesson-completed-success-msg">
                  <span className="check-icon"><Check size={60} color="#030303" strokeWidth={2} /></span> <br />Lecție finalizată! Ai stăpânit acest concept.
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
          )}

          {isQuizOpen && !esteConceptGeneral && (
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