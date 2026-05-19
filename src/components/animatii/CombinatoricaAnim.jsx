import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function StirlingAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      desc: "1. OBIECTIV: Vrem să calculăm S(4, 2), adică numărul de moduri în care putem împărți 4 elemente distincte {1, 2, 3, 4} în fix 2 cutii (submulțimi) nevide.",
      formula: "S(n, k) = S(n-1, k-1) + k * S(n-1, k)",
      boxes: [
        { label: "Cutia 1", items: [] },
        { label: "Cutia 2", items: [] }
      ],
      currentN: 4,
      pool: [1, 2, 3, 4],
      activeCase: "none"
    },
    {
      desc: "2. Recurența zice să izolăm ultimul element (4). Avem Cazul A: Numărul 4 stă singur în propria sa cutie. Asta înseamnă că elementele {1, 2, 3} trebuie să încapă în o singură cutie rămasă: S(3, 1).",
      formula: "Cazul A: S(n-1, k-1) = S(3, 1)",
      boxes: [
        { label: "Cutia 1", items: [1, 2, 3], bg: '#3b82f6' },
        { label: "Cutia 2", items: [4], bg: '#BA7517' } // 4 e izolat
      ],
      currentN: 4,
      pool: [],
      activeCase: "A"
    },
    {
      desc: "3. Câte posibilități avem pentru Cazul A? Păi S(3, 1) = 1 singură posibilitate. Toate elementele {1,2,3} trebuie puse forțat în Cutia 1, iar 4 stă în Cutia 2.",
      formula: "S(3, 1) = 1 posibilitate",
      boxes: [
        { label: "Cutia 1", items: [1, 2, 3], bg: '#3b82f6' },
        { label: "Cutia 2", items: [4], bg: '#BA7517' }
      ],
      currentN: 4,
      pool: [],
      activeCase: "A-result"
    },
    {
      desc: "4. Cazul B: Elementul (4) se amestecă cu celelalte. Asta înseamnă că {1, 2, 3} s-au împărțit deja în cele 2 cutii (adică S(3, 2)). Iar apoi, elementul 4 alege în care din cele 2 cutii să intre!",
      formula: "Cazul B: k * S(n-1, k) = 2 * S(3, 2)",
      boxes: [
        { label: "Cutia 1", items: [1, 2], bg: '#1e293b' },
        { label: "Cutia 2", items: [3], bg: '#1e293b' },
        { label: "Unde îl punem pe 4?", items: [4], bg: '#c93b3b', isFloating: true }
      ],
      currentN: 4,
      pool: [],
      activeCase: "B"
    },
    {
      desc: "5. S(3, 2) reprezintă felul în care {1,2,3} s-au putut împărți în 2 cutii. Sunt 3 moduri posibile: [{1,2}, {3}], [{1,3}, {2}], [{2,3}, {1}]. Elementul 4 având 2 alegeri de cutii pentru FIECARE mod -> 2 * 3 = 6 posibilități.",
      formula: "2 * S(3, 2) = 2 * 3 = 6 posibilități",
      boxes: [
        { label: "Poate intra aici...", items: [1, 2, "+ 4"], bg: '#639922' },
        { label: "Sau poate intra aici...", items: [3, "+ 4"], bg: '#639922' }
      ],
      currentN: 4,
      pool: [],
      activeCase: "B-result"
    },
    {
      desc: "6. REZULTAT FINAL: S(4, 2) = Cazul A (1 posibilitate) + Cazul B (6 posibilități) = 7 posibilități distincte de a partiționa 4 elemente în 2 cutii nevide!",
      formula: "S(4, 2) = S(3, 1) + 2 * S(3, 2) = 1 + 6 = 7",
      boxes: [
        { label: "Total variante obținute", items: ["7 partiții Stirling"], bg: '#BA7517' }
      ],
      currentN: 4,
      pool: [],
      activeCase: "final"
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Numerele lui Stirling S(n, k)</h3>
      <p className="di-desc" style={{ minHeight: '95px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
        
        {/* Panou Formula */}
        <div style={{ 
          background: '#1e293b', padding: '10px 20px', borderRadius: '8px', 
          fontFamily: 'monospace', borderLeft: '4px solid #9b5de5',
          width: '100%', maxWidth: '450px', textAlign: 'center', boxSizing: 'border-box'
        }}>
          <strong style={{ color: '#8cd932', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>{cur.formula}</strong>
        </div>

        {/* Zona Elementelor libere */}
        {cur.pool.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {cur.pool.map((el, i) => (
              <div key={i} className="di-box" style={{ background: '#4a5568', width: '40px', height: '40px', borderRadius: '50%' }}>
                {el}
              </div>
            ))}
          </div>
        )}

        {/* Cutiile (Partitiile) */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {cur.boxes.map((box, idx) => (
            <div key={idx} style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                transform: box.isFloating ? 'translateY(-15px)' : 'none',
                transition: 'transform 0.3s ease'
            }}>
              <div style={{ 
                  width: '120px', minHeight: '80px', 
                  border: `3px dashed ${box.bg || '#64748b'}`,
                  borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  flexWrap: 'wrap', gap: '5px', padding: '10px'
              }}>
                {box.items.map((item, idItem) => (
                  <div key={idItem} className="di-box" style={{ 
                      background: box.bg || '#3b82f6', width: item.toString().includes('partiții') ? 'auto' : '35px', 
                      height: item.toString().includes('partiții') ? 'auto' : '35px', 
                      borderRadius: item.toString().includes('partiții') ? '8px' : '50%', padding: item.toString().includes('partiții') ? '10px' : '0',
                      fontSize: item.toString().includes('partiții') ? '1rem' : '1.1rem'
                  }}>
                    {item}
                  </div>
                ))}
                {box.items.length === 0 && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(gol)</span>}
              </div>
              <small style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{box.label}</small>
            </div>
          ))}
        </div>
        
      </div>

      <div className="di-controls" style={{ marginTop: '30px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}>Reset</button>
      </div>
    </div>
  );
}