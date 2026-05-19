import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SmenulLuiMarsAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      type: "init",
      d: [0, 0, 0, 0, 0, 0],
      v: [0, 0, 0, 0, 0, 0],
      idx: -1, sum: 0,
      desc: "1. PREGĂTIRE: Avem un vector V inițializat cu 0. Vrem să executăm operația: adaugă valoarea +3 pe intervalul [L=2, R=4] fără să parcurgem intervalul cu un for."
    },
    {
      type: "update",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 0, 0, 0, 0, 0],
      idx: -1, sum: 0,
      desc: "2. MARCARE CAPETE: Punem +3 la începutul intervalului D[2] și anulăm efectul punând -3 imediat după capătul din dreapta, la D[5]. Această operație durează doar doi pași: O(1)."
    },
    {
      type: "build-1",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 0, 0, 0, 0, 0],
      idx: 1, sum: 0,
      desc: "3. RECONSTRUIRE I=1: Începem propagarea. La poziția 1, D[1]=0. Suma acumulată rămâne 0. V[1] primește 0."
    },
    {
      type: "build-2",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 3, 0, 0, 0, 0],
      idx: 2, sum: 3,
      desc: "4. RECONSTRUIRE I=2: Ajungem la marcajul de început D[2]=3. Suma acumulată crește la 3. Elementul V[2] devine 3."
    },
    {
      type: "build-3",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 3, 3, 3, 0, 0],
      idx: 4, sum: 3,
      desc: "5. RECONSTRUIRE I=3 și I=4: Pentru pozițiile 3 și 4, valorile din D sunt 0. Suma acumulată rămâne blocată la valoarea 3. Astfel, atât V[3] cât și V[4] devin egale cu 3."
    },
    {
      type: "build-4",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 3, 3, 3, 0, 0],
      idx: 5, sum: 0,
      desc: "6. RECONSTRUIRE I=5: Ajungem la marcajul de oprire D[5]=-3. Suma acumulată scade: 3 + (-3) = 0. V[5] rămâne 0. Efectul adunării s-a oprit exact unde trebuia!"
    },
    {
      type: "final",
      d: [0, 3, 0, 0, -3, 0],
      v: [0, 3, 3, 3, 0, 0],
      idx: -1, sum: 0,
      desc: "7. FINALIZARE: Reconstrucția este gata. Toate elementele din intervalul [2, 4] au primit valoarea 3 în mod corect dintr-o singură parcurgere liniară."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Șmenul lui Mars Detaliat</h3>
      <p className="di-desc" style={{ minHeight: '75px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Vectorul D */}
        <div style={{ marginBottom: '30px', width: '100%' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Vectorul D (Diferențe):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cur.d.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              if (cur.type !== "init") {
                if (idx === 2) bg = '#639922';
                if (idx === 5) bg = '#c93b3b';
              }
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg }}>
                    {val > 0 ? `+${val}` : val}
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>D[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vectorul V */}
        <div style={{ width: '100%' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Vectorul V (Rezultat):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cur.v.slice(1).map((val, i) => {
              const idx = i + 1;
              let bg = 'var(--bg-subtle)';
              if (cur.idx === idx || (cur.type === "build-3" && (idx === 3 || idx === 4))) {
                bg = '#3b82f6';
              } else if (cur.type === "final" && idx >= 2 && idx <= 4) {
                bg = '#BA7517';
              }
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div className="di-box" style={{ width: '45px', height: '45px', background: bg }}>{val}</div>
                  <small style={{ color: 'var(--text-muted)' }}>V[{idx}]</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="di-controls" style={{ marginTop: '25px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}