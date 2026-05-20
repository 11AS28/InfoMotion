import React, { useState } from 'react';
import '../animatii_css/divideAnim.css';

export default function MatriciAnim() {
  const [step, setStep] = useState(0);

  // Matrice de 3 linii și 4 coloane (indexată de la 1 la 3, respectiv 1 la 4)
  const matrix = [
    [5, 2, 8, 1],
    [4, 9, 3, 7],
    [6, 1, 8, 2]
  ];

  const stages = [
    {
      r: null, c: null,
      code: "int a[4][5]; // 3 linii, 4 coloane utile",
      desc: "1. CE ESTE O MATRICE? Este un tablou bidimensional organizat pe linii și coloane. Aici avem o matrice a[3][4] (3 linii și 4 coloane)."
    },
    {
      r: 2, c: 3,
      code: "cout << a[2][3]; // Afiseaza 3",
      desc: "2. COORDONATE: Pentru a accesa valoarea 3 de pe a doua linie folosim a[2][3]. Primul număr e linia (i=2), al doilea e coloana (j=3). Fix ca la șah!"
    },
    {
      r: 1, c: null,
      code: "for(int i = 1; i <= n; i++)",
      desc: "3. PARCURGERE: Avem nevoie de două bucle for. Bucla exterioară (i) fixează linia. Pentru i=1, ne pregătim să vizităm prima linie."
    },
    {
      r: 1, c: 2,
      code: "for(int j = 1; j <= m; j++) {\n   cin >> a[i][j];\n}",
      desc: "4. COLOANELE: Bucla interioară (j) se mișcă pe coloane. Pentru i=1, j devine pe rând 1, 2, 3, 4. Acum ne aflăm fix la a[1][2]."
    },
    {
      r: 1, c: 4,
      code: "cout << endl;",
      desc: "5. RÂND NOU: Când terminăm complet de vizitat linia 1 (j a ajuns la 4), executăm comanda 'cout << endl;' pentru a forța afișarea pe un rând nou pe ecran."
    },
    {
      r: 2, c: 1,
      code: "i++; // i devine 2\nfor(int j = 1; j <= m; j++)",
      desc: "6. CONTINUARE: i crește și devine 2. Variabila j o ia de la capăt (1, 2, 3, 4). Așa funcționează buclele imbricate: rând cu rând, celulă cu celulă."
    },
    {
      r: 'all', c: 'all',
      code: "suma = suma + a[i][j];",
      desc: "7. PRELUCRARE: Repetând pașii de mai sus, putem trece prin absolut fiecare celulă. De exemplu, le putem aduna într-o variabilă. Suma totală aici este 56."
    }
  ];

  const nextStep = () => { if (step < stages.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const cur = stages[step];

  return (
    <div className="di-container">
      <h3 className="di-title">Animație: Matrici (Tablouri Bidimensionale)</h3>
      <p className="di-desc" style={{ minHeight: '80px' }}>{cur.desc}</p>
      
      <div className="di-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Codul C++ relevant pasului */}
        <div style={{ 
          background: '#1e293b', padding: '10px 15px', borderRadius: '6px', 
          fontFamily: 'monospace', borderLeft: '4px solid #BA7517',
          width: '100%', maxWidth: '500px', boxSizing: 'border-box', minHeight: '65px'
        }}>
          <pre style={{ margin: 0, color: '#8cd932', whiteSpace: 'pre-wrap', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
            {cur.code}
          </pre>
        </div>

        {/* Zona Vizuală a Matricei */}
        {/* Adăugăm overflowX: 'auto' pentru ca pe telefoane extrem de mici matricea să nu spargă ecranul, deși am optimizat dimensiunile celulelor */}
        <div style={{ 
            display: 'flex', flexDirection: 'column', gap: '5px', 
            background: 'rgba(255, 255, 255, 0.02)', padding: '15px', 
            borderRadius: '12px', border: '1px solid #4a5568',
            maxWidth: '100%', overflowX: 'auto'
        }}>
          
          {/* Header coloane (j) */}
          <div style={{ display: 'flex', gap: '5px', marginLeft: '35px' }}>
            {[1, 2, 3, 4].map(j => (
              <div key={`header-${j}`} style={{ width: 'clamp(40px, 10vw, 55px)', textAlign: 'center', color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>
                j={j}
              </div>
            ))}
          </div>

          {/* Rândurile matricei (i) */}
          {matrix.map((row, idxI) => {
            const realI = idxI + 1;
            
            // Verificăm dacă rândul întreg trebuie evidențiat
            const isRowHighlighted = cur.r === realI && cur.c === null;

            return (
              <div key={`row-${realI}`} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {/* Header linii (i) */}
                <div style={{ width: '30px', textAlign: 'right', color: '#ff6b6b', fontWeight: 'bold', fontSize: '0.9rem', paddingRight: '5px' }}>
                  i={realI}
                </div>
                
                {/* Celulele de pe rând */}
                {row.map((val, idxJ) => {
                  const realJ = idxJ + 1;
                  
                  let bg = '#2d3748';
                  let border = '1px solid #4a5568';
                  let scale = 'scale(1)';

                  // Logica de evidențiere (Highlight)
                  if (cur.r === 'all' && cur.c === 'all') {
                    bg = '#639922'; // Verde la final (Suma)
                    border = '2px solid #8cd932';
                  } else if (cur.r === realI && cur.c === realJ) {
                    bg = '#BA7517'; // Portocaliu pentru celula exactă
                    border = '2px solid #ffb347';
                    scale = 'scale(1.1)';
                  } else if (isRowHighlighted) {
                    bg = 'rgba(59, 130, 246, 0.4)'; // Albastru transparent pentru rândul i activ
                    border = '1px dashed #60a5fa';
                  }

                  return (
                    <div key={`cell-${realI}-${realJ}`} style={{ 
                      width: 'clamp(40px, 10vw, 55px)', 
                      height: 'clamp(40px, 10vw, 55px)', 
                      background: bg, 
                      border: border,
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '6px',
                      transform: scale, transition: 'all 0.3s ease'
                    }}>
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
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary">Înapoi</button>
        <button onClick={nextStep} disabled={step === stages.length - 1} className="btn-primary">Pasul Următor</button>
      </div>
    </div>
  );
}
