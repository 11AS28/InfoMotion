import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SlidingWindowDequeAnim() {
  const [step, setStep] = useState(0);

  const vector = [0, 4, 3, 8, 1, 6]; // indexat de la 1 virtual: [4, 3, 8, 1, 6]
  const K = 3;

  const stages = [
    {
      i: 1, val: 4, dq: [1], minime: [],
      desc: "1. i = 1 (Valoare = 4). Deque este gol, adăugăm indicele 1. Fereastra nu e completă (1 < K)."
    },
    {
      i: 2, val: 3, dq: [2], minime: [],
      desc: "2. i = 2 (Valoare = 3). V[2]=3 este mai mic decât V[1]=4. Eliminăm indicele 1 din spate și adăugăm 2. Fereastra nu e completă."
    },
    {
      i: 3, val: 8, dq: [2, 3], minime: [3],
      desc: "3. i = 3 (Valoare = 8). V[3]=8 este mai mare decât V[2]=3, deci se așază cuminte în spate. Fereastra e gata! Minimul e la front: V[2] = 3."
    },
    {
      i: 4, val: 1, dq: [4], minime: [3, 1],
      desc: "4. i = 4 (Valoare = 1). V[4]=1 este mai mic decât tot ce e în coadă (8 și 3). Îi dă pe toți afară din spate! Adăugăm 4. Minimul e V[4] = 1."
    },
    {
      i: 5, val: 6, dq: [4, 5], minime: [3, 1, 1],
      desc: "5. i = 5 (Valoare = 6). V[5]=6 intră în spate după 4. Între timp, indicele din front (4) este încă în interiorul ferestrei [3, 5]. Minimul e V[4] = 1."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Sliding Window Minimum cu Deque (K = 3)</h3>
      <p className="di-desc" style={{ minHeight: '65px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ textAlign: 'left' }}>
        {/* Vizualizare Vector și Fereastră */}
        <div style={{ marginBottom: '25px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vectorul V și Fereastra Glisantă:</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {vector.slice(1).map((val, idx) => {
              const realIdx = idx + 1;
              const inWindow = realIdx > (cur.i - K) && realIdx <= cur.i;
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              
              if (realIdx === cur.i) {
                bg = '#3b82f6';
                border = '2px solid #60a5fa';
              } else if (inWindow) {
                bg = 'rgba(186, 117, 23, 0.4)';
                border = '2px dashed #BA7517';
              }

              return (
                <div key={realIdx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border }}>{val}</div>
                  <small style={{ color: 'var(--text-muted)' }}>i={realIdx}</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Starea Deque-ului */}
        <div style={{ marginBottom: '25px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Starea Deque (Conține indici, arătăm și valorile):</span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>FRONT [</div>
            {cur.dq.map((indice, idx) => (
              <div key={indice} className="di-box" style={{ background: idx === 0 ? '#639922' : '#1e293b', border: idx === 0 ? '2px solid #8cd932' : '1px solid #4a5568', width: '65px', padding: '5px' }}>
                <span style={{ fontSize: '0.7rem', display: 'block', color: '#a0aec0' }}>id: {indice}</span>
                <strong>V={vector[indice]}</strong>
              </div>
            ))}
            <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>] BACK</div>
          </div>
        </div>

        {/* Minimele rezultate */}
        <div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Minimele ferestrelor generate:</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {cur.minime.map((m, idx) => (
              <div key={idx} className="di-box" style={{ background: '#2d3748', width: '40px', height: '40px', color: '#8cd932', fontWeight: 'bold' }}>{m}</div>
            ))}
            {cur.minime.length === 0 && <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Niciun minim încă...</span>}
          </div>
        </div>
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}