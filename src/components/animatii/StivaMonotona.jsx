import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function StivaMonotonaAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      type: "init",
      v: [0, 15, 8, 12, 20],
      stiva: [],
      rez: [0, 0, 0, 0, 0],
      currIdx: 1,
      desc: "1. START: Analizăm vectorul [15, 8, 12, 20]. Începem cu elementul V[1]=15. Stiva este goală, deci nu avem ce curăța."
    },
    {
      type: "step-1",
      v: [0, 15, 8, 12, 20],
      stiva: [15],
      rez: [0, 0, 0, 0, 0],
      currIdx: 1,
      desc: "2. REZULTAT V[1]: Deoarece stiva era goală, rezultatul pentru 15 este 0 (nu are element mai mare în stânga). Adăugăm 15 în stivă."
    },
    {
      type: "step-2-scan",
      v: [0, 15, 8, 12, 20],
      stiva: [15],
      rez: [0, 0, 0, 0, 0],
      currIdx: 2,
      desc: "3. ANALIZĂ V[2]=8: În vârful stivei se află 15. Deoarece 15 este mai mare decât 8, nu eliminăm nimic din stivă. Stiva își păstrează structura."
    },
    {
      type: "step-2-res",
      v: [0, 15, 8, 12, 20],
      stiva: [15, 8],
      rez: [0, 0, 15, 0, 0],
      currIdx: 2,
      desc: "4. REZULTAT V[2]: Vârful stivei era 15, deci primul element mai mare din stânga lui 8 este 15. Îl salvăm în rezultate și adăugăm 8 în stivă."
    },
    {
      type: "step-3-pop",
      v: [0, 15, 8, 12, 20],
      stiva: [15],
      rez: [0, 0, 15, 0, 0],
      currIdx: 3,
      desc: "5. CURĂȚARE V[3]=12: În vârful stivei se află 8. Deoarece 8 este mai mic sau egal cu 12, acesta este eliminat din stivă (pop). În vârful stivei rămâne acum 15."
    },
    {
      type: "step-3-res",
      v: [0, 15, 8, 12, 20],
      stiva: [15, 12],
      rez: [0, 0, 15, 15, 0],
      currIdx: 3,
      desc: "6. REZULTAT V[3]: Noul vârf este 15, care e mai mare decât 12. Deci primul element mai mare din stânga lui 12 este 15. Îl salvăm și adăugăm 12 în stivă."
    },
    {
      type: "step-4-pop1",
      v: [0, 15, 8, 12, 20],
      stiva: [15],
      rez: [0, 0, 15, 15, 0],
      currIdx: 4,
      desc: "7. CURĂȚARE V[4]=20 (Pasul A): În vârful stivei se află 12. Deoarece 12 <= 20, îl eliminăm din stivă. Noul vârf devine 15."
    },
    {
      type: "step-4-pop2",
      v: [0, 15, 8, 12, 20],
      stiva: [],
      rez: [0, 0, 15, 15, 0],
      currIdx: 4,
      desc: "8. CURĂȚARE V[4]=20 (Pasul B): În vârf acum este 15. Deoarece 15 <= 20, îl eliminăm și pe el. Stiva a devenit complet goală!"
    },
    {
      type: "final",
      v: [0, 15, 8, 12, 20],
      stiva: [20],
      rez: [0, 0, 15, 15, 0],
      currIdx: 4,
      desc: "9. REZULTAT FINAL V[4]: Stiva fiind goală, rezultatul pentru 20 este 0. Adăugăm 20 în stivă. Am terminat complet parcurgerea vectorului în timp liniar."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație Detaliată: Stivă Monotonă</h3>
      <p className="di-desc" style={{ minHeight: '85px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {cur.v.slice(1).map((val, i) => {
            const realIdx = i + 1;
            let bg = 'var(--bg-subtle)';
            let border = '1px solid #4a5568';
            
            if (realIdx === cur.currIdx) {
              bg = '#3b82f6';
              border = '2px solid #60a5fa';
            }

            return (
              <div key={realIdx} style={{ textAlign: 'center', margin: '2px' }}>
                <div className="di-box" style={{ width: '45px', height: '45px', background: bg, border: border, fontWeight: 'bold' }}>
                  {val}
                </div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>v[{realIdx}]</small>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Starea Stivei (Vârf în sus):</span>
            <div style={{ 
              width: '80px', 
              minHeight: '120px', 
              borderLeft: '3px solid #cbd5e1', 
              borderRight: '3px solid #cbd5e1', 
              borderBottom: '3px solid #cbd5e1', 
              display: 'flex', 
              flexDirection: 'column-reverse', 
              gap: '5px', 
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.02)',
              margin: '0 auto' 
            }}>
              {cur.stiva.map((val, idx) => (
                <div key={idx} className="di-box" style={{ 
                  width: '100%', 
                  height: 'auto', 
                  minHeight: '25px', 
                  background: idx === cur.stiva.length - 1 ? '#BA7517' : '#1e293b',
                  fontSize: '0.85rem',
                  padding: '2px 0',
                  border: idx === cur.stiva.length - 1 ? '1px solid #ffb347' : '1px solid #4a5568'
                }}>
                  {val} {idx === cur.stiva.length - 1 ? "(Top)" : ""}
                </div>
              ))}
              {cur.stiva.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'normal', textAlign: 'center', marginTop: '45px' }}>Goală</div>
              )}
            </div>
          </div>

          {/* Rezultate Parbriz */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Vectorul Rezultat:</span>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {cur.rez.slice(1).map((val, i) => (
                <div key={i} className="di-box" style={{ width: '40px', height: '40px', background: '#2d3748', fontSize: '0.9rem', color: val > 0 ? '#8cd932' : 'var(--text-muted)', margin: '2px' }}>
                  {val}
                </div>
              ))}
            </div>
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
