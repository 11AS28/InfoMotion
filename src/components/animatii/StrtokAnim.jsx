import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../animatii_css/strtokAnim.css';

const MODES = {
  strcat: {
    title: 'strcat',
    task: 'Lipește șirul "info" la finalul șirului "pb".',
    code: `char site[50] = "pb";
char extensie[10] = "info";

strcat(site, extensie);
cout << site; // pbinfo`,
    dest: 'pb',
    src: 'info',
  },
  strtok: {
    title: 'strtok',
    task: 'Taie propoziția "Invat info, este super." în cuvinte.',
    code: `char propozitie[100] = "Invat info, este super.";
char separatori[] = " ,.";

char *p = strtok(propozitie, separatori);
while (p != NULL) {
  cout << p << "\\n";
  p = strtok(NULL, separatori);
}`,
    text: 'Invat info, este super.',
    delimiters: [' ', ',', '.'],
  },
};

function StrtokAnim() {
  const [mode, setMode] = useState('strcat');
  const [message, setMessage] = useState('Apasă pe o funcție pentru a porni animația.');
  const [isRunning, setIsRunning] = useState(false);

  const [destArray, setDestArray] = useState([]);
  const [srcArray, setSrcArray] = useState([]);
  const [activeDestIndex, setActiveDestIndex] = useState(-1);
  const [activeSrcIndex, setActiveSrcIndex] = useState(-1);
  const [mergedResult, setMergedResult] = useState('');

  const [tokenChars, setTokenChars] = useState([]);
  const [activeTokenIndex, setActiveTokenIndex] = useState(-1);
  const [currentWordIndexes, setCurrentWordIndexes] = useState([]);
  const [foundTokens, setFoundTokens] = useState([]);
  const [replacedIndexes, setReplacedIndexes] = useState([]);

  const runId = useRef(0);
  const config = useMemo(() => MODES[mode], [mode]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetAll = () => {
    setMessage('Apasă pe o funcție pentru a porni animația.');
    setIsRunning(false);

    setDestArray([]);
    setSrcArray([]);
    setActiveDestIndex(-1);
    setActiveSrcIndex(-1);
    setMergedResult('');

    setTokenChars([]);
    setActiveTokenIndex(-1);
    setCurrentWordIndexes([]);
    setFoundTokens([]);
    setReplacedIndexes([]);
  };

  const playStrcat = async (currentRun) => {
    const dest = [...config.dest.split(''), '\\0', '', '', '', '', ''];
    const src = [...config.src.split(''), '\\0'];

    setDestArray(dest);
    setSrcArray(src);
    setMergedResult('');
    setMessage('Căutăm terminatorul \\0 din primul șir.');

    let nullIndex = -1;

    for (let i = 0; i < dest.length; i++) {
      if (runId.current !== currentRun) return;
      setActiveDestIndex(i);
      setActiveSrcIndex(-1);
      setMessage(`Verific poziția ${i} din destinație.`);
      await sleep(500);

      if (dest[i] === '\\0') {
        nullIndex = i;
        setMessage(`Am găsit terminatorul \\0 la poziția ${i}. Începem lipirea.`);
        await sleep(700);
        break;
      }
    }

    if (nullIndex === -1) return;

    const working = [...dest];

    for (let j = 0; j < src.length; j++) {
      if (runId.current !== currentRun) return;

      setActiveDestIndex(nullIndex + j);
      setActiveSrcIndex(j);
      setMessage(`Copiez '${src[j]}' din sursă în destinație.`);
      await sleep(650);

      working[nullIndex + j] = src[j];
      setDestArray([...working]);
      await sleep(300);
    }

    setActiveDestIndex(-1);
    setActiveSrcIndex(-1);

    const finalString = working.filter((ch) => ch !== '').join('').replace('\\0', '');
    setMergedResult(finalString);
    setMessage(`Lipirea s-a terminat. Rezultatul final este "${finalString}".`);
  };

  const playStrtok = async (currentRun) => {
    const chars = config.text.split('');
    const working = [...chars];

    setTokenChars(working);
    setFoundTokens([]);
    setReplacedIndexes([]);
    setCurrentWordIndexes([]);
    setMessage('Parcurgem textul și căutăm începutul fiecărui cuvânt.');

    let i = 0;
    const tokens = [];

    while (i < working.length) {
      if (runId.current !== currentRun) return;

      while (i < working.length && config.delimiters.includes(working[i])) {
        setActiveTokenIndex(i);
        setCurrentWordIndexes([]);
        setMessage(`Caracterul '${working[i]}' este separator, îl sărim.`);
        await sleep(350);
        i++;
      }

      if (i >= working.length) break;

      const start = i;
      const indexes = [];

      while (i < working.length && !config.delimiters.includes(working[i])) {
        indexes.push(i);
        setActiveTokenIndex(i);
        setCurrentWordIndexes([...indexes]);
        setMessage(`Construim cuvântul curent: "${working.slice(start, i + 1).join('')}"`);
        await sleep(350);
        i++;
      }

      const token = working.slice(start, i).join('');
      tokens.push(token);
      setFoundTokens([...tokens]);

      if (i < working.length && config.delimiters.includes(working[i])) {
        setActiveTokenIndex(i);
        setMessage(`Separator găsit la poziția ${i}. Îl înlocuim cu '\\0'.`);
        await sleep(600);

        working[i] = '\\0';
        setTokenChars([...working]);
        setReplacedIndexes((prev) => [...prev, i]);
        await sleep(500);
      }

      setCurrentWordIndexes([]);
    }

    setActiveTokenIndex(-1);
    setMessage('Nu mai există token-uri. Următorul apel strtok(NULL, "...") va întoarce NULL.');
  };

  const play = async () => {
    const currentRun = ++runId.current;
    setIsRunning(true);

    if (mode === 'strcat') {
      setActiveTokenIndex(-1);
      setCurrentWordIndexes([]);
      setFoundTokens([]);
      setReplacedIndexes([]);
      await playStrcat(currentRun);
    }

    if (mode === 'strtok') {
      setDestArray([]);
      setSrcArray([]);
      setActiveDestIndex(-1);
      setActiveSrcIndex(-1);
      setMergedResult('');
      await playStrtok(currentRun);
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
    <div className="cadv-card">
      <div className="cadv-top">
        <div>
          
          <h2 className="cadv-title">Animație interactivă: strcat și strtok</h2>
          <p className="cadv-subtitle">
            Vezi cum se lipesc două șiruri și cum se sparge un text în cuvinte folosind separatorii.
          </p>
        </div>

        <button className="cadv-replay" onClick={play}>
          {isRunning ? 'Rulează din nou' : 'Pornește animația'}
        </button>
      </div>

      <div className="cadv-tabs">
        <button
          className={`cadv-tab ${mode === 'strcat' ? 'active' : ''}`}
          onClick={() => setMode('strcat')}
        >
          strcat
        </button>
        <button
          className={`cadv-tab ${mode === 'strtok' ? 'active' : ''}`}
          onClick={() => setMode('strtok')}
        >
          strtok
        </button>
      </div>

      <div className="cadv-current">
        <span className="cadv-label">Funcție curentă</span>
        <p>
          <strong>{config.title}</strong> — {config.task}
        </p>
      </div>

      {mode === 'strcat' && (
        <div className="cadv-strcat-layout">
          <div className="cadv-string-block">
            <span className="cadv-label">Destinație</span>
            <div className="cadv-visual">
              {destArray.map((char, index) => (
                <div
                  key={index}
                  className={`cadv-charbox ${activeDestIndex === index ? 'active' : ''} ${char === '\\0' ? 'nullbox' : ''}`}
                >
                  <span className="cadv-char">{char === '' ? '·' : char}</span>
                  <span className="cadv-index">{index}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cadv-string-block">
            <span className="cadv-label">Sursă</span>
            <div className="cadv-visual">
              {srcArray.map((char, index) => (
                <div
                  key={index}
                  className={`cadv-charbox ${activeSrcIndex === index ? 'active' : ''} ${char === '\\0' ? 'nullbox' : ''}`}
                >
                  <span className="cadv-char">{char}</span>
                  <span className="cadv-index">{index}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cadv-panel result">
            <span className="cadv-label">Rezultat</span>
            <p>{mergedResult || 'Așteaptă lipirea...'}</p>
          </div>
        </div>
      )}

      {mode === 'strtok' && (
        <div className="cadv-strtok-layout">
          <div className="cadv-string-block">
            <span className="cadv-label">Text analizat</span>
            <div className="cadv-visual">
              {tokenChars.map((char, index) => {
                const isActive = activeTokenIndex === index;
                const isWord = currentWordIndexes.includes(index);
                const isReplaced = replacedIndexes.includes(index);
                const isDelimiter = config.delimiters.includes(char);

                let cls = 'cadv-charbox';
                if (isWord) cls += ' match';
                else if (isActive) cls += ' active';
                if (isReplaced) cls += ' replaced';
                if (isDelimiter) cls += ' delimiter';

                return (
                  <div key={index} className={cls}>
                    <span className="cadv-char">{char === ' ' ? '␠' : char}</span>
                    <span className="cadv-index">{index}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cadv-panel">
            <span className="cadv-label">Token-uri găsite</span>
            <div className="cadv-token-list">
              {foundTokens.length === 0 ? (
                <p className="cadv-empty">Încă nu a fost extras niciun cuvânt.</p>
              ) : (
                foundTokens.map((token, index) => (
                  <span key={index} className="cadv-token-pill">
                    {token}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="cadv-panels">
        <div className="cadv-panel">
          <span className="cadv-label">Status</span>
          <p>{message}</p>
        </div>

        <div className="cadv-panel">
          <span className="cadv-label">Observație</span>
          <p>
            {mode === 'strcat'
              ? 'Primul șir trebuie să aibă suficient spațiu liber pentru textul lipit.'
              : 'strtok modifică șirul original: separatorii găsiți sunt înlocuiți cu \\0.'}
          </p>
        </div>
      </div>

      <div className="cadv-code">
        <div className="cadv-code-head">Exemplu C++</div>
        <pre>
          <code>{config.code}</code>
        </pre>
      </div>
    </div>
  );
}

export default StrtokAnim;