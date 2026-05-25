import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function MatriciAnim() {
  const [step, setStep] = useState(0);

  const matrix = [
    [5, 2, 8, 1],
    [4, 9, 3, 7],
    [6, 1, 8, 2]
  ];

  const totalSum = matrix.flat().reduce((sum, value) => sum + value, 0);

  const stages = [
    {
      r: null,
      c: null,
      code: `int a[4][5]; // 3 linii, 4 coloane utile`,
      desc: `1. CE ESTE O MATRICE? Este un tablou bidimensional organizat pe linii și coloane. Aici avem o matrice cu 3 linii și 4 coloane.`
    },
    {
      r: 2,
      c: 3,
      code: `cout << a[2][3]; // Afiseaza 3`,
      desc: `2. COORDONATE: Pentru a accesa valoarea 3 de pe a doua linie folosim a[2][3]. Primul număr este linia, al doilea este coloana.`
    },
    {
      r: 1,
      c: null,
      code: `for(int i = 1; i <= n; i++)`,
      desc: `3. PARCURGERE: Bucla exterioară fixează linia. Acum i = 1, deci lucrăm pe primul rând al matricei.`
    },
    {
      r: 1,
      c: 2,
      code: `for(int j = 1; j <= m; j++) {
    cin >> a[i][j];
}`,
      desc: `4. COLOANELE: Bucla interioară parcurge coloanele. Pentru i = 1, j merge pe rând prin elementele liniei. Acum suntem la a[1][2].`
    },
    {
      r: 1,
      c: 4,
      code: `cout << endl;`,
      desc: `5. RÂND NOU: După ce terminăm toate coloanele de pe linia 1, trecem la o linie nouă la afișare.`
    },
    {
      r: 2,
      c: 1,
      code: `i++; // i devine 2
for(int j = 1; j <= m; j++)`,
      desc: `6. CONTINUARE: Trecem la linia următoare. i devine 2, iar j pornește din nou de la 1.`
    },
    {
      r: 'all',
      c: 'all',
      code: `suma = suma + a[i][j];`,
      desc: `7. PRELUCRARE: Dacă parcurgem toată matricea, putem prelucra fiecare element. De exemplu, suma tuturor valorilor este ${totalSum}.`
    }
  ];

  const currentStage = stages[step];

  const nextStep = () => {
    if (step < stages.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const getCellStyle = (realI, realJ) => {
    const isWholeMatrix = currentStage.r === 'all' && currentStage.c === 'all';
    const isExactCell = currentStage.r === realI && currentStage.c === realJ;
    const isRowHighlighted = currentStage.r === realI && currentStage.c === null;

    let background = 'var(--bg-subtle)';
    let border = '1px solid #4a5568';
    let transform = 'scale(1)';

    if (isWholeMatrix) {
      background = '#639922';
      border = '2px solid #8cd932';
    } else if (isExactCell) {
      background = '#BA7517';
      border = '2px solid #ffb347';
      transform = 'scale(1.08)';
    } else if (isRowHighlighted) {
      background = 'rgba(59, 130, 246, 0.35)';
      border = '1px dashed #60a5fa';
    }

    return {
      width: 'clamp(42px, 10vw, 56px)',
      height: 'clamp(42px, 10vw, 56px)',
      background,
      border,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.1rem',
      fontWeight: '700',
      borderRadius: '8px',
      transform,
      transition: 'all 0.3s ease',
      flexShrink: 0
    };
  };

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Matrici</h3>

      <p className="di-desc" style={{ minHeight: '88px' }}>
        {currentStage.desc}
      </p>

      <div
        className="di-visual"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div
          style={{
            background: '#1e293b',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            borderLeft: '4px solid #BA7517',
            width: '100%',
            maxWidth: '520px',
            boxSizing: 'border-box',
            minHeight: '74px'
          }}
        >
          <pre
            style={{
              margin: 0,
              color: '#8cd932',
              whiteSpace: 'pre-wrap',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)'
            }}
          >
            {currentStage.code}
          </pre>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'rgba(204, 22, 22, 0.02)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid #4a5568',
            maxWidth: '100%',
            overflowX: 'auto'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginLeft: '38px'
            }}
          >
            {[1, 2, 3, 4].map((j) => (
              <div
                key={`header-${j}`}
                style={{
                  width: 'clamp(42px, 10vw, 56px)',
                  textAlign: 'center',
                  color: '#60a5fa',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                j={j}
              </div>
            ))}
          </div>

          {matrix.map((row, idxI) => {
            const realI = idxI + 1;

            return (
              <div
                key={`row-${realI}`}
                style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    textAlign: 'right',
                    color: '#ff6b6b',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    paddingRight: '4px',
                    flexShrink: 0
                  }}
                >
                  i={realI}
                </div>

                {row.map((val, idxJ) => {
                  const realJ = idxJ + 1;

                  return (
                    <div key={`cell-${realI}-${realJ}`} style={getCellStyle(realI, realJ)}>
                      {val}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="di-controls" style={{ marginTop: '25px', flexWrap: 'wrap' }}>
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">
          Înapoi
        </button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">
          Pasul următor
        </button>
      </div>
    </div>
  );
}