import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function DivideAnim() {
  const [step, setStep] = useState(0);

  // Stările vectorului pe măsură ce este împărțit și apoi combinat (căutăm MAXIMUL)
  const stages = [
    { 
      desc: "1. Problema inițială: Găsește maximul în vectorul de 8 elemente.", 
      blocks: [[2, 12, 3, 0.2, 6, -1, 21, 4]] 
    },
    { 
      desc: "2. DIVIDE: Împărțim vectorul la jumătate (m = (p+u)/2).", 
      blocks: [[2, 12, 3, 0.2], [6, -1, 21, 4]] 
    },
    { 
      desc: "3. DIVIDE: Mai împărțim o dată fiecare jumătate.", 
      blocks: [[2, 12], [3, 0.2], [6, -1], [21, 4]] 
    },
    { 
      desc: "4. IMPERA: Am ajuns la probleme elementare (p == u). Dimensiune 1.", 
      blocks: [[2], [12], [3], [0.2], [6], [-1], [21], [4]] 
    },
    { 
      desc: "5. COMBINĂ: Urcăm înapoi. Comparăm vecinii 2 câte 2 și reținem maximul.", 
      blocks: [[12], [3], [6], [21]] 
    },
    { 
      desc: "6. COMBINĂ: Dintre cele obținute, iar comparăm perechile.", 
      blocks: [[12], [21]] 
    },
    { 
      desc: "7. REZULTAT FINAL: Am găsit maximul!", 
      blocks: [[21]] 
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Căutarea Maximului cu Divide et Impera</h3>
      <p className="di-desc">{stages[step].desc}</p>
      
      <div className="di-visual">
        {stages[step].blocks.map((arr, index) => (
          <div key={index} className={`di-array ${step >= 4 ? 'highlight' : ''}`}>
            {arr.map((num, idx) => (
              <div key={idx} className="di-box">{num}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="di-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset">Reset</button>
      </div>
    </div>
  );
}