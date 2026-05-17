import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SumePartiale2DAnim() {
  const [step, setStep] = useState(0);

  // O matrice fictivă 3x3 (indexată de la 1 în reprezentare, punem padding vizual)
  const matrix = [
    [2, 3, 1],
    [4, 1, 5],
    [9, 2, 6]
  ];

  const stages = [
    {
      type: "init",
      desc: "1. Vrem să calculăm suma din submatricea marcată (zona portocalie), definită de x1=2, y1=2 și x2=3, y2=3."
    },
    {
      type: "total",
      desc: "2. Luăm valoarea din S[3][3] (toată matricea de la colțul 1,1 până la 3,3). Suma totală este 33."
    },
    {
      type: "sub-up",
      desc: "3. Excludem zona de sus: Scădem S[1][3] (adică elementele de pe prima linie: 2+3+1 = 6). Rămân doar liniile 2 și 3."
    },
    {
      type: "sub-left",
      desc: "4. Excludem zona din stânga: Scădem S[3][1] (prima coloană: 2+4+9 = 15)."
    },
    {
      type: "add-corner",
      desc: "5. Includem înapoi intersecția: Deoarece colțul S[1][1] (valoarea 2) a fost scăzut de două ori, îl adunăm înapoi. Rezultat final: 33 - 6 - 15 + 2 = 14."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  // Logica simplă de colorare a celulelor din matrice pentru animație
  const getCellBg = (r, c) => {
    if (cur.type === "init" && r >= 1 && c >= 1) return '#BA7517'; // submatricea țintă
    if (cur.type === "total") return '#639922'; // tot
    if (cur.type === "sub-up" && r === 0) return '#c93b3b'; // ce scădem sus
    if (cur.type === "sub-left" && c === 0) return '#c93b3b'; // ce scădem stânga
    if (cur.type === "add-corner" && r === 0 && c === 0) return '#3b82f6'; // colțul reparat
    return 'var(--bg-subtle)';
  };

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Sume Parțiale 2D (Includere / Excludere)</h3>
      <p className="di-desc" style={{ minHeight: '65px' }}>{cur.desc}</p>
      
      <div className="di-visual">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: '10px', justifyContent: 'center' }}>
          {matrix.map((row, rIdx) => 
            row.map((val, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`} 
                className="di-box" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: getCellBg(rIdx, cIdx),
                  transition: 'background 0.3s',
                  fontSize: '1.1rem'
                }}
              >
                {val}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Coordonate submatrice: <strong>(2,2) stânga-sus ➔ (3,3) dreapta-jos</strong>
        </div>
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}