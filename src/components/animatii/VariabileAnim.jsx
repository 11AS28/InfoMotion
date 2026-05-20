import React, { useState } from 'react';
import '../animatii_css/divideAnim.css'; // Refolosim stilul de la DivideAnim

export default function VariabileAnim() {
  const [step, setStep] = useState(0);

  // Stările animației pentru a arăta cum funcționează memoria și variabilele
  const stages = [
    { 
      desc: "1. Memoria calculatorului este goală. Nu avem nicio variabilă creată.", 
      cod: "",
      cutieTitlu: "",
      cutieContinut: "Goală",
      tip: "none",
      boxColor: 'var(--bg-subtle)'
    },
    { 
      desc: "2. DECLARAREA: Calculatorul fabrică o cutie (spațiu în memorie) numită 'a', capabilă să țină doar numere întregi (int).", 
      cod: "int a;",
      cutieTitlu: "Variabila 'a' (int)",
      cutieContinut: "? (Gunoi)",
      tip: "int",
      boxColor: '#378ADD' // Albastru pt int
    },
    { 
      desc: "3. ATRIBUIREA (Inițializarea): Punem valoarea 5 în interiorul cutiei 'a'.", 
      cod: "int a;\na = 5;",
      cutieTitlu: "Variabila 'a' (int)",
      cutieContinut: "5",
      tip: "int",
      boxColor: '#378ADD'
    },
    { 
      desc: "4. MODIFICAREA: Variabila își poate SCHIMBA valoarea! Vechea valoare (5) se șterge, iar în cutie intră 12.", 
      cod: "int a;\na = 5;\na = 12;",
      cutieTitlu: "Variabila 'a' (int)",
      cutieContinut: "12",
      tip: "int",
      boxColor: '#378ADD'
    },
    { 
      desc: "5. ALTE TIPURI DE DATE: Dacă facem o cutie pentru caractere (char), încape o singură literă între apostrofuri.", 
      cod: "char litera;\nlitera = 'X';",
      cutieTitlu: "Variabila 'litera' (char)",
      cutieContinut: "'X'",
      tip: "char",
      boxColor: '#D4537E' // Roz pt char
    },
    { 
      desc: "6. ALTE TIPURI DE DATE: Pentru numere cu virgulă folosim float sau double.", 
      cod: "float pi;\npi = 3.14;",
      cutieTitlu: "Variabila 'pi' (float)",
      cutieContinut: "3.14",
      tip: "float",
      boxColor: '#639922' // Verde pt float
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const currentStage = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Ce este o variabilă în memorie?</h3>
      <p className="di-desc" style={{ minHeight: '48px' }}>{currentStage.desc}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '50px', flexWrap: 'wrap', marginBottom: '40px' }}>
        
        {/* Partea Stângă: CODUL C++ */}
        <div style={{ 
            backgroundColor: '#1e1e1e', 
            padding: '20px', 
            borderRadius: '8px', 
            minWidth: '200px', 
            minHeight: '120px',
            textAlign: 'left',
            fontFamily: 'monospace',
            color: '#d4d4d4',
            border: '1px solid #444',
            fontSize: '1.2rem',
            whiteSpace: 'pre-wrap' // Păstrează enter-urile din string
        }}>
          <span style={{ color: '#888', display: 'block', marginBottom: '10px' }}>// Cod C++</span>
          {currentStage.cod === "" ? <span style={{color: '#555'}}>(Nimic)</span> : 
           currentStage.cod.split('\n').map((line, i) => {
               // Colorăm cuvintele cheie (int, float, char)
               if(line.includes("int")) return <div key={i}><span style={{color: '#569cd6'}}>int</span> {line.replace('int', '')}</div>;
               if(line.includes("char")) return <div key={i}><span style={{color: '#569cd6'}}>char</span> {line.replace('char', '')}</div>;
               if(line.includes("float")) return <div key={i}><span style={{color: '#569cd6'}}>float</span> {line.replace('float', '')}</div>;
               return <div key={i}>{line}</div>;
           })}
        </div>

        {/* Partea Dreaptă: REPREZENTAREA VIZUALĂ A CUTIEI (MEMORIA) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {currentStage.cutieTitlu || "Memoria (RAM)"}
          </span>
          
          <div className="di-box" style={{ 
            width: '120px', 
            height: '120px', 
            backgroundColor: currentStage.boxColor, 
            border: '3px dashed #fff',
            borderRadius: '12px',
            fontSize: '2rem',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Efect de "bounce"
            transform: step === 0 ? 'scale(0.8)' : 'scale(1)',
            opacity: step === 0 ? 0.3 : 1
          }}>
            {currentStage.cutieContinut}
          </div>
        </div>

      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset">Reset</button>
      </div>
    </div>
  );
}
