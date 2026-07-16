import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';
import ArrayVisualizer from '../components/ArrayVisualizer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpenText, Gamepad2, Code, NotebookPen, Check, Copy, Star } from 'lucide-react';
import TreeVisualizer from '../components/TreeVisualizer';
import GraphVisualizer from '../components/GraphVisualizer';
import parse from 'html-react-parser';
import WikiPreviewLink from '../components/WikiPreviewLink';
import usePageTitle from '../hooks/usePageTitle';
import DOMPurify from 'dompurify';

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
const CstringSearchAnim = React.lazy(() => import('../components/animatii/CstringSearchAnim'));
const StrtokAnim = React.lazy(() => import('../components/animatii/StrtokAnim'));
const CStringCompareReverseAnim = React.lazy(() => import('../components/animatii/CStringCompareReverseAnim'));

function LessonPage() {
  const { idLectie } = useParams();
  const { currentUser, esteLectieSalvata, toggleBookmarkLectie } = useAuth();

  const [lectie, setLectie] = useState(null);
  const [toateLectiileDinClasa, setToateLectiileDinClasa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esteGata, setEsteGata] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [customInput, setCustomInput] = useState("");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [loadingAnim, setLoadingAnim] = useState(false);
  const [animError, setAnimError] = useState(null); //

  usePageTitle(lectie ? `InfoMotion - ${lectie.titlu}` : 'InfoMotion - Lecție');

  const algoritmiBackend = [
    "bubbleSort",
    "BubbleSortAnim",
    "strlen_dinamic",
    "strcpy_dinamic",
    "quick_sort_dinamic",
    "cautare_binara_div_imp",
    "SelectieSort",
    "InterschimbareSort",
    "InserctieSort",
    "fibonacci_recursiv",
    "bfs_dinamic",
    "simulare_introducere"
  ];

  const algoritmiGraf = ["bfs_dinamic", "simulare_introducere"];
  const algoritmiArbore = ["cautare_binara_div_imp", "fibonacci_recursiv"];

  const handleCopyCode = async () => {
    if (!lectie?.codCPlusPlus) return;
    try {
      await navigator.clipboard.writeText(lectie.codCPlusPlus);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Eroare la copierea codului: ", err);
    }
  };

  const handleToggleBookmark = () => {
    if (!currentUser) {
      alert("Trebuie să fii logat ca să salvezi lecții!");
      return;
    }
    toggleBookmarkLectie(idLectie);
  };

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
        setAnimError(null);
      }

      try {
        const VERSIUNE_CURENTA = "v2_simulari_noi";
        const cacheVersiuneSalvata = localStorage.getItem('infoMotion_cache_version');

        if (cacheVersiuneSalvata !== VERSIUNE_CURENTA) {
          localStorage.removeItem('infoMotion_lectii');
          localStorage.setItem('infoMotion_cache_version', VERSIUNE_CURENTA);
        }

        const cachedLessonsRaw = localStorage.getItem('infoMotion_lectii');

        if (cachedLessonsRaw) {
          const toateLectiile = JSON.parse(cachedLessonsRaw);
          const lectieGasita = toateLectiile.find(l => l.id === idLectie);

          if (lectieGasita) {
            if (isMounted) setLectie(lectieGasita);
            const filtrateLocal = toateLectiile.filter(l => l.clasa === lectieGasita.clasa);
            if (isMounted) setToateLectiileDinClasa(filtrateLocal);
          } else {
            console.error("Lecția nu a fost găsită în cache-ul local!");
          }
        } else {
          const docRef = doc(db, "lectii", idLectie);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isMounted) setLectie(docSnap.data());
        }

        if (currentUser) {
          const terminate = currentUser.lectiiTerminate || [];
          const gasit = terminate.some(id => String(id) === String(idLectie));
          if (isMounted) setEsteGata(gasit);
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
    setAnimError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (lectie.animatie === "simulare_introducere") {
        const muchii = customInput
          .split(',')
          .map(bucata => bucata.trim().split('-').map(s => s.trim()))
          .filter(parti => parti.length === 2 && parti[0] && parti[1])
          .map(parti => ({ from: parti[0], to: parti[1] }));

        if (muchii.length === 0) {
          setLoadingAnim(false);
          return alert("Formatul muchiilor este invalid! Ex: 1-2, 2-3, 1-3");
        }

        const response = await fetch(`${baseUrl}/api/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            algorithm: 'simulare_introducere',
            edges: muchii
          })
        });

        if (!response.ok) {
          const textEroare = await response.text();
          setAnimError(textEroare || "A apărut o eroare la conexiunea cu serverul.");
          setLoadingAnim(false);
          return;
        }

        const data = await response.json();

        if (data.steps) {
          setAnimationSteps(data.steps);
        } else {
          setAnimError(data.error || "Eroare necunoscută trimisă de server.");
        }
        return;
      }

      if (lectie.animatie === "bfs_dinamic") {
        const muchii = customInput
          .split(',')
          .map(bucata => bucata.trim().split('-').map(s => s.trim()))
          .filter(parti => parti.length >= 2 && parti[0] && parti[1])
          .map(parti => ({
            from: parti[0],
            to: parti[1],
            weight: parti[2] !== undefined ? parseFloat(parti[2]) : undefined
          }));

        if (muchii.length === 0) {
          setLoadingAnim(false);
          return alert("Formatul muchiilor este invalid! Ex: 1-2 sau 1-2-5 (cu pondere)");
        }

        const startInput = document.getElementById("start-node-input");
        const startNode = startInput ? startInput.value.trim() : null;

        if (!startNode) {
          setLoadingAnim(false);
          return alert("Te rog introdu nodul de start!");
        }

        const directedInput = document.getElementById("directed-graph-checkbox");
        const directionat = directedInput ? directedInput.checked : false;

        const response = await fetch(`${baseUrl}/api/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            algorithm: 'bfs_dinamic',
            edges: muchii,
            startNode: startNode,
            directed: directionat
          })
        });

        if (!response.ok) {
          const textEroare = await response.text();
          setAnimError(textEroare || "A apărut o eroare la conexiunea cu serverul.");
          setLoadingAnim(false);
          return;
        }

        const data = await response.json();

        if (data.steps) {
          setAnimationSteps(data.steps);
        } else {
          setAnimError(data.error || "Eroare necunoscută trimisă de server.");
        }
        return;
      }

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
        setLoadingAnim(false);
        return alert(esteLectieSiruri ? "Te rog introdu un cuvânt valid!" : "Formatul numerelor este invalid!");
      }

      let targetVal = null;
      if (lectie.animatie === "cautare_binara_div_imp") {
        const targetInput = document.getElementById("target-search-input");
        targetVal = targetInput ? parseInt(targetInput.value) : null;
        if (isNaN(targetVal)) {
          setLoadingAnim(false);
          return alert("Te rog introdu și numărul pe care vrei să îl căutăm!");
        }
      }

      const response = await fetch(`${baseUrl}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: lectie.animatie,
          array: parsedData,
          target: targetVal
        })
      });

      if (!response.ok) {
        const textEroare = await response.text();
        setAnimError(textEroare || "A apărut o eroare la conexiunea cu serverul.");
        setLoadingAnim(false);
        return;
      }

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
        setAnimError(data.error || "Eroare necunoscută trimisă de server.");
      }
    } catch (error) {
      console.error("Eroare conexiune backend:", error);
      setAnimError("Nu s-a putut contacta serverul din backend. Verifică dacă backend-ul este activ.");
    } finally {
      setLoadingAnim(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="loader">Se încarcă teoria...</div></div>;
  if (!lectie) return <div className="page-wrapper"><h2>Lecție negăsită în baza de date.</h2></div>;

  const esteAnimatieNoua = algoritmiBackend.includes(lectie.animatie);
  const esteConceptGeneral = lectie.clasa === 'concepte' || lectie.categorie === 'concepte';
  const esteAlgoritmGraf = algoritmiGraf.includes(lectie.animatie);
  const esteAlgoritmArbore = algoritmiArbore.includes(lectie.animatie);

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
      case "CstringSearchAnim": return <CstringSearchAnim />;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0 }}>{lectie.titlu}</h1>
              <button
                onClick={handleToggleBookmark}
                title={esteLectieSalvata(idLectie) ? "Elimină din bookmark-uri" : "Salvează pentru mai târziu"}
                style={{
                  background: 'rgba(31, 224, 249, 0.08)',
                  border: '1px solid rgba(31, 224, 249, 0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Star
                  size={24}
                  strokeWidth={2}
                  color="#1fe0f9"
                  fill={esteLectieSalvata(idLectie) ? "#1fe0f9" : "none"}
                />
              </button>
            </div>
            <p className="lesson-author">
              Lecție adăugată de <span className="lesson-author-name">{lectie.adaugatDe || "Echipa InfoMotion"}</span>
            </p>
          </header>

          <section className="lesson-content">
            <div className="lesson-theory">
              <h2><BookOpenText size={60} color="#1fe0f9" strokeWidth={0.75} /> Teorie</h2>
              <div className="lesson-theory-content">
                {parse(DOMPurify.sanitize(proceseazaTeorie(lectie.teorie)), {
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
                            : lectie.animatie === "simulare_introducere"
                              ? " INTRODU MUCHIILE GRAFULUI (EX: 1-2, 2-3, 1-3):"
                              : lectie.animatie === "bfs_dinamic"
                                ? " INTRODU MUCHIILE GRAFULUI (EX: 1-2, 2-3-5 CU PONDERE):"
                                : lectie.animatie === "fibonacci_recursiv"
                                  ? " INTRODU VALOAREA LUI N:"
                                  : " INTRODU DATELE TALE DE TEST (NUMERE SEPARATE PRIN VIRGULĂ):"}
                        </label>

                        <div className="input-action-flex" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            className="custom-array-input"
                            placeholder={
                              lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic"
                                ? "Ex: infomotion"
                                : lectie.animatie === "simulare_introducere"
                                  ? "Ex: 1-2, 2-3, 1-3"
                                  : lectie.animatie === "bfs_dinamic"
                                    ? "Ex: 1-2, 2-3-5, 1-3"
                                    : lectie.animatie === "fibonacci_recursiv"
                                      ? "Ex: 6"
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

                          {lectie.animatie === "bfs_dinamic" && (
                            <div style={{ width: '100%' }}>
                              <label className="input-zone-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#1fe0f9' }}>
                                CARE ESTE NODUL DE START?
                              </label>
                              <input
                                type="text"
                                id="start-node-input"
                                className="custom-array-input"
                                placeholder="Ex: 1"
                                style={{ width: '200px' }}
                                disabled={loadingAnim}
                              />
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: '#c7d0e0', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" id="directed-graph-checkbox" disabled={loadingAnim} />
                                Graf orientat (muchiile au un singur sens)
                              </label>
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

                      {animError && (
                        <div style={{
                          marginTop: '20px',
                          padding: '16px 20px',
                          background: '#1a1216',
                          border: '1px solid #3a2129',
                          borderLeft: '3px solid #e5484d',
                          borderRadius: '10px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            color: '#e5484d',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.02em'
                          }}>
                            Limită de simulări atinsă (15 minute)
                          </div>
                          <p style={{ margin: 0, color: '#c7cfdb', fontSize: '14px', lineHeight: '1.5' }}>
                            {animError}
                          </p>
                        </div>
                      )}

                      <div className="animation-render-zone" style={{ marginTop: '20px', width: '100%' }}>
                        {animationSteps && animationSteps.length > 0 ? (
                          esteAlgoritmGraf ? (
                            <GraphVisualizer steps={animationSteps} />
                          ) : esteAlgoritmArbore ? (
                            <TreeVisualizer steps={animationSteps} />
                          ) : (
                            <ArrayVisualizer steps={animationSteps} />
                          )
                        ) : (
                          !animError && (
                            <div className="animation-placeholder">
                              Introdu datele de test mai sus și apasă pe buton pentru a porni simularea dinamică.
                            </div>
                          )
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
            <section className="lesson-code" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2><Code size={60} color="#1fe0f9" strokeWidth={0.75} /> Cod C++</h2>

                <button
                  onClick={() => {
                    localStorage.setItem(`infomotion_code_${idLectie}`, lectie.codCPlusPlus);
                    window.open(`/compiler/${idLectie}`, '_blank');
                  }}
                  style={{
                    background: 'rgba(31, 224, 249, 0.1)',
                    color: '#1fe0f9',
                    border: '1px solid #1fe0f9',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 15px rgba(31, 224, 249, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1fe0f9';
                    e.currentTarget.style.color = '#121212';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(31, 224, 249, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(31, 224, 249, 0.1)';
                    e.currentTarget.style.color = '#1fe0f9';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(31, 224, 249, 0.1)';
                  }}
                >
                  Modifică și Rulează codul
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <button
                  onClick={handleCopyCode}
                  title="Copiază codul!"
                  className="copy-code-btn"
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    zIndex: 10,
                    color: copied ? '#00ffcc' : '#a0aec0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
                </button>

                <pre style={{ margin: 0 }}><code className="language-cpp">{lectie.codCPlusPlus}</code></pre>
              </div>
            </section>
          )}

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