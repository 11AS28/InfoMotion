import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function SumePartiale2DAnim() {
  const [step, setStep] = useState(0);

  const matrix = [
    [2, 3, 1],
    [4, 1, 5],
    [9, 2, 6]
  ];

  const stages = [
    {
      type: "init",
      desc: "1. ENUNȚ: Avem o matrice precalculată. Vrem să aflăm suma elementelor din submatricea definită de colțul stânga-sus (2,2) și dreptul-jos (3,3). Această zonă este marcată acum cu portocaliu."
    },
    {
      type: "step-all",
      desc: "2. PASUL 1 (S[x2][y2]): Pornim prin a lua toată valoarea acumulată din S[3][3], care însumează absolut toate elementele de la colțul (1,1) până la (3,3). Suma totală a acestei zone verzi mari este 33."
    },
    {
      type: "step-up",
      desc: "3. PASUL 2 (- S[x1-1][y2]): Trebuie să eliminăm elementele de deasupra submatricei noastre. Scădem zona roșie superioară S[1][3] (adică elementele de pe prima linie: 2 + 3 + 1 = 6)."
    },
    {
      type: "step-left",
      desc: "4. PASUL 3 (- S[x2][y1-1]): Trebuie să eliminăm și elementele din stânga submatricei noastre. Scădem zona roșie laterală S[3][1] (adică elementele de pe prima coloană: 2 + 4 + 9 = 15)."
    },
    {
      type: "step-corner",
      desc: "5. PASUL 4 (+ S[x1-1][y1-1]): Observăm că elementul din colțul stânga-sus, S[1][1] (valoarea 2), a fost inclus în ambele zone roșii șterse anterior. Înseamnă că l-am scăzut de două ori! Îl adunăm înapoi (zona albastră)."
    },
    {
      type: "step-final",
      desc: "6. REZULTAT FINAL: Aplicând întreaga formulă din cod, obținem: 33 (toată cutia) - 6 (sus) - 15 (stânga) + 2 (colțul adăugat înapoi) = 14. Am obținut rezultatul în O(1)."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const getCellBg = (r, c) => {
    if (stages[step].type === "init") {
      if (r >= 1 && c >= 1) return '#BA7517'; 
    }
    if (stages[step].type === "step-all") return '#639922'; 
    if (stages[step].type === "step-up" && r === 0) return '#c93b3b'; 
    if (stages[step].type === "step-left" && c === 0) return '#c93b3b'; 
    if (stages[step].type === "step-corner" && r === 0 && c === 0) return '#3b82f6'; 
    if (stages[step].type === "step-final") {
      if (r >= 1 && c >= 1) return '#639922';
    }
    return 'var(--bg-subtle)';
  };

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Sume Parțiale 2D Pas cu Pas</h3>
      <p className="di-desc" style={{ minHeight: '75px' }}>{stages[step].desc}</p>
      
      <div className="di-visual">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 55px)', gap: '10px', justifyContent: 'center' }}>
          {matrix.map((row, rIdx) => 
            row.map((val, cIdx) => (
              <div key={`${rIdx}-${cIdx}`} className="di-box" style={{ width: '55px', height: '55px', background: getCellBg(rIdx, cIdx), transition: 'background 0.2s' }}>
                {val}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}