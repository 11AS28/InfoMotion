import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Editor, { loader } from '@monaco-editor/react'; 
import { Play } from 'lucide-react';
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

function CompilerPage() {
  const { idLectie } = useParams();
  const { currentUser } = useAuth(); 
  
  const [titluLectie, setTitluLectie] = useState("Workspace C++");
  const [editorCode, setEditorCode] = useState("");
  const [compilerInput, setCompilerInput] = useState("");
  const [compilerOutput, setCompilerOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [executionMemory, setExecutionMemory] = useState(null);
  const [loadingCompiler, setLoadingCompiler] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // 🚧 MENTENANȚĂ ACTIVĂ PENTRU MIGRARE VPS (Schimbă pe false după ce VPS-ul e gata)
  const [isMigrating, setIsMigrating] = useState(true);

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
        setFontFontsLoaded(true);
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
      try {
        const docRef = doc(db, "lectii", idLectie);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTitluLectie(docSnap.data().titlu);
          setEditorCode(docSnap.data().codCPlusPlus || "// Scrie codul tău C++ aici...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}");
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
    if (isMigrating) return; // Siguranță în caz că se apelează manual programatic

    setLoadingCompiler(true);
    setCompilerOutput("Se compilează și se rulează pe serverul InfoMotion...");

    setExecutionTime(null);
    setExecutionMemory(null);
    
    try {
      const response = await fetch(`${baseUrl}/api/run-cpp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, input: compilerInput })
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
        <div>
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
        
        <div className="ide-editor-section" style={mainSplitStyle}>
          {fontsLoaded ? (
            <Editor
              height="100%"
              language="cpp"
              theme={monacoThemeName} 
              value={editorCode}
              onChange={(val) => setEditorCode(val || "")}
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

        <div 
          className={`resizer-horizontal ${isResizingH ? 'active' : ''}`} 
          onMouseDown={() => setIsResizingH(true)}
          onTouchStart={() => setIsResizingH(true)} 
        />

        <div className="ide-side-panel" ref={sidePanelRef} style={sidePanelStyle}>
          
          <div className="panel-box" style={{ height: `${topHeight}px` }}>
            <div className="box-header-title">DATE DE INTRARE (STDIN)</div>
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
            
            {/* BANNER MENTENANȚĂ VPS */}
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
                Compilarea live pentru codul C++ este temporar suspendată pentru upgrade de infrastructură (mutare cluster Docker). Toate animațiile și simulările vizuale de pe site rămân complet funcționale.
                O sa aveti din nou acces la compilatorul C++ în maxim 24 de ore. <br />
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