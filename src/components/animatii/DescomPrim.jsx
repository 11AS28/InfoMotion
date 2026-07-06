import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function FactoriPrimiAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    { n: 60, d: 2, p: 0, res: "", desc: "1. Începem cu N = 60 și primul divizor d = 2." },
    { n: 30, d: 2, p: 1, res: "", desc: "2. 60 se împarte la 2. N devine 30, puterea p = 1." },
    { n: 15, d: 2, p: 2, res: "", desc: "3. 30 se împarte la 2. N devine 15, puterea p = 2." },
    { n: 15, d: 3, p: 0, res: "2^2", desc: "4. 15 nu se mai împarte la 2. Afișăm 2^2 și trecem la d = 3." },
    { n: 5, d: 3, p: 1, res: "2^2 * 3^1", desc: "5. 15 se împarte la 3. N devine 5, puterea p = 1. Afișăm 3^1." },
    { n: 5, d: 4, p: 0, res: "2^2 * 3^1", desc: "6. Trecem la d = 4. Dar 4 * 4 > 5. STOP buclă!" },
    { n: 5, d: 4, p: 0, res: "2^2 * 3^1 * 5^1", desc: "7. FINAL! Deoarece N a rămas 5 (număr prim), îl adăugăm la rezultat." }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Descompunere în Factori Primi</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="di-box" style={{ background: '#2d3748', width: '100px', maxWidth: '100%' }}>N = {cur.n}</div>
          <div className="di-box" style={{ background: '#BA7517', width: '100px', maxWidth: '100%' }}>d = {cur.d}</div>
          <div className="di-box" style={{ background: '#4a5568', width: '100px', maxWidth: '100%' }}>p = {cur.p}</div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          width: '100%',
          maxWidth: '400px'  
        }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px' }}>REZULTAT PARȚIAL:</p>
          <div style={{ 
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            fontWeight: 'bold', 
            color: '#8cd932', 
            fontFamily: 'monospace',
            padding: '15px',
            border: '2px dashed #8cd932',
            borderRadius: '10px',
            wordBreak: 'break-all' 
          }}>
            {cur.res || "..."}
          </div>
        </div>
      </div>

      <div className="di-controls" style={{ flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
