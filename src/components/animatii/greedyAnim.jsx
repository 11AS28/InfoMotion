import React, { useState } from 'react';
import '../animatii_css/greedyAnim.css';

export default function GreedyAnim() {
  const [step, setStep] = useState(0);

  // Etapele animației pentru a plăti suma 38 folosind monede de 20, 10, 5, 1
  const stages = [
    { 
      desc: "1. Vrem să strângem suma de 38 RON. Suntem „lacomi”: începem cu cea mai mare monedă (20).", 
      sum: 38,
      wallet: [],
      coins: [20, 10, 5, 1],
      highlightIdx: 0
    },
    { 
      desc: "2. Încape o monedă de 20! O luăm. (38 - 20 = 18 RON rămași)", 
      sum: 18,
      wallet: [20],
      coins: [20, 10, 5, 1],
      highlightIdx: 0
    },
    { 
      desc: "3. Mai încape încă una de 20? Nu. Trecem la următoarea monedă: 10.", 
      sum: 18,
      wallet: [20],
      coins: [20, 10, 5, 1],
      highlightIdx: 1
    },
    { 
      desc: "4. Încape o monedă de 10! O luăm. (18 - 10 = 8 RON rămași)", 
      sum: 8,
      wallet: [20, 10],
      coins: [20, 10, 5, 1],
      highlightIdx: 1
    },
    { 
      desc: "5. Mai încape una de 10? Nu. Trecem la moneda de 5.", 
      sum: 8,
      wallet: [20, 10],
      coins: [20, 10, 5, 1],
      highlightIdx: 2
    },
    { 
      desc: "6. Încape o monedă de 5! O luăm. (8 - 5 = 3 RON rămași)", 
      sum: 3,
      wallet: [20, 10, 5],
      coins: [20, 10, 5, 1],
      highlightIdx: 2
    },
    { 
      desc: "7. Mai încape una de 5? Nu. Trecem la monedele de 1.", 
      sum: 3,
      wallet: [20, 10, 5],
      coins: [20, 10, 5, 1],
      highlightIdx: 3
    },
    { 
      desc: "8. Adăugăm prima monedă de 1. (3 - 1 = 2 RON rămași)", 
      sum: 2,
      wallet: [20, 10, 5, 1],
      coins: [20, 10, 5, 1],
      highlightIdx: 3
    },
    { 
      desc: "9. Adăugăm a doua monedă de 1. (2 - 1 = 1 RON rămas)", 
      sum: 1,
      wallet: [20, 10, 5, 1, 1],
      coins: [20, 10, 5, 1],
      highlightIdx: 3
    },
    { 
      desc: "10. Adăugăm ultima monedă de 1! Am strâns toți cei 38 RON folosind minimul de 6 monede.", 
      sum: 0,
      wallet: [20, 10, 5, 1, 1, 1],
      coins: [20, 10, 5, 1],
      highlightIdx: -1
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const current = stages[step];

  return (
    <div className="greedy-container">
      <h3 className="greedy-title">Animație: Plata Restului (Greedy)</h3>
      <p className="greedy-desc">{current.desc}</p>
      
      <div className="greedy-status-panel">
        <div className="greedy-sum-box">
          <span>Rest de plată:</span>
          <h2>{current.sum} RON</h2>
        </div>
      </div>

      <div className="greedy-workspace">
        <div className="greedy-coins-available">
          <h4>Monede disponibile:</h4>
          <div className="greedy-coin-list">
            {current.coins.map((c, idx) => (
              <div key={idx} className={`greedy-coin ${current.highlightIdx === idx ? 'active-coin' : ''}`}>
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="greedy-wallet">
          <h4>Portofelul nostru (Soluția):</h4>
          <div className="greedy-wallet-list">
            {current.wallet.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Gol momentan...</span>
            ) : (
              current.wallet.map((val, idx) => (
                <div key={idx} className="greedy-wallet-coin pop-anim">{val}</div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="greedy-controls">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset">Reset</button>
      </div>
    </div>
  );
}