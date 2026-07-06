import React, { useState } from 'react';
import '../animatii_css/divideAnim.css'; 

export default function AflareMaximAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    { 
      desc: "1. Vectorul inițial. Vrem să aflăm valoarea maximă.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: -1, 
      maxim: "?",
      highlightBox: -1
    },
    { 
      desc: "2. Inițializare: maxim = v[1]. (Primul element devine maximul temporar)", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: 0,
      maxim: 12,
      highlightBox: 0
    },
    { 
      desc: "3. i = 2. Verificăm v[2]: Este 45 > 12? DA! Noul maxim devine 45.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: 1,
      maxim: 45,
      highlightBox: 1
    },
    { 
      desc: "4. i = 3. Verificăm v[3]: Este 7 > 45? NU. Maximul rămâne 45.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: 2,
      maxim: 45,
      highlightBox: -1 
    },
    { 
      desc: "5. i = 4. Verificăm v[4]: Este 89 > 45? DA! Noul maxim devine 89.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: 3,
      maxim: 89,
      highlightBox: 3
    },
    { 
      desc: "6. i = 5. Verificăm v[5]: Este 23 > 89? NU. Maximul rămâne 89.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: 4,
      maxim: 89,
      highlightBox: -1
    },
    { 
      desc: "7. FINAL! Bucla s-a încheiat. Valoarea maximă din vector este 89.", 
      vector: [12, 45, 7, 89, 23],
      currentIndex: -1,
      maxim: 89,
      highlightBox: 3
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const currentStage = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Aflarea Maximului dintr-un Vector</h3>
      <p className="di-desc">{currentStage.desc}</p>
      
      <div className="di-visual">
        <div className="di-array" style={{ border: 'none', background: 'transparent' }}>
          {currentStage.vector.map((num, idx) => {
            let boxStyle = {};
            
            if (idx === currentStage.highlightBox) {
               boxStyle = { backgroundColor: '#639922', border: '2px solid #8cd932', transform: 'scale(1.1)' };
            } else if (idx === currentStage.currentIndex) {
               boxStyle = { backgroundColor: '#BA7517', border: '2px solid #ffb347' };
            } else if (idx < currentStage.currentIndex) {
               boxStyle = { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' };
            }

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="di-box" style={boxStyle}>
                  {num}
                </div>
                <small style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  v[{idx + 1}]
                </small>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        Variabila <code style={{ color: '#639922', backgroundColor: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: '4px' }}>maxim = {currentStage.maxim}</code>
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset">Reset</button>
      </div>
    </div>
  );
}
