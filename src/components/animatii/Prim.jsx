import React, { useState } from 'react';
import '../animatii_css/prim.css';

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
      check: '3 * 3 = 9 (<= 37) ',
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
      check: '7 * 7 = 49 (> 37)  STOP!',
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
  const testedDivisors = [2, 3, 5, 7];

  const nextStep = () => {
    if (step < stages.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="di-container prim-anim-container">
      <h3 className="di-title">Animație: Testul de Primalitate</h3>

      <p className="di-desc prim-desc">
        {current.desc}
      </p>

      <div className="di-visual prim-visual">
        <div className="prim-top-row">
          <div className="di-box prim-box prim-box-n">
            N = {current.n}
          </div>

          <div className="di-box prim-box prim-box-d">
            d = {current.d}
          </div>

          <div className="prim-arrow">➔</div>

          <div
            className={`di-box prim-box prim-box-status ${
              current.status === 'ESTE PRIM' ? 'prime' : 'checking'
            }`}
          >
            {current.status}
          </div>
        </div>

        <div className="prim-tested-zone">
          <p className="prim-tested-label">DIVIZORI TESTAȚI:</p>

          <div className="prim-tested-list">
            {testedDivisors.map((value) => {
              const isActive = current.highlight === value;
              const isChecked = value < current.d || (value === 2 && current.d > 2);

              return (
                <div
                  key={value}
                  className={`prim-tested-item ${isChecked ? 'checked' : ''} ${isActive ? 'active' : ''} ${current.highlight === -1 ? 'dimmed' : ''}`}
                >
                  d={value}
                </div>
              );
            })}
          </div>
        </div>

        <div className="prim-check-box">
          <p className="prim-check-text">
            Verificare curentă:
            <br />
            <strong className="prim-check-value">{current.check}</strong>
          </p>
        </div>
      </div>

      <div className="di-controls prim-controls">
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