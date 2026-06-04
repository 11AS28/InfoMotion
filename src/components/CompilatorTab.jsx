// src/pages/CompilerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import { toast } from 'sonner';

function CompilerPage() {
  const { idLectie } = useParams();
  const [titluLectie, setTitluLectie] = useState("Workspace C++");
  const [editorCode, setEditorCode] = useState("");
  const [compilerInput, setCompilerInput] = useState("");
  const [compilerOutput, setCompilerOutput] = useState("");
  const [loadingCompiler, setLoadingCompiler] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

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

  const handleRunCompilerCode = async () => {
    setLoadingCompiler(true);
    setCompilerOutput("Se compilează și se rulează pe serverul InfoMotion...");

    try {
      const response = await fetch('http://localhost:5000/api/run-cpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editorCode,
          input: compilerInput
        })
      });

      const data = await response.json();

      if (data.status === "Succes") {
        setCompilerOutput(data.output);
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
      <div style={{ background: '#1e1e1e', color: '#1fe0f9', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 'bold' }}>
        Se încarcă mediul de dezvoltare InfoMotion...
      </div>
    );
  }

  return (
    // Pagina are acum scroll global normal (overflowY: 'auto')
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column', overflowY: 'auto', margin: 0, padding: 0 }}>
      
      {/* HEADER IDE (Rămâne fix sus pe ecran doar dacă nu dai scroll, se duce în sus odată cu pagina) */}
      <div style={{ height: '55px', backgroundColor: '#181818', borderBottom: '1px solid #2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', marginRight: '6px' }}></span>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', marginRight: '6px' }}></span>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', marginRight: '10px' }}></span>
          <h3 style={{ color: '#1fe0f9', fontSize: '14px', fontWeight: 'normal', fontFamily: 'monospace', margin: 0 }}>
            InfoMotion Sandbox IDE — {titluLectie}
          </h3>
        </div>

        <div>
          <button 
            onClick={handleRunCompilerCode}
            disabled={loadingCompiler}
            style={{
              background: 'linear-gradient(135deg, #2cc95b 0%, #1db148 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: loadingCompiler ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(44, 201, 91, 0.2)'
            }}
          >
            <Play size={14} fill="#fff" /> {loadingCompiler ? "Se execută..." : "Rulează Cod"}
          </button>
        </div>
      </div>

      {/* SECȚIUNEA 1: EDITORUL MONACO (Ocupă o înălțime generoasă, restul dă overflow în josul paginii) */}
      <div style={{ width: '100%', height: '70vh', borderBottom: '2px solid #2d2d2d', position: 'relative' }}>
        <Editor
          height="110%"
          language="cpp"
          theme="vs-dark"
          value={editorCode}
          onChange={(val) => setEditorCode(val || "")}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true, // Își recalculează dimensiunea singur la resize
            scrollbar: { vertical: 'visible', handleMouseWheel: true },
            fontFamily: "'Fira Code', Consolas, monospace"
          }}
        />
      </div>

      {/* SECȚIUNEA 2: ZONELE DE INPUT ȘI OUTPUT (Apar sub editor, când dai scroll în jos pe pagină) */}
      <div style={{ width: '100%', padding: '40px', boxSizing: 'border-box', backgroundColor: '#151515', display: 'flex', flexDirection: 'column', gap: '35px' }}>
        
        {/* Caseta Date de Intrare */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2d2d2d' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '25px 15px', fontSize: '12px', color: '#888', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '0.5px' }}>
            DATE DE INTRARE (STDIN)
          </div>
          <textarea
            value={compilerInput}
            onChange={(e) => setCompilerInput(e.target.value)}
            placeholder="Introdu datele de test aici..."
            style={{ 
              width: '100%', 
              height: '150px', // Înălțime fixă pentru zona de text
              backgroundColor: '#121212', 
              color: '#fc9867', 
              border: 'none', 
              padding: '15px', 
              fontFamily: 'monospace', 
              fontSize: '15px', 
              resize: 'vertical', // Permite utilizatorului să o lungească manual dacă vrea
              outline: 'none', 
              boxSizing: 'border-box' 
            }}
          />
        </div>

        {/* Caseta Consolă Rezultat */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2d2d2d' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '10px 15px', fontSize: '12px', color: '#888', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '0.5px' }}>
            CONSOLĂ REZULTAT (STDOUT)
          </div>
          <pre style={{ 
            margin: 0, 
            padding: '20px', 
            backgroundColor: '#0d0d0d', 
            color: '#00ff66', 
            minHeight: '180px', // Înălțime minimă
            maxHeight: '500px', // Oprim consola din a deveni infinit de lungă, dă scroll intern dacă e text masiv
            overflowY: 'auto', 
            fontFamily: 'monospace', 
            fontSize: '15px', 
            whiteSpace: 'pre-wrap', 
            boxSizing: 'border-box' 
          }}>
            {compilerOutput || "Apasă pe butonul verde 'Rulează Cod' de sus pentru a compila textul din editor."}
          </pre>
        </div>

      </div>

    </div>
  );
}

export default CompilerPage;