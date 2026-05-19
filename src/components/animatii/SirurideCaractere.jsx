import React, { useState } from 'react';
import '../animatii_css/divideAnim.css'; // Refolosim clasele tale generice

export default function LungimeSirAnim() {
  const [step, setStep] = useState(0);

  // Șirul din memorie: "INFO" urmat de '\0' și alte caractere random (gunoi de memorie)
  const stages = [
    {
      desc: "1. Inițializare. Avem șirul s = \"INFO\". În memorie, caracterele sunt memorate pe poziții consecutive, iar la final se pune automat caracterul nul '\\0' ca terminator de șir.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: -1,
      lungime: 0,
      highlightBox: -1,
      finished: false
    },
    {
      desc: "2. Verificăm s[0] ('I'). Nu este '\\0', deci este un caracter valid din șir. Incrementăm lungimea: lungime = 1.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: 0,
      lungime: 1,
      highlightBox: 0,
      finished: false
    },
    {
      desc: "3. Trecem la s[1] ('N'). Nu este '\\0'. Incrementăm lungimea: lungime = 2.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: 1,
      lungime: 2,
      highlightBox: 1,
      finished: false
    },
    {
      desc: "4. Trecem la s[2] ('F'). Nu este '\\0'. Incrementăm lungimea: lungime = 3.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: 2,
      lungime: 3,
      highlightBox: 2,
      finished: false
    },
    {
      desc: "5. Trecem la s[3] ('O'). Nu este '\\0'. Incrementăm lungimea: lungime = 4.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: 3,
      lungime: 4,
      highlightBox: 3,
      finished: false
    },
    {
      desc: "6. Ajungem la s[4] ('\\0'). Atenție! S-a întâlnit caracterul nul. Condiția s[i] != '\\0' devine FALSĂ. Bucla se oprește AICI!",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: 4,
      lungime: 4,
      highlightBox: 4, // Evidențiem terminatorul de șir
      finished: true
    },
    {
      desc: "7. FINAL! Funcția returnează valoarea 4. Caracterele de după '\\0' (gunoiul din memorie) sunt complet ignorate de program.",
      vector: ['I', 'N', 'F', 'O', '\\0', '?', '?'],
      currentIndex: -1,
      lungime: 4,
      highlightBox: -1,
      finished: true
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const currentStage = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Cum funcționează lungimea unui șir (strlen)</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{currentStage.desc}</p>
      
      <div className="di-visual">
        {/* Folosim flexWrap pentru ca elementele array-ului să coboare pe rândul următor pe ecrane mici */}
        <div className="di-array" style={{ border: 'none', background: 'transparent', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {currentStage.vector.map((char, idx) => {
            let boxStyle = {};
            
            if (idx === currentStage.highlightBox) {
              if (char === '\\0') {
                // Terminatorul de șir o să fie roșu/coral ca să bată la ochi că e stop
                boxStyle = { backgroundColor: '#c93b3b', border: '2px solid #ff6b6b', transform: 'scale(1.1)', color: '#fff' };
              } else {
                // Caracterul valid curent procesat e verde
                boxStyle = { backgroundColor: '#639922', border: '2px solid #8cd932', transform: 'scale(1.1)', color: '#fff' };
              }
            } else if (idx === currentStage.currentIndex) {
               boxStyle = { backgroundColor: '#BA7517', border: '2px solid #ffb347', color: '#fff' };
            } else if (idx < currentStage.currentIndex && currentStage.currentIndex !== -1) {
               // Cele verificate deja devin discrete
               boxStyle = { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', opacity: 0.6 };
            } else if (char === '\\0') {
               // Stil implicit discret pentru terminator când nu e selectat
               boxStyle = { backgroundColor: '#4a2323', border: '1px dashed #c93b3b', color: '#ff6b6b' };
            } else if (char === '?') {
               // Zona de memorie nefolosită (gunoi)
               boxStyle = { backgroundColor: '#2d3748', color: '#718096', border: '1px dotted #4a5568' };
            }

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="di-box" style={{ ...boxStyle, width: '55px', height: '55px', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  {char}
                </div>
                <small style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  s[{idx}]
                </small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Afișarea contorului/lungimii cu aspect flexibil */}
      <div style={{ marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <div>
          Variabila <code style={{ color: '#639922', backgroundColor: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>lungime = {currentStage.lungime}</code>
        </div>
        {/* Mesajul de terminare pus pe un rând separat pentru a preveni coliziunea pe ecrane mici */}
        <div style={{ minHeight: '24px' }}>
          {currentStage.finished && <span style={{ color: currentStage.highlightBox === 4 ? '#ff6b6b' : '#8cd932', fontSize: '1rem' }}>{currentStage.highlightBox === 4 ? "🛑 Condiție s[i] != '\\0' FALSĂ!" : "✓ Gata!"}</span>}
        </div>
      </div>

      <div className="di-controls" style={{ flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
        <button onClick={reset} className="btn-reset" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}>Reset</button>
      </div>
    </div>
  );
}