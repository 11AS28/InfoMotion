import React, { useState } from 'react';

export default function VerificarePrimAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      desc: "1. Vrem să verificăm dacă N = 37 este prim. Începem prin a trata cazurile de bază (pare).",
      n: 37, d: 2, status: "Verificare...",
      check: "37 % 2 != 0", highlight: "even"
    },
    {
      desc: "2. N este impar. Începem căutarea divizorilor de la d = 3. Condiția de parcurgere: d * d <= 37.",
      n: 37, d: 3, status: "Verificare...",
      check: "3 * 3 = 9 (<= 37) ✅", highlight: 3
    },
    {
      desc: "3. 37 nu se divide la 3. Trecem la următorul divizor impar: d = 5.",
      n: 37, d: 5, status: "Verificare...",
      check: "5 * 5 = 25 (<= 37) ✅", highlight: 5
    },
    {
      desc: "4. 37 nu se divide la 5. Încercăm d = 7.",
      n: 37, d: 7, status: "Verificare...",
      check: "7 * 7 = 49 (> 37) 🛑 STOP!", highlight: 7
    },
    {
      desc: "5. OPTIMIZARE: Deoarece 7 * 7 a depășit 37, este imposibil să mai găsim divizori. Ne oprim.",
      n: 37, d: 7, status: "ESTE PRIM",
      check: "Nu s-au găsit divizori.", highlight: -1
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const current = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Testul de Primalitate</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{current.desc}</p>
      
      <div className="di-visual" style={{ marginBottom: '30px' }}>
        {/* Modificare AICI: flexWrap pentru mobil */}
        <div style={{ 
            display: 'flex', 
            gap: '15px', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexWrap: 'wrap' // Permite trecerea pe alt rând pe ecrane mici
        }}>
          <div className="di-box" style={{ 
              width: '120px', 
              maxWidth: '100%', 
              backgroundColor: '#1e293b', 
              border: '2px solid #3b82f6' 
          }}>
            N = {current.n}
          </div>
          
          <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>➔</div>
          
          <div className="di-box" style={{ 
              width: '200px', 
              maxWidth: '100%', // Permite micșorarea dacă ecranul e prea mic
              backgroundColor: current.status === "ESTE PRIM" ? '#639922' : '#BA7517',
              transition: 'all 0.3s'
          }}>
            {current.status}
          </div>
        </div>

        <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            borderRadius: '8px', 
            background: 'var(--bg-subtle)', 
            border: '1px solid #4a5568',
            width: '100%',
            boxSizing: 'border-box',
            wordWrap: 'break-word' // Previne textul care iese din casetă
        }}>
            <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                Verificare curentă: <br/><strong style={{color: 'var(--accent)'}}>{current.check}</strong>
            </p>
        </div>
      </div>

      <div className="di-controls" style={{ flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
