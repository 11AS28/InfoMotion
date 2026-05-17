import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SumePartiale1DAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      v: [0, 5, 2, 8, 1, 4],
      s: [0, 5, 7, 15, 16, 20],
      L: -1, R: -1,
      type: "init",
      desc: "1. Start! Avem vectorul V (indexat de la 1). Construim vectorul S, unde S[i] este suma elementelor de la V[1] până la V[i]."
    },
    {
      v: [0, 5, 2, 8, 1, 4],
      s: [0, 5, 7, 15, 16, 20],
      L: 2, R: 4,
      type: "query",
      desc: "2. Interogare: Vrem să aflăm suma din intervalul [L=2, R=4] (adică 2 + 8 + 1 = 11). Aplicăm formula: S[4] - S[1]."
    },
    {
      v: [0, 5, 2, 8, 1, 4],
      s: [0, 5, 7, 15, 16, 20],
      L: 2, R: 4,
      type: "calc",
      desc: "3. Calcul: S[4] (valoarea 15) reprezintă suma elementelor 1-4. Scădem S[1] (valoarea 5), care elimină elementele din afara intervalului (de la 1 la L-1)."
    },
    {
      v: [0, 5, 2, 8, 1, 4],
      s: [0, 5, 7, 15, 16, 20],
      L: 2, R: 4,
      type: "final",
      desc: "4. Rezultat final: 15 - 5 = 10. Am obținut suma elementelor din interval instant, în timp O(1)!"
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Sume Parțiale 1D</h3>
      <p className="di-desc" style={{ minHeight: '65px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ textAlign: 'left' }}>
        {/* Vectorul V */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vectorul V (Inițial):</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {cur.v.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              if (cur.type !== "init" && idx >= cur.L && idx <= cur.R) {
                bg = '#BA7517'; // Evidențiem intervalul căutat
                border = '2px solid #ffb347';
              }
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border, fontSize: '1rem' }}>{val}</div>
                  <small style={{ color: 'var(--text-muted)' }}>v[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vectorul S */}
        <div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vectorul S (Sume Parțiale):</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {cur.s.map((val, idx) => {
              let bg = 'var(--bg-subtle)';
              let border = '1px solid #4a5568';
              
              if (cur.type !== "init") {
                if (idx === cur.R) {
                  bg = '#639922'; // Elementul de la R (tot ce adunăm)
                  border = '2px solid #8cd932';
                } else if (idx === cur.L - 1) {
                  bg = '#c93b3b'; // Ce scădem (L-1)
                  border = '2px solid #ff6b6b';
                }
              }

              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border, fontSize: '1rem' }}>{val}</div>
                  <small style={{ color: 'var(--text-muted)' }}>s[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulă live */}
        {cur.type !== "init" && (
          <div style={{ marginTop: '25px', padding: '10px', background: '#1e293b', borderRadius: '6px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem' }}>
            Suma = S[{cur.R}] - S[{cur.L - 1}] = <span style={{ color: '#8cd932' }}>{cur.s[cur.R]}</span> - <span style={{ color: '#ff6b6b' }}>{cur.s[cur.L - 1]}</span> = <strong>{cur.s[cur.R] - cur.s[cur.L - 1]}</strong>
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