import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function ProcesareCifreAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    { n: 427, uc: "-", suma: 0, ogl: 0, desc: "1. Start! Avem numărul N = 427. Inițializăm suma = 0 și oglindit = 0." },
    { n: 427, uc: "7", suma: 7, ogl: 7, desc: "2. Extragere: uc = 427 % 10 = 7. Adunăm la sumă (7) și punem în oglindit (0 * 10 + 7 = 7)." },
    { n: 42, uc: "7", suma: 7, ogl: 7, desc: "3. Tăiere: N devine 427 / 10 = 42. Trecem la pasul următor." },
    { n: 42, uc: "2", suma: 9, ogl: 72, desc: "4. Extragere: uc = 42 % 10 = 2. Suma devine 7 + 2 = 9. Oglindit devine 7 * 10 + 2 = 72." },
    { n: 4, uc: "2", suma: 9, ogl: 72, desc: "5. Tăiere: N devine 42 / 10 = 4." },
    { n: 4, uc: "4", suma: 13, ogl: 724, desc: "6. Extragere: uc = 4 % 10 = 4. Suma devine 9 + 4 = 13. Oglindit devine 72 * 10 + 4 = 724." },
    { n: 0, uc: "4", suma: 13, ogl: 724, desc: "7. Tăiere: N devine 4 / 10 = 0. Condiția (N > 0) devine FALSĂ!" },
    { n: 0, uc: "-", suma: 13, ogl: 724, desc: "8. FINAL! Bucla s-a oprit. Am obținut suma = 13 și oglinditul = 724." }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Descompunerea unui număr în cifre</h3>
      <p className="di-desc" style={{ minHeight: '60px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* N și u.c. - flexWrap pentru a se rupe pe ecrane foarte mici */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          <div className="di-box" style={{ background: cur.n === 0 ? '#c93b3b' : '#1e293b', width: 'auto', padding: '0 20px' }}>N = {cur.n}</div>
          <div className="di-box" style={{ background: '#BA7517', width: 'auto', padding: '0 20px' }}>u.c. = {cur.uc}</div>
        </div>

        {/* Variabilele calculate (Suma și Oglindit) */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SUMA:</p>
            <div className="di-box" style={{ background: '#2d3748', width: '120px', maxWidth: '100%' }}>{cur.suma}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>OGLINDIT:</p>
            <div className="di-box" style={{ background: '#639922', width: '120px', maxWidth: '100%' }}>{cur.ogl}</div>
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