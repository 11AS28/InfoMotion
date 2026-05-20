import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function MergeSortAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      type: "init",
      v: [38, 27, 43, 3],
      leftArr: [38, 27],
      rightArr: [43, 3],
      temp: [],
      desc: "1. DIVIDE: Începem cu vectorul nesortat [38, 27, 43, 3]. Algoritmul îl împarte mai întâi în două jumătăți mari: stânga [38, 27] și dreapta [43, 3]."
    },
    {
      type: "divide-deep-left",
      v: [38, 27, 43, 3],
      leftArr: [38],
      rightArr: [27],
      temp: [],
      desc: "2. DIVIDE PROFUND (Stânga): Luăm jumătatea stângă [38, 27] și o împărțim din nou până ajungem la elemente unice: [38] și [27]. Deoarece au lungime 1, sunt sortate."
    },
    {
      type: "merge-left",
      v: [27, 38, 43, 3],
      leftArr: [27, 38],
      rightArr: [43, 3],
      temp: [27, 38],
      desc: "3. COMBINĂ (Stânga): Interclasăm elementele [38] și [27]. Comparăm 27 cu 38, deci 27 se pune primul. Am obținut prima sub-secvență sortată: [27, 38]."
    },
    {
      type: "divide-deep-right",
      v: [27, 38, 43, 3],
      leftArr: [43],
      rightArr: [3],
      temp: [],
      desc: "4. DIVIDE PROFUND (Dreapta): Trecem la cealaltă jumătate mare, [43, 3]. O spargem și pe ea în elemente individuale de lungime 1: [43] și [3]."
    },
    {
      type: "merge-right",
      v: [27, 38, 3, 43],
      leftArr: [27, 38],
      rightArr: [3, 43],
      temp: [3, 43],
      desc: "5. COMBINĂ (Dreapta): Interclasăm elementele [43] și [3]. Comparăm 3 cu 43, deci 3 se pune primul. Am obținut a doua sub-secvență sortată: [3, 43]."
    },
    {
      type: "final-merge-start",
      v: [27, 38, 3, 43],
      leftArr: [27, 38],
      rightArr: [3, 43],
      temp: [3],
      desc: "6. INTERCLASARE FINALĂ (Pasul A): Acum combinăm cele două sub-secvențe sortate: [27, 38] și [3, 43]. Comparăm primele elemente: 27 cu 3. Deoarece 3 este mai mic, intră primul în vectorul temporar."
    },
    {
      type: "final-merge-continue",
      v: [27, 38, 3, 43],
      leftArr: [27, 38],
      rightArr: [3, 43],
      temp: [3, 27, 38],
      desc: "7. INTERCLASARE FINALĂ (Pasul B): Urmează compararea lui 27 din stânga cu 43 din dreapta. Intră 27, apoi 38 fiindcă este mai mic decât 43. În final, rămâne doar 43 în dreapta și este copiat."
    },
    {
      type: "final",
      v: [3, 27, 38, 43],
      leftArr: [],
      rightArr: [],
      temp: [],
      desc: "8. REZULTAT FINAL: Vectorul temporar complet format [3, 27, 38, 43] este copiat înapoi în vectorul original. Toate elementele sunt acum sortate în timp O(N log N)."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație Detaliată: Merge Sort Pas cu Pas</h3>
      <p className="di-desc" style={{ minHeight: '75px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' }}>
        
        {/* Vizualizare impartire pe sub-vectori */}
        {cur.type !== "final" && cur.leftArr.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            {/* Sub-vectorul Stang */}
            <div style={{ display: 'flex', gap: '5px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
              {cur.leftArr.map((val, idx) => (
                <div key={idx} className="di-box" style={{ width: '45px', height: '45px', background: cur.type.includes('left') ? '#BA7517' : '#1e293b' }}>
                  {val}
                </div>
              ))}
            </div>

            <div style={{ width: '20px' }}></div>

            {/* Sub-vectorul Drept */}
            <div style={{ display: 'flex', gap: '5px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
              {cur.rightArr.map((val, idx) => (
                <div key={idx} className="di-box" style={{ width: '45px', height: '45px', background: cur.type.includes('right') ? '#BA7517' : '#1e293b' }}>
                  {val}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zona de Interclasare Temporara (Apare doar cand se combina elemente) */}
        {cur.temp.length > 0 && (
          <div style={{ width: '100%', maxWidth: '320px', padding: '12px', background: 'rgba(99, 153, 34, 0.15)', border: '2px dashed #8cd932', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#8cd932', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vectorul Temporar (temp):</span>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {cur.temp.map((val, idx) => (
                <div key={idx} className="di-box" style={{ width: '40px', height: '40px', background: '#639922', fontSize: '0.9rem' }}>{val}</div>
              ))}
            </div>
          </div>
        )}

        {/* Vectorul Principal / Starea Memoriei */}
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Starea curentă a vectorului în memorie:</span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {cur.v.map((val, idx) => (
              <div key={idx} className="di-box" style={{ 
                width: '45px', 
                height: '45px', 
                background: cur.type === "final" ? '#639922' : 'var(--bg-subtle)',
                border: cur.type === "final" ? '2px solid #8cd932' : '1px solid #4a5568',
                fontWeight: 'bold'
              }}>
                {val}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="di-controls" style={{ marginTop: '30px' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
