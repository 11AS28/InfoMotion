import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function QuickSortAnimExtins() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      type: "init",
      v: [25, 12, 40, 7, 30],
      pivotIdx: 2,
      i: 0, j: 4,
      desc: "1. INIȚIALIZARE: Avem vectorul [25, 12, 40, 7, 30]. Alegem elementul din mijloc ca pivot: V[2] = 40. Indicatorul i pornește de la primul element (25), iar j de la ultimul (30)."
    },
    {
      type: "scan-i-1",
      v: [25, 12, 40, 7, 30],
      pivotIdx: 2,
      i: 1, j: 4,
      desc: "2. AVANS i (Pasul A): Deoarece V[0]=25 este mai mic decât pivotul (40), indicatorul i înaintează la poziția 1, unde valoarea este 12."
    },
    {
      type: "scan-i-2",
      v: [25, 12, 40, 7, 30],
      pivotIdx: 2,
      i: 2, j: 4,
      desc: "3. BLOCARE i (Pasul B): Deoarece V[1]=12 este mai mic decât pivotul (40), i înaintează din nou. Ajunge la poziția 2, unde valoarea este 40. Condiția V[i] < pivot devine falsă (40 nu este mai mic ca 40), deci i se oprește aici."
    },
    {
      type: "scan-j-1",
      v: [25, 12, 40, 7, 30],
      pivotIdx: 2,
      i: 2, j: 4,
      desc: "4. BLOCARE j: Privim indicatorul j. Valoarea V[4]=30 este mai mică decât pivotul (40). Condiția V[j] > pivot este falsă din start, deci j se oprește imediat la poziția 4."
    },
    {
      type: "swap-1",
      v: [25, 12, 30, 7, 40],
      pivotIdx: 4,
      i: 3, j: 3,
      desc: "5. SCHIMB (Swap): Deoarece i <= j (2 <= 4), inversăm elementele între ele: 40 se mută la final, iar 30 vine pe poziția 2. După swap, i crește la 3, iar j scade la 3."
    },
    {
      type: "scan-i-3",
      v: [25, 12, 30, 7, 40],
      pivotIdx: 4,
      i: 3, j: 3,
      desc: "6. VERIFICARE NOUĂ (i): La poziția i=3 avem valoarea 7. Deoarece 7 este mai mic decât pivotul (40), i ar vrea să înainteze, dar bucla principală reevaluează intersecția."
    },
    {
      type: "scan-j-2",
      v: [25, 12, 30, 7, 40],
      pivotIdx: 4,
      i: 3, j: 2,
      desc: "7. INTERSECȚIE DEFINITIVĂ: j scade de la poziția 3 la poziția 2 deoarece valoarea 7 nu este mai mare decât pivotul. În acest moment, i devine mai mare decât j (3 > 2), deci bucla de partiționare se oprește."
    },
    {
      type: "divide",
      v: [25, 12, 30, 7, 40],
      pivotIdx: 4,
      i: 3, j: 2,
      desc: "8. DIVIZARE ÎN SUB-PROBLEME: Vectorul s-a separat în mod corect în două zone independente: sub-vectorul din stânga [25, 12, 30, 7] (de la stânga la j) și cel din dreapta [40] (de la i la dreapta)."
    },
    {
      type: "final",
      v: [7, 12, 25, 30, 40],
      pivotIdx: -1,
      i: -1, j: -1,
      desc: "9. REZULTAT FINAL: Algoritmul aplică recursiv pașii de mai sus pe fiecare bucată rămasă. În final, toate elementele ajung reordonate crescător în mod direct."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație Extinsă: Quick Sort Pas cu Pas</h3>
      <p className="di-desc" style={{ minHeight: '85px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        
        <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',  
            width: '100%' 
        }}>
          {cur.v.map((val, idx) => {
            let bg = 'var(--bg-subtle)';
            let border = '1px solid #4a5568';
            
            if (idx === cur.pivotIdx) {
              bg = '#BA7517'; 
              border = '2px solid #ffb347';
            } else if (idx === cur.i && idx === cur.j) {
              bg = '#9b5de5'; 
              border = '2px solid #b583ff';
            } else if (idx === cur.i) {
              bg = '#3b82f6'; 
              border = '2px solid #60a5fa';
            } else if (idx === cur.j) {
              bg = '#c93b3b'; 
              border = '2px solid #ff6b6b';
            } else if (cur.type === "final") {
              bg = '#639922'; 
              border = '2px solid #8cd932';
            }

            return (
              <div key={idx} style={{ textAlign: 'center', margin: '5px' }}>
                <div className="di-box" style={{ width: '50px', height: '50px', background: bg, border: border, fontWeight: 'bold' }}>
                  {val}
                </div>
                {/* Etichete de indici dedesubt */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', minHeight: '18px' }}>
                  {idx === cur.pivotIdx ? "PIVOT " : ""}
                  {idx === cur.i ? "i " : ""}
                  {idx === cur.j ? "j" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panou informativ dinamic */}
        {cur.type !== "final" && cur.pivotIdx !== -1 && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)', 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '10px 20px', 
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            Valoare Pivot curent: <strong style={{ color: '#ffb347', fontSize: '1.1rem' }}>{cur.v[cur.pivotIdx]}</strong>
          </div>
        )}

      </div>

      <div className="di-controls" style={{ marginTop: '25px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
