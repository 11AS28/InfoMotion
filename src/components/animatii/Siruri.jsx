import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function FibonacciAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    { f1: 1, f2: 1, f3: "-", sir: [1, 1], desc: "1. Inițializare: Afișăm primii doi termeni standard: F[1] = 1 și F[2] = 1." },
    { f1: 1, f2: 1, f3: 2, sir: [1, 1, 2], desc: "2. Calcul: F[3] = f1 + f2 = 1 + 1 = 2. Îl adăugăm în șir." },
    { f1: 1, f2: 2, f3: 2, sir: [1, 1, 2], desc: "3. Glisare: Mutăm variabilele la dreapta! f1 ia valoarea lui f2 (1), iar f2 ia valoarea lui f3 (2)." },
    { f1: 1, f2: 2, f3: 3, sir: [1, 1, 2, 3], desc: "4. Calcul: F[4] = f1 + f2 = 1 + 2 = 3. Îl adăugăm în șir." },
    { f1: 2, f2: 3, f3: 3, sir: [1, 1, 2, 3], desc: "5. Glisare: Din nou mutăm fereastra. f1 devine 2, f2 devine 3." },
    { f1: 2, f2: 3, f3: 5, sir: [1, 1, 2, 3, 5], desc: "6. Calcul: F[5] = f1 + f2 = 2 + 3 = 5. Am generat cu succes primii 5 termeni!" }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Generarea Șirului lui Fibonacci</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{cur.desc}</p>
      
           <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            marginBottom: '35px',  
            flexWrap: 'wrap',
            alignItems: 'center' 
        }}>
          <div className="di-box" style={{ background: '#1e293b', border: '2px solid #ffb347', width: 'auto', padding: '0 15px' }}>f1 = {cur.f1}</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>+</div>
          <div className="di-box" style={{ background: '#1e293b', border: '2px solid #ffb347', width: 'auto', padding: '0 15px' }}>f2 = {cur.f2}</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>=</div>
          <div className="di-box" style={{ background: '#639922', width: 'auto', padding: '0 15px' }}>f3 = {cur.f3}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
            ȘIRUL GENERAT PÂNĂ ACUM:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cur.sir.map((num, idx) => (
              <div key={idx} className="di-box" style={{ 
                width: '45px', 
                height: '45px', 
                background: idx === cur.sir.length - 1 ? '#639922' : 'var(--bg-subtle)',
                border: idx === cur.sir.length - 1 ? '2px solid #8cd932' : '1px solid #4a5568',
                fontSize: '1rem'
              }}>
                {num}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="di-controls" style={{ flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
