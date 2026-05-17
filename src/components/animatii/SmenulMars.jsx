import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SmenulLuiMarsAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      type: "init",
      d: [0, 0, 0, 0, 0, 0, 0],
      v: [0, 0, 0, 0, 0, 0, 0],
      sum: 0,
      desc: "1. Inițializare. Avem un vector V plin de 0. Vrem să facem operația: adaugă +5 pe intervalul [L=2, R=4]."
    },
    {
      type: "update",
      d: [0, 5, 0, 0, -5, 0, 0],
      v: [0, 0, 0, 0, 0, 0, 0],
      sum: 0,
      desc: "2. Aplicăm Șmenul în vectorul D: Marcăm începutul cu D[2] += 5 și finalul cu D[4+1] -= 5. Totul în O(1)!"
    },
    {
      type: "build-1",
      d: [0, 5, 0, 0, -5, 0, 0],
      v: [0, 5, 0, 0, 0, 0, 0],
      sum: 5,
      desc: "3. Reconstituire pas 1 (i=1..2): Ajungem la D[2]=5. Suma acumulată devine 5. V[2] primește valoarea 5."
    },
    {
      type: "build-2",
      d: [0, 5, 0, 0, -5, 0, 0],
      v: [0, 5, 5, 5, 0, 0, 0],
      sum: 5,
      desc: "4. Reconstituire pas 2 (i=3..4): D[3] și D[4] sunt 0, deci suma acumulată rămâne 5. V[3] și V[4] devin și ele 5!"
    },
    {
      type: "build-3",
      d: [0, 5, 0, 0, -5, 0, 0],
      v: [0, 5, 5, 5, 0, 0, 0],
      sum: 0,
      desc: "5. Reconstituire pas 3 (i=5): Ajungem la D[5]=-5. Suma acumulată scade: 5 + (-5) = 0. V[5] rămâne 0. Efectul s-a oprit!"
    },
    {
      type: "final",
      d: [0, 5, 0, 0, -5, 0, 0],
      v: [0, 5, 5, 5, 0, 0, 0],
      sum: 0,
      desc: "6. Gata! Vectorul final V are acum valoarea 5 exact pe intervalul [2, 4]. Genial și extrem de rapid!"
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Șmenul lui Mars</h3>
      <p className="di-desc" style={{ minHeight: '65px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ textAlign: 'left' }}>
        {/* Vectorul D */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vectorul D (Diferențe):</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {cur.d.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              
              if (cur.type !== "init") {
                if (idx === 2) { bg = '#639922'; border = '2px solid #8cd932'; } // L
                if (idx === 5) { bg = '#c93b3b'; border = '2px solid #ff6b6b'; } // R+1
              }

              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border, fontSize: '1rem' }}>
                    {val > 0 ? `+${val}` : val}
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>D[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vectorul V */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vectorul V (Rezultat):</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {cur.v.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              
              if ((cur.type.startsWith("build") || cur.type === "final") && idx >= 2 && idx <= 4) {
                if (val > 0) {
                  bg = '#BA7517';
                  border = '2px solid #ffb347';
                }
              }

              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border, fontSize: '1rem' }}>{val}</div>
                  <small style={{ color: 'var(--text-muted)' }}>V[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Valoare acumulată live */}
        {cur.type.startsWith("build") && (
          <div style={{ marginTop: '15px', padding: '8px', background: '#1e293b', borderRadius: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
            Suma parțială propagată acum: <strong style={{ color: '#8cd932', fontSize: '1.2rem' }}>{cur.sum}</strong>
          </div>
        )}
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}