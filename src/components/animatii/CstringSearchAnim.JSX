import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../animatii_css/cstringSearchAnim.css';

const MODES = {
  strchr: {
    title: 'strchr',
    text: 'informatica',
    target: 'o',
    task: 'Caută prima apariție a literei "o".',
    code: `char text[50] = "informatica";
char *p1 = strchr(text, 'o');
if (p1 != NULL) {
  cout << p1; // ormatica
}`,
  },
  strrchr: {
    title: 'strrchr',
    text: 'abracadabra',
    target: 'a',
    task: 'Caută ultima apariție a literei "a".',
    code: `char text[50] = "abracadabra";
char *p2 = strrchr(text, 'a');
if (p2 != NULL) {
  cout << p2; // a
}`,
  },
  strstr: {
    title: 'strstr',
    text: 'informatica',
    target: 'mat',
    task: 'Caută subșirul "mat".',
    code: `char text[50] = "informatica";
char *p3 = strstr(text, "mat");
if (p3 != NULL) {
  cout << p3; // matica
}`,
  },
};

function CstringSearchAnim() {
  const [mode, setMode] = useState('strchr');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [tailIndexes, setTailIndexes] = useState([]);
  const [message, setMessage] = useState('Apasă pe o funcție ca să pornești animația.');
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const runId = useRef(0);

  const config = useMemo(() => MODES[mode], [mode]);
  const chars = useMemo(() => config.text.split(''), [config.text]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetAnimation = () => {
    setActiveIndex(-1);
    setMatchedIndexes([]);
    setTailIndexes([]);
    setResult('');
  };

  const play = async () => {
    const currentRun = ++runId.current;
    resetAnimation();
    setIsRunning(true);
    setMessage(config.task);

    if (mode === 'strchr') {
      for (let i = 0; i < chars.length; i++) {
        if (runId.current !== currentRun) return;

        setActiveIndex(i);
        setMatchedIndexes([]);
        setTailIndexes([]);
        setMessage(`Verific poziția ${i}: '${chars[i]}'`);
        await sleep(500);

        if (chars[i] === config.target) {
          if (runId.current !== currentRun) return;

          setMatchedIndexes([i]);
          setTailIndexes(chars.map((_, idx) => idx).filter((idx) => idx >= i));
          setMessage(`Găsit primul '${config.target}' la poziția ${i}.`);
          setResult(config.text.slice(i));
          setActiveIndex(-1);
          setIsRunning(false);
          return;
        }
      }

      setMessage(`Caracterul '${config.target}' nu există. Rezultat: NULL.`);
      setActiveIndex(-1);
      setIsRunning(false);
      return;
    }

    if (mode === 'strrchr') {
      for (let i = chars.length - 1; i >= 0; i--) {
        if (runId.current !== currentRun) return;

        setActiveIndex(i);
        setMatchedIndexes([]);
        setTailIndexes([]);
        setMessage(`Verific poziția ${i}: '${chars[i]}'`);
        await sleep(500);

        if (chars[i] === config.target) {
          if (runId.current !== currentRun) return;

          setMatchedIndexes([i]);
          setTailIndexes(chars.map((_, idx) => idx).filter((idx) => idx >= i));
          setMessage(`Găsit ultimul '${config.target}' la poziția ${i}.`);
          setResult(config.text.slice(i));
          setActiveIndex(-1);
          setIsRunning(false);
          return;
        }
      }

      setMessage(`Caracterul '${config.target}' nu există. Rezultat: NULL.`);
      setActiveIndex(-1);
      setIsRunning(false);
      return;
    }

    if (mode === 'strstr') {
      for (let i = 0; i <= chars.length - config.target.length; i++) {
        if (runId.current !== currentRun) return;

        const indexes = Array.from({ length: config.target.length }, (_, k) => i + k);

        setActiveIndex(-1);
        setMatchedIndexes(indexes);
        setTailIndexes([]);
        setMessage(`Compar '${config.text.slice(i, i + config.target.length)}' cu '${config.target}' la poziția ${i}.`);
        await sleep(700);

        if (config.text.slice(i, i + config.target.length) === config.target) {
          if (runId.current !== currentRun) return;

          setTailIndexes(chars.map((_, idx) => idx).filter((idx) => idx >= i));
          setMessage(`Subșirul "${config.target}" începe la poziția ${i}.`);
          setResult(config.text.slice(i));
          setIsRunning(false);
          return;
        }

        setMatchedIndexes([]);
      }

      setMessage(`Subșirul "${config.target}" nu există. Rezultat: NULL.`);
      setMatchedIndexes([]);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    play();
    return () => {
      runId.current++;
    };
  }, [mode]);

  return (
    <div className="cstring-card">
      <div className="cstring-top">
        <div>
        
          <h2 className="cstring-title">Animație interactivă: strchr, strrchr, strstr</h2>
          <p className="cstring-subtitle">
            Vezi pas cu pas cum se deplasează pointerul și ce returnează fiecare funcție.
          </p>
        </div>

        <button className="cstring-replay" onClick={play}>
          {isRunning ? 'Rulează din nou' : 'Pornește'}
        </button>
      </div>

      <div className="cstring-tabs">
        <button
          className={`cstring-tab ${mode === 'strchr' ? 'active' : ''}`}
          onClick={() => setMode('strchr')}
        >
          strchr
        </button>
        <button
          className={`cstring-tab ${mode === 'strrchr' ? 'active' : ''}`}
          onClick={() => setMode('strrchr')}
        >
          strrchr
        </button>
        <button
          className={`cstring-tab ${mode === 'strstr' ? 'active' : ''}`}
          onClick={() => setMode('strstr')}
        >
          strstr
        </button>
      </div>

      <div className="cstring-current">
        <span className="cstring-label">Funcție curentă</span>
        <p>
          <strong>{config.title}</strong> — {config.task}
        </p>
      </div>

      <div className="cstring-visual">
        {chars.map((char, index) => {
          const isActive = activeIndex === index;
          const isMatch = matchedIndexes.includes(index);
          const isTail = tailIndexes.includes(index);

          let cls = 'cstring-charbox';
          if (isMatch) cls += ' match';
          else if (isActive) cls += ' active';
          else if (isTail) cls += ' tail';

          return (
            <div key={index} className={cls}>
              <span className="cstring-char">{char}</span>
              <span className="cstring-index">{index}</span>
            </div>
          );
        })}
      </div>

      <div className="cstring-panels">
        <div className="cstring-panel">
          <span className="cstring-label">Status</span>
          <p>{message}</p>
        </div>

        <div className="cstring-panel result">
          <span className="cstring-label">Rezultat pointer</span>
          <p>{result || 'NULL / încă nu a găsit'}</p>
        </div>
      </div>

      <div className="cstring-code">
        <div className="cstring-code-head">Exemplu C++</div>
        <pre>
          <code>{config.code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CstringSearchAnim;