import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function StructuriNeomogeneAnim() {
  const [step, setStep] = useState(0);

  const stages = [
    {
      action: "Declaram structura",
      code: "struct Elev { char nume[30]; int varsta; float medie; };\nElev e;",
      desc: "1. DECLARARE: Am definit un șablon nou numit 'Elev' ce poate ține un șir de caractere, un întreg și un număr real. Apoi am creat cutia goală 'e' de tipul 'Elev'.",
      state: { nume: "...", varsta: "...", medie: "..." },
      activeField: "none"
    },
    {
      action: "Adăugăm Numele",
      code: "strcpy(e.nume, \"Alexandru\");",
      desc: "2. ACCESARE NUME: Folosind operatorul punct (.) accesăm exclusiv câmpul 'nume' al variabilei 'e' și îi introducem textul \"Alexandru\".",
      state: { nume: "\"Alexandru\"", varsta: "...", medie: "..." },
      activeField: "nume"
    },
    {
      action: "Adăugăm Vârsta",
      code: "e.varsta = 16;",
      desc: "3. ACCESARE VÂRSTĂ: Prin 'e.varsta' intrăm în secțiunea destinată numărului întreg și stocăm valoarea 16.",
      state: { nume: "\"Alexandru\"", varsta: "16", medie: "..." },
      activeField: "varsta"
    },
    {
      action: "Adăugăm Media",
      code: "e.medie = 9.85;",
      desc: "4. ACCESARE MEDIE: Prin 'e.medie' completăm ultimul sertar al structurii cu valoarea de tip float 9.85.",
      state: { nume: "\"Alexandru\"", varsta: "16", medie: "9.85" },
      activeField: "medie"
    },
    {
      action: "Copiere Structură",
      code: "Elev e2;\ne2 = e;",
      desc: "5. ATRIBUIRE: Am creat un nou elev 'e2'. Cu instrucțiunea 'e2 = e' TOATE câmpurile (nume, varsta, medie) sunt copiate simultan în noua variabilă. Nu e nevoie să copiem element cu element!",
      state: { nume: "\"Alexandru\"", varsta: "16", medie: "9.85" }, // Arătăm tot elevul gata
      showE2: true,
      activeField: "all"
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const reset = () => setStep(0);

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Structuri de Date (struct)</h3>
      <p className="di-desc" style={{ minHeight: '85px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        
        {/* Codul C++ care rulează în fundal */}
        <div style={{ 
          background: '#1e293b', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          fontFamily: 'monospace',
          borderLeft: '4px solid #3b82f6',
          width: '100%',
          maxWidth: '500px',
          boxSizing: 'border-box'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 5px 0' }}>Cod curent executat:</p>
          <pre style={{ margin: 0, color: '#8cd932', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
            {cur.code}
          </pre>
        </div>

        {/* Zona vizuală cu "Cutiile" structurilor */}
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          {/* CUTIA Elevului E1 */}
          <div style={{
            border: cur.activeField === "all" ? '2px dashed #9b5de5' : '2px solid #4a5568',
            borderRadius: '12px',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.03)',
            minWidth: '220px',
            boxSizing: 'border-box'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#60a5fa' }}>
              Elev e
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                padding: '10px', background: cur.activeField === 'nume' || cur.activeField === 'all' ? '#BA7517' : '#2d3748', 
                borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between',
                transition: 'background 0.3s ease'
              }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>char nume[30]</span>
                <strong>{cur.state.nume}</strong>
              </div>

              <div style={{ 
                padding: '10px', background: cur.activeField === 'varsta' || cur.activeField === 'all' ? '#BA7517' : '#2d3748', 
                borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between',
                transition: 'background 0.3s ease'
              }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>int varsta</span>
                <strong>{cur.state.varsta}</strong>
              </div>

              <div style={{ 
                padding: '10px', background: cur.activeField === 'medie' || cur.activeField === 'all' ? '#BA7517' : '#2d3748', 
                borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between',
                transition: 'background 0.3s ease'
              }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>float medie</span>
                <strong>{cur.state.medie}</strong>
              </div>
            </div>
          </div>

          {/* CUTIA Elevului E2 (Vizibilă doar la pasul final) */}
          {cur.showE2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', color: '#9b5de5', fontSize: '2rem' }}>
                ➡
              </div>
              <div style={{
                border: '2px solid #9b5de5',
                borderRadius: '12px',
                padding: '15px',
                background: 'rgba(155, 93, 229, 0.1)',
                minWidth: '220px',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.5s ease'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#9b5de5' }}>
                  Elev e2
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px', background: '#2d3748', borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>char nume[30]</span>
                    <strong>{cur.state.nume}</strong>
                  </div>
                  <div style={{ padding: '10px', background: '#2d3748', borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>int varsta</span>
                    <strong>{cur.state.varsta}</strong>
                  </div>
                  <div style={{ padding: '10px', background: '#2d3748', borderRadius: '6px', border: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>float medie</span>
                    <strong>{cur.state.medie}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

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
