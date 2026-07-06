import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SumePartiale1DAnim() {
  const [step, setStep] = useState(0);

  const V = [0, 3, 1, 4, 2, 5];
  
  const stages = [
    {
      s: [0, 0, 0, 0, 0, 0],
      activeV: [],
      activeS: -1,
      calc: "",
      desc: "1. PREGĂTIRE: Avem un vector V. Vrem să construim vectorul S, unde S[i] este suma elementelor de la V[1] la V[i]. S[0] este mereu 0."
    },
    {
      s: [0, 3, 0, 0, 0, 0],
      activeV: [1],
      activeS: 1,
      calc: "S[1] = S[0] + V[1] = 0 + 3 = 3",
      desc: "2. CONSTRUIRE S[1]: Adunăm S[0] cu V[1]."
    },
    {
      s: [0, 3, 4, 0, 0, 0],
      activeV: [2],
      activeS: 2,
      calc: "S[2] = S[1] + V[2] = 3 + 1 = 4",
      desc: "3. CONSTRUIRE S[2]: Adunăm suma anterioară (S[1]) cu elementul curent (V[2])."
    },
    {
      s: [0, 3, 4, 8, 0, 0],
      activeV: [3],
      activeS: 3,
      calc: "S[3] = S[2] + V[3] = 4 + 4 = 8",
      desc: "4. CONSTRUIRE S[3]: Adunăm S[2] cu V[3]."
    },
    {
      s: [0, 3, 4, 8, 10, 0],
      activeV: [4],
      activeS: 4,
      calc: "S[4] = S[3] + V[4] = 8 + 2 = 10",
      desc: "5. CONSTRUIRE S[4]: S[3] + V[4]."
    },
    {
      s: [0, 3, 4, 8, 10, 15],
      activeV: [5],
      activeS: 5,
      calc: "S[5] = S[4] + V[5] = 10 + 5 = 15",
      desc: "6. CONSTRUIRE S[5]: Vectorul de sume parțiale este complet!"
    },
    {
      s: [0, 3, 4, 8, 10, 15],
      activeV: [2, 3, 4],
      activeS: -1,
      query: { L: 2, R: 4 },
      calc: "Suma pe intervalul [2, 4] = V[2] + V[3] + V[4] = 1 + 4 + 2 = 7",
      desc: "7. INTEROGARE: Cum aflăm suma pe intervalul [2, 4] instant? Nu facem for, ci folosim vectorul S."
    },
    {
      s: [0, 3, 4, 8, 10, 15],
      activeV: [2, 3, 4],
      activeS: -1,
      highlightS: [4, 1],
      query: { L: 2, R: 4 },
      calc: "Suma = S[R] - S[L-1] = S[4] - S[1]",
      desc: "8. FORMULA: Suma cerută este S[4] (suma primelor 4 elemente) din care tăiem S[1] (ce e înainte de L)."
    },
    {
      s: [0, 3, 4, 8, 10, 15],
      activeV: [2, 3, 4],
      activeS: -1,
      highlightS: [4, 1],
      query: { L: 2, R: 4 },
      calc: "Suma = 10 - 3 = 7",
      desc: "9. REZULTAT: Am obținut 7 printr-o singură scădere. Complexitate: O(1) per query!"
    }
  ];

  const cur = stages[step];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="di-container">
      <h3 className="di-title">Sume Parțiale 1D (Pas cu Pas)</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ marginBottom: '20px', width: '100%' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center' }}>
            Vectorul V (Original):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {V.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              
              
              if (cur.activeV.includes(idx) && step < 6) {
                bg = '#3b82f6';
                border = '2px solid #60a5fa';
              }
              else if (cur.activeV.includes(idx) && step >= 6) {
                bg = '#BA7517';
                border = '2px solid #ffb347';
              }

              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ 
                    width: '45px', height: '45px', 
                    background: bg, border: border, 
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    {val}
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>V[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {step > 0 && step < 6 && (
           <div style={{ color: '#3b82f6', fontSize: '1.5rem', marginBottom: '10px' }}>⬇</div>
        )}

        <div style={{ width: '100%' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center' }}>
            Vectorul S (Sume Parțiale):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cur.s.map((val, idx) => {
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              let opacity = val === 0 && idx !== 0 ? 0.3 : 1; // Estompăm valorile necalculate
              
              if (idx === cur.activeS) {
                bg = '#639922';
                border = '2px solid #8cd932';
                opacity = 1;
              }

              if (cur.highlightS) {
                if (idx === cur.highlightS[0]) { // R
                  bg = '#639922'; 
                  border = '2px solid #8cd932';
                } else if (idx === cur.highlightS[1]) { // L-1
                  bg = '#c93b3b'; 
                  border = '2px solid #ff6b6b';
                }
              }

              return (
                <div key={idx} style={{ textAlign: 'center', opacity: opacity, transition: 'opacity 0.3s ease' }}>
                  <div className="di-box" style={{ 
                    width: '45px', height: '45px', 
                    background: bg, border: border, 
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    {val}
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>S[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {cur.calc && (
          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            background: 'var(--bg-subtle)', 
            borderRadius: '8px', 
            textAlign: 'center', 
            fontFamily: 'monospace', 
            fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
            width: '100%',
            maxWidth: '500px',
            border: step >= 6 ? '2px dashed #BA7517' : '2px dashed #4a5568',
            boxSizing: 'border-box'
          }}>
            {cur.calc}
          </div>
        )}

      </div>

      <div className="di-controls" style={{ marginTop: '30px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
