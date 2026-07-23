import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Editor, { loader } from '@monaco-editor/react';
import { Play, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { customThemes } from './shopItems';
import '../components_css/compiler.css';

const sanitizeThemeName = (name) => {
  if (!name) return 'vsdark';
  return name.replace(/[^a-zA-Z0-9]/g, '');
};

loader.init().then((monacoInstance) => {
  if (customThemes && typeof customThemes === 'object') {
    Object.keys(customThemes).forEach((themeKey) => {
      if (!themeKey || themeKey === 'vs' || themeKey === 'vs-dark' || themeKey === 'hc-black') {
        return;
      }
      try {
        if (customThemes[themeKey]) {
          const cleanKey = sanitizeThemeName(themeKey);
          monacoInstance.editor.defineTheme(cleanKey, customThemes[themeKey]);
        }
      } catch (e) {
        console.error(`Eroare la pre-încărcarea temei ${themeKey}:`, e);
      }
    });
  }
});

// Cod default afișat în editor când nu există (încă) cod salvat pentru un limbaj
const DEFAULT_CODE_BY_LANGUAGE = {
  cpp: "// Scrie codul tău C++ aici...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}",
  python: "# Scrie codul tău Python aici...\nprint(\"Hello, InfoMotion!\")\n"
};

// Numele limbajului folosit de Monaco Editor pentru syntax highlighting
const MONACO_LANGUAGE_BY_LANGUAGE = {
  cpp: 'cpp',
  python: 'python'
};

function CompilerPage() {
  const { idLectie } = useParams();
  const { currentUser } = useAuth();

  const [titluLectie, setTitluLectie] = useState("Workspace C++");
  const [language, setLanguage] = useState('cpp'); // 'cpp' | 'python' — limbajul curent selectat
  // Ținem codul separat pentru fiecare limbaj, ca la comutare între tab-uri să nu se piardă ce ai scris
  const [codeByLanguage, setCodeByLanguage] = useState({
    cpp: DEFAULT_CODE_BY_LANGUAGE.cpp,
    python: DEFAULT_CODE_BY_LANGUAGE.python
  });
  const [editorCode, setEditorCode] = useState("");
  const [compilerInput, setCompilerInput] = useState("");
  const [compilerOutput, setCompilerOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [executionMemory, setExecutionMemory] = useState(null);
  const [loadingCompiler, setLoadingCompiler] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  // Indică dacă lecția curentă chiar are un cod Python salvat în Firestore (câmpul codPython)
  // Momentan nicio lecție nu are acest câmp, deci va fi mereu false — arătăm un editor gol + un mesaj
  const [pythonCodeExistsInLesson, setPythonCodeExistsInLesson] = useState(true);

  const [aiCases, setAiCases] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [copiedAiKey, setCopiedAiKey] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leftWidth, setLeftWidth] = useState(window.innerWidth * 0.6);
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.45);
  const [editorHeightMobile, setEditorHeightMobile] = useState(window.innerHeight * 0.5);

  const [isResizingH, setIsResizingH] = useState(false);
  const [isResizingV, setIsResizingV] = useState(false);

  const containerRef = useRef(null);
  const sidePanelRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const esteInWorkspaceLectie = idLectie && idLectie !== "liber";

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      const savedTheme = localStorage.getItem('info-motion-theme') || 'light';
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
  }, []);

  const temaEchipataDb = currentUser?.temaEchipata || 'theme_default';

  const monacoThemeName = (customThemes && customThemes[temaEchipataDb])
    ? sanitizeThemeName(temaEchipataDb)
    : 'vs-dark';

  useEffect(() => {
    async function incarcaCodSursa() {
      if (!idLectie || idLectie === "liber") {
        setTitluLectie("Sandbox Liber");
        setLanguage('cpp');
        setPythonCodeExistsInLesson(true); // în sandbox liber nu afișăm bannerul de "lecție fără cod"
        setCodeByLanguage({
          cpp: DEFAULT_CODE_BY_LANGUAGE.cpp,
          python: DEFAULT_CODE_BY_LANGUAGE.python
        });
        setEditorCode(DEFAULT_CODE_BY_LANGUAGE.cpp);
        setLoadingPage(false);
        return;
      }

      try {
        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dataLectie = docSnap.data();

          const cppCode = dataLectie.codCPlusPlus || DEFAULT_CODE_BY_LANGUAGE.cpp;
          // codPython nu există încă în baza de date pentru nicio lecție — pregătit pentru viitor
          const pythonCodeReal = dataLectie.codPython;
          const pythonCode = pythonCodeReal || DEFAULT_CODE_BY_LANGUAGE.python;

          setTitluLectie(dataLectie.titlu);
          setPythonCodeExistsInLesson(!!pythonCodeReal);
          setCodeByLanguage({ cpp: cppCode, python: pythonCode });
          setLanguage('cpp');
          setEditorCode(cppCode);
        }
      } catch (err) {
        console.error("Eroare la încărcarea codului:", err);
        toast.error("Nu s-a putut încărca lecția.");
      } finally {
        setLoadingPage(false);
      }
    }
    incarcaCodSursa();
  }, [idLectie]);

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck);
      if (!mobileCheck) {
        setLeftWidth(window.innerWidth * 0.6);
        setTopHeight(window.innerHeight * 0.45);
      } else {
        setEditorHeightMobile(window.innerHeight * 0.5);
        setTopHeight(window.innerHeight * 0.22);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Schimbă limbajul activ — funcționează atât în Sandbox Liber cât și într-o lecție
  const handleLanguageChange = (newLang) => {
    if (newLang === language) return;

    setLanguage(newLang);
    setEditorCode(codeByLanguage[newLang]);
    setCompilerOutput("");
    setExecutionTime(null);
    setExecutionMemory(null);
    setAiCases(null);
    setIsAiPopoverOpen(false);
  };

  // Actualizează codul curent ȘI îl salvează pe limbajul activ, ca la comutare să nu se piardă
  const handleEditorChange = (val) => {
    const newCode = val || "";
    setEditorCode(newCode);
    setCodeByLanguage((prev) => ({ ...prev, [language]: newCode }));
  };

  // Funcție securizată pentru preluarea cazurilor din backend-ul AI
  const handleFetchAiCases = async () => {
    if (loadingAi) return; // Blochează execuția dacă se încarcă deja

    if (aiCases) {
      setIsAiPopoverOpen(!isAiPopoverOpen);
      return;
    }

    setLoadingAi(true);
    setIsAiPopoverOpen(true);
    try {
      const response = await fetch(`${baseUrl}/api/generate-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algoritm: titluLectie,
          tipModul: 'compiler'
        })
      });

      if (!response.ok) throw new Error("Eroare la comunicarea cu serverul AI");
      const data = await response.json();
      setAiCases(data);
    } catch (err) {
      console.error(err);
      toast.error("Nu s-au putut genera datele de test.");
      setIsAiPopoverOpen(false);
    } finally {
      setLoadingAi(false);
    }
  };

  // Funcție îmbunătățită: copiază în clipboard ȘI pune direct în STDIN text-ul
  const handleApplyAiValue = async (valoareString, cheieCaz) => {
    if (!valoareString) return;

    try {
      // Injectăm textul direct în textarea STDIN din pagină
      setCompilerInput(valoareString);

      // Opțional, îl copiem și în clipboard pentru siguranță
      await navigator.clipboard.writeText(valoareString);

      setCopiedAiKey(cheieCaz);
      toast.success("Datele AI au fost aplicate direct în STDIN!");
      setTimeout(() => setCopiedAiKey(null), 2000);
    } catch (err) {
      console.error("Eroare la aplicarea datelor:", err);
    }
  };

  useEffect(() => {
    const handleMoveMain = (clientX, clientY) => {
      if (!isResizingH) return;

      if (!isMobile) {
        let newWidth = clientX;
        if (newWidth < 150) newWidth = 0;
        if (newWidth > window.innerWidth - 100) newWidth = window.innerWidth;
        setLeftWidth(newWidth);
      } else {
        let newHeight = clientY - 55;
        const disponibil = window.innerHeight - 55;
        if (newHeight < 60) newHeight = 0;
        if (newHeight > disponibil - 60) newHeight = disponibil;
        setEditorHeightMobile(newHeight);
      }
    };

    const onMouseMove = (e) => handleMoveMain(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMoveMain(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleUpMain = () => setIsResizingH(false);

    if (isResizingH) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleUpMain);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', handleUpMain);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleUpMain);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUpMain);
    };
  }, [isResizingH, isMobile]);

  useEffect(() => {
    const handleMoveSecondary = (clientY) => {
      if (!isResizingV) return;
      if (!sidePanelRef.current) return;

      const panelRect = sidePanelRef.current.getBoundingClientRect();
      let newHeight = clientY - panelRect.top;

      if (newHeight < 40) newHeight = 0;
      if (newHeight > panelRect.height - 40) newHeight = panelRect.height;

      setTopHeight(newHeight);
    };

    const onMouseMove = (e) => handleMoveSecondary(e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMoveSecondary(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleUpSecondary = () => setIsResizingV(false);

    if (isResizingV) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleUpSecondary);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', handleUpSecondary);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleUpSecondary);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUpSecondary);
    };
  }, [isResizingV]);

  const handleRunCompilerCode = async () => {
    if (isMigrating) return;

    setLoadingCompiler(true);
    setCompilerOutput(
      language === 'python'
        ? "Se rulează codul Python pe serverul InfoMotion..."
        : "Se compilează și se rulează pe serverul InfoMotion..."
    );

    setExecutionTime(null);
    setExecutionMemory(null);

    try {
      const response = await fetch(`${baseUrl}/api/run-cpp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, input: compilerInput, language })
      });
      const data = await response.json();

      if (data.status === "Succes") {
        setCompilerOutput(data.output);
        setExecutionTime(data.time);
        setExecutionMemory(data.memory);
        toast.success("Rulare încheiată cu succes!");
      } else {
        setCompilerOutput(`${data.status}:\n${data.error}`);
        toast.error("Eroare în cod.");
      }
    } catch (err) {
      console.error(err);
      setCompilerOutput("Eroare: Conexiune eșuată cu backend-ul local (port 5000).");
      toast.error("Backend offline!");
    } finally {
      setLoadingCompiler(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="compiler-loading">
        Se încarcă mediul de dezvoltare InfoMotion...
      </div>
    );
  }

  const handleEditorDidMount = (editorInstance) => {
    setTimeout(() => {
      editorInstance.layout();
    }, 150);
  };

  const mainSplitStyle = isMobile
    ? { height: `${editorHeightMobile}px`, width: '100%' }
    : { width: `${leftWidth}px`, height: '100%' };

  const sidePanelStyle = isMobile
    ? { height: `calc(100vh - 55px - ${editorHeightMobile}px - 8px)`, width: '100%' }
    : { width: `calc(100vw - ${leftWidth}px - 8px)`, height: '100%' };

  const renderAiRow = (label, colorStyle, dataKey, valoareString) => {
    if (!valoareString) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: '#111115',
        borderRadius: '6px',
        border: '1px solid #27272a',
        gap: '8px'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: colorStyle, marginBottom: '2px' }}>{label}</div>
          <div style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#a1a1aa',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {valoareString}
          </div>
        </div>
        <button
          onClick={() => handleApplyAiValue(valoareString, dataKey)}
          style={{
            fontSize: '11px',
            background: '#27272a',
            border: 'none',
            color: copiedAiKey === dataKey ? '#00ffcc' : '#e4e4e7',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {copiedAiKey === dataKey ? 'Aplicat!' : 'Aplică'}
        </button>
      </div>
    );
  };

  // Afișăm bannerul doar când suntem într-o lecție, avem Python selectat, și lecția n-are încă un câmp codPython real
  const afiseazaBannerPythonLipsa = esteInWorkspaceLectie && language === 'python' && !pythonCodeExistsInLesson;

  return (
    <div className={`compiler-page-container ${isResizingH ? 'resizing-h-active' : ''} ${isResizingV ? 'resizing-v-active' : ''}`}>

      <div className="ide-header">
        <div className="header-dots-zone">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
          <h3 className="ide-title">
            InfoMotion IDE — {titluLectie}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <div style={{
            display: 'flex',
            background: '#111115',
            borderRadius: '6px',
            border: '1px solid #27272a',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => handleLanguageChange('cpp')}
              disabled={loadingCompiler}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: loadingCompiler ? 'not-allowed' : 'pointer',
                background: language === 'cpp' ? '#27272a' : 'transparent',
                color: language === 'cpp' ? '#1fe0f9' : '#71717a',
                transition: 'all 0.15s ease'
              }}
            >
              C++
            </button>
            <button
              onClick={() => handleLanguageChange('python')}
              disabled={loadingCompiler}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: loadingCompiler ? 'not-allowed' : 'pointer',
                background: language === 'python' ? '#27272a' : 'transparent',
                color: language === 'python' ? '#1fe0f9' : '#71717a',
                transition: 'all 0.15s ease'
              }}
            >
              Python
            </button>
          </div>

          <button
            onClick={handleRunCompilerCode}
            disabled={loadingCompiler || isMigrating}
            className="run-code-btn"
            style={isMigrating ? { opacity: 0.6, cursor: 'not-allowed', background: '#45475a' } : {}}
          >
            <Play size={14} fill="#fff" /> {loadingCompiler ? "..." : isMigrating ? "Mentenanță" : "Rulează"}
          </button>
        </div>
      </div>

      <div className="ide-main-body" ref={containerRef}>

        <div className="ide-editor-section" style={{ ...mainSplitStyle, display: 'flex', flexDirection: 'column' }}>

          {afiseazaBannerPythonLipsa && (
            <div style={{
              background: 'rgba(31, 224, 249, 0.08)',
              borderLeft: '3px solid #1fe0f9',
              padding: '8px 14px',
              fontSize: '12.5px',
              color: '#a1e8f7',
              fontFamily: 'sans-serif',
              lineHeight: '1.4',
              flexShrink: 0
            }}>
              Lecția asta încă nu are un exemplu de cod Python pregătit — dar poți scrie și rula orice cod Python vrei aici, la liber.
            </div>
          )}

          <div style={{ flex: 1, minHeight: 0 }}>
            {fontsLoaded ? (
              <Editor
                height="100%"
                language={MONACO_LANGUAGE_BY_LANGUAGE[language]}
                theme={monacoThemeName}
                value={editorCode}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: isMobile ? 14 : 16,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollbar: { vertical: 'visible', handleMouseWheel: true },
                  tabSize: 4,
                  fontFamily: "Consolas, 'Courier New', monospace",
                  tabFocusMode: false,
                }}
              />
            ) : (
              <div style={{ color: '#aaa', padding: '20px', fontFamily: 'monospace' }}>
                Se încarcă fonturile...
              </div>
            )}
          </div>
        </div>

        <div
          className={`resizer-horizontal ${isResizingH ? 'active' : ''}`}
          onMouseDown={() => setIsResizingH(true)}
          onTouchStart={() => setIsResizingH(true)}
        />

        <div className="ide-side-panel" ref={sidePanelRef} style={sidePanelStyle}>

          <div className="panel-box" style={{ height: `${topHeight}px`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '10px' }}>
              <div className="box-header-title">DATE DE INTRARE (STDIN)</div>

              {esteInWorkspaceLectie && (
                <div style={{ position: 'relative', zIndex: 110 }}>
                  <button
                    onClick={handleFetchAiCases}
                    disabled={loadingAi}
                    style={{
                      background: 'rgba(31, 224, 249, 0.08)',
                      border: '1px solid rgba(31, 224, 249, 0.3)',
                      color: '#1fe0f9',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: loadingAi ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '4px',
                      opacity: loadingAi ? 0.6 : 1
                    }}
                  >
                    <Wand2 size={12} />
                    {loadingAi ? 'Generare...' : 'Cazuri AI'}
                  </button>

                  {isAiPopoverOpen && aiCases && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '6px',
                      width: '280px',
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '10px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Seturi brute de text (STDIN)
                      </div>
                      {renderAiRow('Average Case', '#34d399', 'normal', aiCases.normal)}
                      {renderAiRow('Worst Case', '#f43f5e', 'worstCase', aiCases.worstCase)}
                      {renderAiRow('Best Case', '#22d3ee', 'bestCase', aiCases.bestCase)}
                      {renderAiRow('Stress Test / Edge', '#fbbf24', 'stressTest', aiCases.stressTest)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <textarea
              value={compilerInput}
              onChange={(e) => setCompilerInput(e.target.value)}
              placeholder="Introdu datele de test aici..."
              className="box-textarea"
              disabled={isMigrating}
            />
          </div>

          <div
            className={`resizer-vertical ${isResizingV ? 'active' : ''}`}
            onMouseDown={() => setIsResizingV(true)}
            onTouchStart={() => setIsResizingV(true)}
          />

          <div className="panel-box" style={{ height: `calc(100% - ${topHeight}px - 8px)` }}>
            <div className="box-header-title">CONSOLĂ REZULTAT (STDOUT)</div>

            {isMigrating && (
              <div style={{
                background: 'rgba(250, 179, 135, 0.12)',
                borderLeft: '4px solid #fab387',
                padding: '10px 14px',
                margin: '8px',
                borderRadius: '4px',
                fontFamily: 'sans-serif',
                fontSize: '13px',
                color: '#fab387',
                lineHeight: '1.45'
              }}>
                <strong>Sistemul de evaluare se mută pe server VPS dedicat!</strong> <br />
                Compilarea live pentru codul C++ este temporar suspendată pentru upgrade de infrastructură (mutare cluster Docker). Toate animațiile și simulările vizuale de pe site rămân complet functionale.
                <br /> Am reusit sa mutam evaluatorul pe VPS-ul dedicat, dar mai avem adjustari de securitate de facut.
              </div>
            )}

            {executionTime !== null && executionMemory !== null && (
              <div className="performance-stats-bar" style={{
                display: 'flex',
                gap: '15px',
                padding: '6px 12px',
                background: '#1e1e2e',
                borderBottom: '1px solid #2d2d3d',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#a6adc8'
              }}>
                <div className="performance-stats-bar">
                  <span>Timp: <strong style={{ color: '#a6e3a1' }}>{executionTime}s</strong></span>
                  <span>Memorie: <strong style={{ color: '#74c7ec' }}>{executionMemory} MB</strong></span>
                </div>
              </div>
            )}

            <pre className="box-console-output">
              {compilerOutput || (isMigrating ? "Evaluator dezactivat pentru mentenanță." : "Apasă pe 'Rulează'.")}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}

export default CompilerPage;