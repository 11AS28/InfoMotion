import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function VariabileAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      desc: "1. Situația inițială: Avem variabila A cu valoarea 5 (lichid albastru) și variabila B cu valoarea 7 (lichid portocaliu). Obiectivul nostru este să inversăm conținutul lor.",
      code: "int a = 5, b = 7;\nint aux;",
      pahare: {
        a: { val: 5, color: '#3b82f6', label: 'Variabila A' },
        b: { val: 7, color: '#BA7517', label: 'Variabila B' },
        aux: { val: null, color: 'transparent', label: 'Variabila AUX' }
      }
    },
    {
      desc: "2. Problema: Dacă facem direct 'a = b', valoarea 5 dispare definitiv (se suprascrie). De aceea avem nevoie de un 'pahar de rezervă' numit 'aux'. Turnăm A în Aux.",
      code: "aux = a; // aux devine 5",
      pahare: {
        a: { val: null, color: 'rgba(59, 130, 246, 0.2)', label: 'Variabila A (Gol)' }, // Simulăm că l-am golit pentru a evidenția mutarea
        b: { val: 7, color: '#BA7517', label: 'Variabila B' },
        aux: { val: 5, color: '#3b82f6', label: 'Variabila AUX' }
      }
    },
    {
      desc: "3. Acum că am pus valoarea lui A la loc sigur (în aux), putem să turnăm liniștiți conținutul lui B peste A. Variabila A ia valoarea lui B.",
      code: "aux = a;\na = b; // a devine 7",
      pahare: {
        a: { val: 7, color: '#BA7517', label: 'Variabila A' },
        b: { val: null, color: 'rgba(186, 117, 23, 0.2)', label: 'Variabila B (Gol)' },
        aux: { val: 5, color: '#3b82f6', label: 'Variabila AUX' }
      }
    },
    {
      desc: "4. Ultimul pas: Variabila B așteaptă să primească fosta valoare a lui A. Luăm paharul de rezervă 'aux' și turnăm conținutul său în B.",
      code: "aux = a;\na = b;\nb = aux; // b devine 5",
      pahare: {
        a: { val: 7, color: '#BA7517', label: 'Variabila A' },
        b: { val: 5, color: '#3b82f6', label: 'Variabila B' },
        aux: { val: null, color: 'transparent', label: 'Variabila AUX' }
      }
    },
    {
      desc: "5. FINAL! Variabilele au fost interschimbate cu succes (Swap efectuat complet). Lichidul portocaliu a ajuns în A, iar cel albastru în B.",
      code: "cout << a << \" \" << b;\n// Afiseaza: 7 5",
      pahare: {
        a: { val: 7, color: '#BA7517', label: 'Variabila A' },
        b: { val: 5, color: '#3b82f6', label: 'Variabila B' },
        aux: { val: null, color: 'transparent', label: 'Variabila AUX' }
      }
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const cur = stages[step];

  // Componentă mică pentru afișarea unui Pahar
  const Pahar = ({ data }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
        <div style={{ 
            width: '80px', 
            height: '110px', 
            borderLeft: '4px solid #cbd5e1', 
            borderRight: '4px solid #cbd5e1', 
            borderBottom: '4px solid #cbd5e1', 
            borderRadius: '0 0 10px 10px',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'flex-end', // Lichidul stă jos
            overflow: 'hidden'
        }}>
          {/* Partea de "Lichid" */}
          <div style={{ 
              width: '100%', 
              height: data.val !== null ? '80%' : '0%', 
              background: data.color,
              transition: 'all 0.5s ease', // Efect fluid la mutare
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
          }}>
            {data.val !== null && (
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {data.val}
              </span>
            )}
          </div>
        </div>
        <small style={{ marginTop: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center' }}>
          {data.label}
        </small>
      </div>
    );
  };

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Interschimbarea (Metoda Paharelor)</h3>
      <p className="di-desc" style={{ minHeight: '85px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '35px' }}>
        
        {/* Vizualizare Pahare */}
        <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center', 
            flexWrap: 'wrap', // Siguranță pentru mobil
            width: '100%',
            padding: '20px 0'
        }}>
          <Pahar data={cur.pahare.a} />
          
          {/* Auxiliarul e plasat între ele, dar mai jos, ca o găleată ajutătoare */}
          <div style={{ transform: 'translateY(30px)' }}>
             <Pahar data={cur.pahare.aux} />
          </div>

          <Pahar data={cur.pahare.b} />
        </div>

        {/* Codul C++ relevant pasului */}
        <div style={{ 
          background: '#1e293b', padding: '15px', borderRadius: '8px', 
          fontFamily: 'monospace', borderLeft: '4px solid #9b5de5',
          width: '100%', maxWidth: '400px', boxSizing: 'border-box'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Echivalentul în cod C++:</span>
          <pre style={{ margin: 0, color: '#8cd932', whiteSpace: 'pre-wrap', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
            {cur.code}
          </pre>
        </div>

      </div>

      <div className="di-controls" style={{ marginTop: '30px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}>Reset</button>
      </div>
    </div>
  );
}