import React, { useState, useEffect } from 'react';
import '../animatii_css/interclasareAnim.css';

const A_INITIAL = [1, 3, 5, 8];
const B_INITIAL = [2, 4, 6, 7, 9];

export default function InterclasareAnim() {
  const [a] = useState(A_INITIAL);
  const [b] = useState(B_INITIAL);
  const [c, setC] = useState([]);
  
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [comparing, setComparing] = useState(false);

  const stepForward = () => {
    if (isFinished) return;
    
    setComparing(true);
    
    setTimeout(() => {
      setComparing(false);
      let newC = [...c];
      
      if (idxA < a.length && idxB < b.length) {
        if (a[idxA] < b[idxB]) {
          newC.push(a[idxA]);
          setIdxA(idxA + 1);
        } else {
          newC.push(b[idxB]);
          setIdxB(idxB + 1);
        }
      } else if (idxA < a.length) {
        newC.push(a[idxA]);
        setIdxA(idxA + 1);
      } else if (idxB < b.length) {
        newC.push(b[idxB]);
        setIdxB(idxB + 1);
      }
      
      setC(newC);
      
      if (newC.length === a.length + b.length) {
        setIsFinished(true);
      }
    }, 600); // Timp ca sa vadă elevul comparația roșie
  };

  const resetAnim = () => {
    setC([]);
    setIdxA(0);
    setIdxB(0);
    setIsFinished(false);
    setComparing(false);
  };

  return (
    <div className="interclasare-container">
      <h3>Algoritmul de Interclasare</h3>
      <p className="inter-info">
        Comparați <strong>A[i]</strong> cu <strong>B[j]</strong>. Valoarea mai mică intră în <strong>C</strong>.
      </p>

      <div className="arrays-top">
        {/* Vectorul A */}
        <div className="array-wrapper">
          <div className="array-title">Vectorul A (indice i={idxA})</div>
          <div className="array-boxes">
            {a.map((val, i) => (
              <div 
                key={`a-${i}`} 
                className={`inter-box ${i === idxA ? (comparing ? 'compare-active' : 'current-pointer') : ''} ${i < idxA ? 'box-used' : ''}`}
              >
                {val}
                {i === idxA && <div className="pointer-label">i</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Vectorul B */}
        <div className="array-wrapper">
          <div className="array-title">Vectorul B (indice j={idxB})</div>
          <div className="array-boxes">
            {b.map((val, j) => (
              <div 
                key={`b-${j}`} 
                className={`inter-box ${j === idxB ? (comparing ? 'compare-active' : 'current-pointer') : ''} ${j < idxB ? 'box-used' : ''}`}
              >
                {val}
                {j === idxB && <div className="pointer-label">j</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vectorul C (Destinația) */}
      <div className="array-bottom">
        <div className="array-title" style={{ color: 'var(--accent)' }}>Vectorul Destinație C (indice k={c.length})</div>
        <div className="array-boxes">
          {c.length === 0 && <span style={{color: '#888', fontStyle: 'italic'}}>Așteaptă elemente...</span>}
          {c.map((val, k) => (
            <div key={`c-${k}`} className="inter-box box-result pop-in">
              {val}
            </div>
          ))}
        </div>
      </div>

      <div className="inter-controls">
        <button className="btn-inter-step" onClick={stepForward} disabled={isFinished || comparing}>
          {isFinished ? 'Finalizat!' : 'Următorul Pas'}
        </button>
        <button className="btn-inter-reset" onClick={resetAnim}>Reset</button>
      </div>
    </div>
  );
}