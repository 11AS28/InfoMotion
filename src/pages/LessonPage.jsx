import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/lessons.css';
import QuizModal from '../components/QuizModal';
import ArrayVisualizer from '../components/ArrayVisualizer'; // Playerul cel nou
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';

// Păstrăm importurile lazy pentru animațiile vechi din frontend
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

  // State-uri pentru animațiile din backend
  const [customInput, setCustomInput] = useState("");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [loadingAnim, setLoadingAnim] = useState(false);

  useEffect(() => {
    async function incarcaDatePagina() {
      setLoading(true);
      setEsteGata(false);
      setAnimationSteps([]); // Resetăm pașii vechi la schimbarea lecției
      setCustomInput("");

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

  // Funcția care cere simularea de la backend
  const handleGenerateAnimation = async () => {
    if (!customInput) return alert("Te rog introdu niște numere separate prin virgulă!");

    setLoadingAnim(true);
    try {
      // Verificăm dacă suntem pe o lecție de șiruri de caractere
      const esteLectieSiruri = lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic";

      let parsedData;

      if (esteLectieSiruri) {
        // Dacă e șir, utilizatorul scrie normal (ex: "info") sau cu virgulă (ex: "i,n,f,o")
        // Eliminăm virgulele dacă a pus, apoi transformăm fiecare literă în codul ei ASCII numeric
        const textCurat = customInput.replace(/,/g, '').trim();
        parsedData = textCurat.split('').map(litera => litera.charCodeAt(0));
      } else {
        // Rămâne logica ta veche, neatinsă, pentru restul lecțiilor (sortări etc.)
        parsedData = customInput
          .split(',')
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
      }

      if (parsedData.length === 0) {
        return alert(esteLectieSiruri ? "Te rog introdu un cuvânt valid!" : "Formatul numerelor este invalid! Folosește cifre separate prin virgulă.");
      }

      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithmType: lectie.animatie,
          inputData: parsedData
        })
      });

      const data = await response.json();

    if (data.steps) {
  console.log("=== PAȘI PRIMIȚI DE LA BACKEND ===", data.steps);
  
  const esteLectieSiruri = lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic";

  let pasiCuratatiPentruVisualizer;

  if (esteLectieSiruri) {
    const textCurat = customInput.replace(/,/g, '').trim();
    const asciiArrayComplet = textCurat.split('').map(l => l.charCodeAt(0));
    asciiArrayComplet.push(0); // '\0' la final

    // Mapăm fiecare pas primit din backend la structura internă cerută de ArrayVisualizer
    pasiCuratatiPentruVisualizer = data.steps.map((pas) => {
      return {
        // Trimitem vectorul de caractere sub formă de coduri ASCII
        array: asciiArrayComplet, 
        // Indexul curent trimis de C++ îl punem în array-ul de highlights pentru ca playerul să poată schimba culoarea barei parcurse
        highlights: pas.currentIndex !== undefined ? [pas.currentIndex] : [],
        // Explicația generată din backend text
        explanation: pas.explanation || "",
        // Statusul pasului (active / final)
        status: pas.status || "active"
      };
    });
  } else {
    // Logica ta veche pentru sortări
    pasiCuratatiPentruVisualizer = data.steps;
  }

  console.log("=== PAȘI CURĂȚAȚI PENTRU VISUALIZER ===", pasiCuratatiPentruVisualizer);
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

  // Lista algoritmilor mutați DEJA în backend. 
  // Când adaugi un algoritm nou în Node.js (ex: 'selectionSort'), doar îl pui în lista asta!
  const algoritmiBackend = ["bubbleSort", "BubbleSortAnim", "palindrom_dinamic", "strlen_dinamic", "strcpy_dinamic"];

  // Verificăm dacă animația curentă trebuie luată din backend sau e din cele vechi hardcodate
  const esteAnimatieNoua = algoritmiBackend.includes(lectie.animatie);

  // Switch-ul vechi pentru componentele hardcodate din frontend
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
                {lectie.animatie ? (
                  esteAnimatieNoua ? (
                    /* ---------------- COD NOU VIRTUAL/DINAMIC ---------------- */
                    <>
                      <div className="input-control-zone">
                        <label className="input-zone-label">
                          {lectie.animatie === "strlen_dinamic" || lectie.animatie === "strcpy_dinamic"
                            ? "🚀 INTRODU CUVÂNTUL TĂU DE TEST:"
                            : "🚀 INTRODU DATELE TALE DE TEST (NUMERE SEPARATE PRIN VIRGULĂ):"}
                        </label>

                        <div className="input-action-flex">
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
                          />
                          <button
                            className="generate-anim-btn"
                            onClick={handleGenerateAnimation}
                            disabled={loadingAnim}
                          >
                            {loadingAnim ? "Se calculează..." : "Generează Animație"}
                          </button>
                        </div>
                      </div>

                      {animationSteps.length > 0 ? (
                        <ArrayVisualizer steps={animationSteps} />
                      ) : (
                        <div className="animation-placeholder">
                          💡 Introdu datele de test mai sus și apasă pe buton pentru a porni simularea dinamică.
                        </div>
                      )}
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