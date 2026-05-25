import React, { useState } from 'react';

export default function VerificarePrimAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      desc: '1. Vrem să verificăm dacă N = 37 este prim. Începem prin a trata cazurile de bază.',
      n: 37,
      d: 2,
      status: 'Verificare...',
      check: '37 % 2 != 0',
      highlight: 2
    },
    {
      desc: '2. N este impar. Începem căutarea divizorilor de la d = 3. Condiția este d * d <= 37.',
      n: 37,
      d: 3,
      status: 'Verificare...',
      check: '3 * 3 = 9 (<= 37) ✅',
      highlight: 3
    },
    {
      desc: '3. 37 nu se divide la 3. Trecem la următorul divizor impar: d = 5.',
      n: 37,
      d: 5,
      status: 'Verificare...',
      check: '37 % 3 != 0, deci încercăm d = 5',
      highlight: 5
    },
    {
      desc: '4. 37 nu se divide la 5. Încercăm d = 7.',
      n: 37,
      d: 7,
      status: 'Verificare...',
      check: '7 * 7 = 49 (> 37) 🛑 STOP!',
      highlight: 7
    },
    {
      desc: '5. Deoarece 7 * 7 a depășit 37, ne oprim. Nu s-a găsit niciun divizor.',
      n: 37,
      d: 7,
      status: 'ESTE PRIM',
      check: 'Nu s-au găsit divizori.',
      highlight: -1
    }
  ];

  const current = stages[step];

  const nextStep = () => {
    if (step < stages.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const testedDivisors = [2, 3, 5, 7];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Testul de Primalitate</h3>

      <p className="di-desc" style={{ minHeight: '60px' }}>
        {current.desc}
      </p>

      <div className="di-visual" style={{ marginBottom: '30px' }}>
        <div
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div
            className="di-box"
            style={{
              width: '120px',
              maxWidth: '100%',
              backgroundColor: '#1e293b',
              border: '2px solid #3b82f6'
            }}
          >
            N = {current.n}
          </div>

          <div
            className="di-box"
            style={{
              width: '120px',
              maxWidth: '100%',
              backgroundColor: '#BA7517',
              border: '2px solid #ffb347'
            }}
          >
            d = {current.d}
          </div>

          <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>➔</div>

          <div
            className="di-box"
            style={{
              width: '200px',
              maxWidth: '100%',
              backgroundColor: current.status === 'ESTE PRIM' ? '#639922' : '#BA7517',
              transition: 'all 0.3s'
            }}
          >
            {current.status}
          </div>
        </div>

        <div
          style={{
            marginTop: '28px',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              marginBottom: '10px'
            }}
          >
            DIVIZORI TESTAȚI:
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {testedDivisors.map((value) => {
              const isActive = current.highlight === value;
              const isChecked = value < current.d || (value === 2 && current.d > 2);

              return (
                <div
                  key={value}
                  style={{
                    minWidth: '58px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    backgroundColor: isActive ? '#BA7517' : isChecked ? '#334155' : '#1e293b',
                    color: '#fff',
                    border: isActive ? '2px solid #ffb347' : '1px solid #4a5568',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: current.highlight === -1 ? 0.85 : 1
                  }}
                >
                  d={value}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            borderRadius: '8px',
            background: 'var(--bg-subtle)',
            border: '1px solid #4a5568',
            width: '100%',
            boxSizing: 'border-box',
            wordWrap: 'break-word'
          }}
        >
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.95rem' }}>
            Verificare curentă: <br />
            <strong style={{ color: 'var(--accent)' }}>{current.check}</strong>
          </p>
        </div>
      </div>

      <div className="di-controls" style={{ flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">
          Înapoi
        </button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">
          Pasul Următor
        </button>
      </div>
    </div>
  );
}