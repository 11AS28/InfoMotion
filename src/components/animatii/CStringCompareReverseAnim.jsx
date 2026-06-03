import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../animatii_css/cstringCompareReverseAnim.css';

const MODES = {
  strcmp: {
    title: 'strcmp',
    task: 'Compară lexicografic cuvintele "abur" și "avion".',
    code: `char cuv1[20] = "abur";
char cuv2[20] = "avion";
char cuv3[20] = "abur";

int rezultat1 = strcmp(cuv1, cuv2);
if (rezultat1 < 0) {
  cout << "\\"abur\\" este inaintea lui \\"avion\\" in dictionar.\\n";
}

if (strcmp(cuv1, cuv3) == 0) {
  cout << "Cuvintele sunt perfect identice!";
}`,
    left: 'abur',
    right: 'avion',
    equalLeft: 'abur',
    equalRight: 'abur',
  },
  strrev: {
    title: 'strrev',
    task: 'Inversează cuvântul "scoala" prin schimburi de litere.',
    code: `char cuvant[20] = "scoala";
strrev(cuvant);
cout << cuvant; // alaocs`,
    text: 'scoala',
  },
};

function CStringCompareReverseAnim() {
  const [mode, setMode] = useState('strcmp');
  const [message, setMessage] = useState('Apasă pe o funcție pentru a porni animația.');
  const [isRunning, setIsRunning] = useState(false);

  const [leftChars, setLeftChars] = useState([]);
  const [rightChars, setRightChars] = useState([]);
  const [activeLeftIndex, setActiveLeftIndex] = useState(-1);
  const [activeRightIndex, setActiveRightIndex] = useState(-1);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [diffIndexes, setDiffIndexes] = useState([]);
  const [compareResult, setCompareResult] = useState('');

  const [equalLeftChars, setEqualLeftChars] = useState([]);
  const [equalRightChars, setEqualRightChars] = useState([]);
  const [equalActiveIndex, setEqualActiveIndex] = useState(-1);
  const [equalMatchedIndexes, setEqualMatchedIndexes] = useState([]);
  const [equalResult, setEqualResult] = useState('');

  const [reverseChars, setReverseChars] = useState([]);
  const [leftPointer, setLeftPointer] = useState(-1);
  const [rightPointer, setRightPointer] = useState(-1);
  const [fixedIndexes, setFixedIndexes] = useState([]);
  const [reverseResult, setReverseResult] = useState('');

  const runId = useRef(0);
  const config = useMemo(() => MODES[mode], [mode]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetAll = () => {
    setMessage('Apasă pe o funcție pentru a porni animația.');
    setIsRunning(false);

    setLeftChars([]);
    setRightChars([]);
    setActiveLeftIndex(-1);
    setActiveRightIndex(-1);
    setMatchedIndexes([]);
    setDiffIndexes([]);
    setCompareResult('');

    setEqualLeftChars([]);
    setEqualRightChars([]);
    setEqualActiveIndex(-1);
    setEqualMatchedIndexes([]);
    setEqualResult('');

    setReverseChars([]);
    setLeftPointer(-1);
    setRightPointer(-1);
    setFixedIndexes([]);
    setReverseResult('');
  };

  const playStrcmp = async (currentRun) => {
    const left = config.left.split('');
    const right = config.right.split('');
    const leftEq = config.equalLeft.split('');
    const rightEq = config.equalRight.split('');

    setLeftChars(left);
    setRightChars(right);
    setMatchedIndexes([]);
    setDiffIndexes([]);
    setCompareResult('');

    setEqualLeftChars(leftEq);
    setEqualRightChars(rightEq);
    setEqualMatchedIndexes([]);
    setEqualResult('');

    setMessage('Comparăm primele două cuvinte literă cu literă.');

    const limit = Math.min(left.length, right.length);

    for (let i = 0; i < limit; i++) {
      if (runId.current !== currentRun) return;

      setActiveLeftIndex(i);
      setActiveRightIndex(i);
      setMessage(`Compar '${left[i]}' cu '${right[i]}' la poziția ${i}.`);
      await sleep(700);

      if (left[i] === right[i]) {
        setMatchedIndexes((prev) => [...prev, i]);
        await sleep(300);
      } else {
        setDiffIndexes([i]);
        const verdict =
          left[i] < right[i]
            ? `"${config.left}" este înaintea lui "${config.right}" în dicționar. strcmp < 0`
            : `"${config.left}" este după "${config.right}" în dicționar. strcmp > 0`;
        setCompareResult(verdict);
        setMessage(`Prima diferență este la poziția ${i}: '${left[i]}' vs '${right[i]}'.`);
        setActiveLeftIndex(-1);
        setActiveRightIndex(-1);
        await sleep(900);
        break;
      }
    }

    setMessage('Acum verificăm cazul în care două cuvinte sunt identice.');

    for (let i = 0; i < leftEq.length; i++) {
      if (runId.current !== currentRun) return;

      setEqualActiveIndex(i);
      setMessage(`Compar '${leftEq[i]}' cu '${rightEq[i]}' la poziția ${i}.`);
      await sleep(600);

      if (leftEq[i] === rightEq[i]) {
        setEqualMatchedIndexes((prev) => [...prev, i]);
      }
    }

    setEqualActiveIndex(-1);
    setEqualResult(`"${config.equalLeft}" și "${config.equalRight}" sunt identice. strcmp = 0`);
    setMessage('Toate literele coincid, deci rezultatul este 0.');
  };

  const playStrrev = async (currentRun) => {
  const chars = config.text.split('');
  const working = [...chars];

  setReverseChars([...working]);
  setFixedIndexes([]);
  setReverseResult('');
  setLeftPointer(-1);
  setRightPointer(-1);

  await sleep(400);

  setMessage('Pornim de la șirul original și punem doi pointeri la capete.');

  let st = 0;
  let dr = working.length - 1;
  const fixed = [];

  while (st < dr) {
    if (runId.current !== currentRun) return;

    setLeftPointer(st);
    setRightPointer(dr);
    setMessage(`Privim literele '${working[st]}' și '${working[dr]}' înainte de schimb.`);
    await sleep(900);

    if (runId.current !== currentRun) return;

    setMessage(`Schimb '${working[st]}' de la poziția ${st} cu '${working[dr]}' de la poziția ${dr}.`);
    await sleep(500);

    const temp = working[st];
    working[st] = working[dr];
    working[dr] = temp;

    setReverseChars([...working]);
    await sleep(900);

    fixed.push(st, dr);
    setFixedIndexes([...fixed]);

    st++;
    dr--;

    await sleep(350);
  }

  if (st === dr) {
    fixed.push(st);
    setFixedIndexes([...fixed]);
  }

  setLeftPointer(-1);
  setRightPointer(-1);
  setReverseResult(working.join(''));
  setMessage(`Cuvântul a fost inversat complet: "${working.join('')}".`);
};

  const play = async () => {
    const currentRun = ++runId.current;
    setIsRunning(true);

    if (mode === 'strcmp') {
      setReverseChars([]);
      setLeftPointer(-1);
      setRightPointer(-1);
      setFixedIndexes([]);
      setReverseResult('');
      await playStrcmp(currentRun);
    }

    if (mode === 'strrev') {
      setLeftChars([]);
      setRightChars([]);
      setActiveLeftIndex(-1);
      setActiveRightIndex(-1);
      setMatchedIndexes([]);
      setDiffIndexes([]);
      setCompareResult('');
      setEqualLeftChars([]);
      setEqualRightChars([]);
      setEqualActiveIndex(-1);
      setEqualMatchedIndexes([]);
      setEqualResult('');
      await playStrrev(currentRun);
    }

    if (runId.current === currentRun) {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    resetAll();
    play();

    return () => {
      runId.current++;
    };
  }, [mode]);

  return (
    <div className="ccr-card">
      <div className="ccr-top">
        <div>
          
          <h2 className="ccr-title">Animație interactivă: strcmp și strrev</h2>
          <p className="ccr-subtitle">
            Urmărește compararea lexicografică literă cu literă și inversarea unui cuvânt prin schimburi.
          </p>
        </div>

        <button className="ccr-replay" onClick={play}>
          {isRunning ? 'Rulează din nou' : 'Pornește animația'}
        </button>
      </div>

      <div className="ccr-tabs">
        <button
          className={`ccr-tab ${mode === 'strcmp' ? 'active' : ''}`}
          onClick={() => setMode('strcmp')}
        >
          strcmp
        </button>
        <button
          className={`ccr-tab ${mode === 'strrev' ? 'active' : ''}`}
          onClick={() => setMode('strrev')}
        >
          strrev
        </button>
      </div>

      <div className="ccr-current">
        <span className="ccr-label">Funcție curentă</span>
        <p>
          <strong>{config.title}</strong> — {config.task}
        </p>
      </div>

      {mode === 'strcmp' && (
        <div className="ccr-mode-block">
          <div className="ccr-compare-grid">
            <div className="ccr-line">
              <span className="ccr-label">Cuvântul 1</span>
              <div className="ccr-visual">
                {leftChars.map((char, index) => {
                  let cls = 'ccr-charbox';
                  if (matchedIndexes.includes(index)) cls += ' match';
                  if (diffIndexes.includes(index)) cls += ' diff';
                  if (activeLeftIndex === index) cls += ' active';

                  return (
                    <div key={index} className={cls}>
                      <span className="ccr-char">{char}</span>
                      <span className="ccr-index">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ccr-line">
              <span className="ccr-label">Cuvântul 2</span>
              <div className="ccr-visual">
                {rightChars.map((char, index) => {
                  let cls = 'ccr-charbox';
                  if (matchedIndexes.includes(index)) cls += ' match';
                  if (diffIndexes.includes(index)) cls += ' diff';
                  if (activeRightIndex === index) cls += ' active';

                  return (
                    <div key={index} className={cls}>
                      <span className="ccr-char">{char}</span>
                      <span className="ccr-index">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="ccr-panel result">
            <span className="ccr-label">Rezultatul comparației</span>
            <p>{compareResult || 'Așteaptă prima diferență...'}</p>
          </div>

          <div className="ccr-divider" />

          <div className="ccr-compare-grid">
            <div className="ccr-line">
              <span className="ccr-label">Verificare egalitate 1</span>
              <div className="ccr-visual">
                {equalLeftChars.map((char, index) => {
                  let cls = 'ccr-charbox';
                  if (equalMatchedIndexes.includes(index)) cls += ' match';
                  if (equalActiveIndex === index) cls += ' active';

                  return (
                    <div key={index} className={cls}>
                      <span className="ccr-char">{char}</span>
                      <span className="ccr-index">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ccr-line">
              <span className="ccr-label">Verificare egalitate 2</span>
              <div className="ccr-visual">
                {equalRightChars.map((char, index) => {
                  let cls = 'ccr-charbox';
                  if (equalMatchedIndexes.includes(index)) cls += ' match';
                  if (equalActiveIndex === index) cls += ' active';

                  return (
                    <div key={index} className={cls}>
                      <span className="ccr-char">{char}</span>
                      <span className="ccr-index">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="ccr-panel">
            <span className="ccr-label">Caz identic</span>
            <p>{equalResult || 'Așteaptă compararea completă...'}</p>
          </div>
        </div>
      )}

      {mode === 'strrev' && (
        <div className="ccr-mode-block">
          <div className="ccr-line">
            <span className="ccr-label">Cuvântul în memorie</span>
            <div className="ccr-visual">
              {reverseChars.map((char, index) => {
                let cls = 'ccr-charbox';
                if (fixedIndexes.includes(index)) cls += ' fixed';
                if (leftPointer === index || rightPointer === index) cls += ' active';

                return (
                  <div key={index} className={cls}>
                    <span className="ccr-char">{char}</span>
                    <span className="ccr-index">{index}</span>
                    {leftPointer === index && <div className="ccr-pointer">st</div>}
                    {rightPointer === index && <div className="ccr-pointer">dr</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ccr-panel result">
            <span className="ccr-label">Rezultat final</span>
            <p>{reverseResult || 'Așteaptă inversarea...'}</p>
          </div>

          <div className="ccr-panel">
            <span className="ccr-label">Observație</span>
            <p>
              strrev modifică șirul original direct în memorie. Pe unele compilatoare moderne poate să nu existe,
              fiind o funcție non-standard.
            </p>
          </div>
        </div>
      )}

      <div className="ccr-panels">
        <div className="ccr-panel">
          <span className="ccr-label">Status</span>
          <p>{message}</p>
        </div>

        <div className="ccr-panel">
          <span className="ccr-label">Ideea cheie</span>
          <p>
            {mode === 'strcmp'
              ? 'strcmp se oprește la prima diferență și decide ordinea lexicografică.'
              : 'strrev schimbă pozițiile literelor din exterior spre centru.'}
          </p>
        </div>
      </div>

      <div className="ccr-code">
        <div className="ccr-code-head">Exemplu C++</div>
        <pre>
          <code>{config.code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CStringCompareReverseAnim;