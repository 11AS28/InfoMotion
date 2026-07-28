require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');
const { simulateExchangeSort } = require('./simulators/exchangeSortSim');
const { simulateSelectionSort } = require('./simulators/selectionSortSim');
const { simulateInsertionSort } = require('./simulators/insertionSortSim');
const { simulateFibonacciRecursiv } = require('./simulators/simulateFibonacci');
const { simulateBFS } = require('./simulators/simulateBFS');
const { simulateConceptGrafuri } = require('./simulators/simulare_introducere');

const { submitCodeJob, getQueueStats } = require('./jobQueue');
const { addLog, getLogs } = require('./logger');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: [
    'https://infomotion.space',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://infomotionbackend.duckdns.org'
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Prea multe simulări trimise de pe acest IP. Încearcă din nou mai târziu!"
});

//app.use('/api/generate-cases', apiLimiter);



const DEFAULT_FALLBACK_CASES = {
  compiler: {
    normal: "5\n4 2 5 1 3",
    worstCase: "5\n5 4 3 2 1",
    bestCase: "5\n1 2 3 4 5",
    stressTest: "10\n42 12 89 5 23 7 1 99 15 50"
  },
  animation: {
    normal: "4, 2, 5, 1, 3",
    worstCase: "5, 4, 3, 2, 1",
    bestCase: "1, 2, 3, 4, 5",
    stressTest: "42, 12, 89, 5, 23, 7, 1, 99, 15, 50"
  }
};

const SPECIFIC_FALLBACKS = {
  // Sorting / Sortări
  sorting: {
    compiler: {
      normal: "6\n7 2 9 1 5 4",
      worstCase: "6\n9 7 5 4 2 1",
      bestCase: "6\n1 2 4 5 7 9",
      stressTest: "10\n100 -5 23 0 12 88 -12 4 19 3"
    },
    animation: {
      normal: "7, 2, 9, 1, 5, 4",
      worstCase: "9, 7, 5, 4, 2, 1",
      bestCase: "1, 2, 4, 5, 7, 9",
      stressTest: "100, -5, 23, 0, 12, 88, -12, 4, 19, 3"
    }
  },
  // Căutare Binară / Vectori Căutați
  binary_search: {
    compiler: {
      normal: "7\n2 5 8 12 16 23 38\n12",
      worstCase: "7\n2 5 8 12 16 23 38\n99",
      bestCase: "7\n2 5 8 12 16 23 38\n12",
      stressTest: "10\n1 3 7 11 15 19 22 31 45 50\n22"
    },
    animation: {
      normal: "2, 5, 8, 12, 16, 23, 38",
      worstCase: "2, 5, 8, 12, 16, 23, 38",
      bestCase: "2, 5, 8, 12, 16, 23, 38",
      stressTest: "1, 3, 7, 11, 15, 19, 22, 31, 45, 50"
    }
  },
  // Grafuri (BFS / DFS / Introducere)
  graphs: {
    compiler: {
      normal: "4 4\n1 2\n2 3\n3 4\n4 1\n1",
      worstCase: "5 4\n1 2\n2 3\n3 4\n4 5\n1",
      bestCase: "3 3\n1 2\n2 3\n3 1\n1",
      stressTest: "6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n4 5\n5 6\n1"
    },
    animation: {
      normal: "1-2, 2-3, 3-4, 4-1",
      worstCase: "1-2, 2-3, 3-4, 4-5",
      bestCase: "1-2, 2-3, 3-1",
      stressTest: "1-2, 1-3, 2-4, 2-5, 3-6, 4-5, 5-6"
    }
  },
  // Siruri de caractere / String
  strings: {
    compiler: {
      normal: "infomotion",
      worstCase: "zzzzzzzzzz",
      bestCase: "a",
      stressTest: "algoritmica_si_programare_2026"
    },
    animation: {
      normal: "i, n, f, o, m, o, t, i, o, n",
      worstCase: "z, z, z, z, z, z, z, z",
      bestCase: "a",
      stressTest: "a, l, g, o, r, i, t, m, i, c, a"
    }
  }
};

// Helper pentru extragerea cazurilor predefinite adecvate
function getFallbackCases(algoritm, tipModul) {
  const isCompiler = tipModul === 'compiler';
  const modeKey = isCompiler ? 'compiler' : 'animation';
  const algoLower = (algoritm || '').toLowerCase();

  if (algoLower.includes('sort') || algoLower.includes('bule') || algoLower.includes('interschimbare')) {
    return SPECIFIC_FALLBACKS.sorting[modeKey];
  }
  if (algoLower.includes('cautare') || algoLower.includes('binar')) {
    return SPECIFIC_FALLBACKS.binary_search[modeKey];
  }
  if (algoLower.includes('graf') || algoLower.includes('bfs') || algoLower.includes('dfs')) {
    return SPECIFIC_FALLBACKS.graphs[modeKey];
  }
  if (algoLower.includes('str') || algoLower.includes('sir') || algoLower.includes('text')) {
    return SPECIFIC_FALLBACKS.strings[modeKey];
  }

  return DEFAULT_FALLBACK_CASES[modeKey];
}


// --- RUTA ACTUALIZATĂ ---
app.post('/api/generate-cases', async (req, res) => {
  const { algoritm, tipModul } = req.body;

  if (!algoritm) {
    return res.status(400).json({ error: "Lipsește numele algoritmului." });
  }

  try {
    const prompt = `
      Ești un asistent AI integrat pe platforma InfoMotion. 
      Trebuie să generezi 4 seturi de date de test pentru algoritmul/lecția: "${algoritm}".
      Contextul paginii este: "${tipModul || 'compiler'}".

      Cerință strictă de formatare:
      - Returnează EXACT un obiect JSON valid cu cheile: "normal", "worstCase", "bestCase", "stressTest".
      - Valoarea fiecărei chei TREBUIE să fie direct un STRING simplu (fără sub-obiecte, fără explicații).
      
      Reguli pentru conținutul string-ului în funcție de tipModul:
      1. Dacă tipModul este 'compiler', generează textul brut pentru consolă (STDIN). De exemplu, pentru vectori pune N pe prima linie și elementele separate prin spațiu pe linia a doua.
      2. Dacă tipModul este 'animation' (sau altceva decât compiler), generează doar elementele separate prin virgulă (ex: "5, 4, 3, 2, 1" sau "1, 2, 3, 4, 5") așa cum cere input-ul din pagina de animație.

      Nu include blocuri de cod markdown (\`\`\`json). Returnează doar obiectul JSON pur.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // sau alt model Groq pe care vrei să-l folosești
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const testCases = JSON.parse(response.choices[0].message.content);

    // Returnăm răspunsul generat de AI
    return res.json({
      ...testCases,
      isFallback: false
    });

  } catch (error) {
    console.error("⚠️ AI Rateu/Eroare. Se folosesc date fallback:", error.message);

    // În caz de eroare AI, extragem cazurile predefinite potrivite
    const fallbackCases = getFallbackCases(algoritm, tipModul);

    return res.json({
      ...fallbackCases,
      isFallback: true
    });
  }
});


app.post('/api/log-event', (req, res) => {
  const { type, actionCode, message } = req.body;

  if (!type || !actionCode || !message) {
    return res.status(400).json({ error: 'Date incomplete pentru generarea logului.' });
  }

  addLog(type, actionCode, message);
  return res.json({ success: true });
});

app.post('/api/security-log', (req, res) => {
  const { action, username, message } = req.body;

  if (!action || !message) {
    return res.status(400).json({ error: 'Date log incomplete.' });
  }

  const userValid = username || 'ANONYMOUS';
  addLog('WARN', action, `[User: ${userValid}] - ${message}`);

  console.log(`🚨 [SECURITATE] [${action}] ${userValid}: ${message}`);

  return res.json({ success: true });
});

app.get('/api/admin/logs', (_req, res) => {
  return res.json({ logs: getLogs() });
});


app.use('/api/simulate', apiLimiter);

app.post('/api/simulate', async (req, res) => {
  try {
    const { algorithm, array, algorithmType, inputData } = req.body;

    const finalAlgorithm = algorithm || algorithmType;
    const finalArray = array || inputData;

    const algoritmiFaraArray = ['bfs_dinamic', 'simulare_introducere'];

    if (!algoritmiFaraArray.includes(finalAlgorithm)) {
      if (!finalArray || !Array.isArray(finalArray)) {
        return res.status(400).json({ error: 'Datele de intrare lipsesc sau sunt invalide!' });
      }
    }

    let steps = [];

    switch (finalAlgorithm) {
      case 'bubbleSort':
      case 'BubbleSortAnim': {
        const numericArray = finalArray.map(Number);
        steps = simulateBubbleSort(numericArray);
        break;
      }

      case 'quick_sort_dinamic': {
        const numericArray = finalArray.map(Number);
        steps = simulateQuickSortJS(numericArray);
        break;
      }

      case 'strlen_dinamic':
      case 'strcpy_dinamic': {
        const cuvant = finalArray.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      }

      case 'cautare_binara_div_imp': {
        const numericArray = finalArray.map(Number);
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : numericArray[0];
        steps = simulateCautareBinaraDivImpJS(numericArray, targetCautat);
        break;
      }

      case 'InterschimbareSort': {
        const numericArray = finalArray.map(Number);
        steps = simulateExchangeSort(numericArray);
        break;
      }

      case 'SelectieSort': {
        const numericArray = finalArray.map(Number);
        steps = simulateSelectionSort(numericArray);
        break;
      }

      case 'InserctieSort': {
        const numericArray = finalArray.map(Number);
        steps = simulateInsertionSort(numericArray);
        break;
      }

      case 'fibonacci_recursiv': {
        const numericArray = finalArray.map(Number);
        steps = simulateFibonacciRecursiv(numericArray[0]);
        break;
      }

      case 'bfs_dinamic': {
        const muchii = req.body.edges;
        const start = req.body.startNode;
        const directionat = !!req.body.directed;

        if (!muchii || !Array.isArray(muchii) || muchii.length === 0) {
          return res.status(400).json({ error: 'Lipsesc muchiile grafului!' });
        }
        if (!start) {
          return res.status(400).json({ error: 'Lipsește nodul de start!' });
        }

        steps = simulateBFS(muchii, start, directionat);
        break;
      }

      case 'simulare_introducere': {
        const muchii = req.body.edges;

        if (!muchii || !Array.isArray(muchii) || muchii.length === 0) {
          return res.status(400).json({ error: 'Lipsesc muchiile grafului!' });
        }

        steps = simulateConceptGrafuri(muchii);
        break;
      }

      default:
        return res.status(400).json({ error: 'Algoritm neimplementat' });
    }

    return res.json({ steps });
  } catch (error) {
    console.error('Eroare la simulare:', error);
    return res.status(500).json({ error: 'Eroare internă de server' });
  }
});




app.post('/api/run-cpp', async (req, res) => {
  const { code, input, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Nu ai trimis niciun cod!' });
  }

  const stats = getQueueStats();
  if (stats.queueLength >= 10) {
    addLog('WARN', 'QUEUE_OVERFLOW', `Server blocat: Coada de execuție a depășit limita.`);
    return res.status(503).json({
      status: 'Server ocupat',
      error: 'Prea multe joburi în așteptare. Încearcă din nou în câteva secunde.',
    });
  }

  try {
    const result = await submitCodeJob(code, input, language);

    if (result.status !== 'Succes') {
      addLog('INFO', 'CODE_EXECUTION_ERROR', `Codul (${result.language || language || 'necunoscut'}) rulat a returnat starea: ${result.status}`);
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Eroare neașteptată la run-cpp:', err);
    addLog('ERROR', 'SERVER_CRASH_ATTEMPT', `Eroare fatală la rularea codului: ${err.message}`);
    return res.status(500).json({
      status: 'Eroare internă',
      error: 'A apărut o eroare neașteptată pe server.',
    });
  }
});

app.get('/api/status', (_req, res) => {
  res.json({
    ok: true,
    ...getQueueStats(),
  });
});

app.listen(PORT, () => {
  console.log(`Serverul InfoMotion rulează pe portul ${PORT}`);
  console.log(`Workers: ${process.env.MAX_WORKERS || 2} | Compile timeout: ${process.env.COMPILE_TIMEOUT_MS || 10000}ms | Run timeout: ${process.env.RUN_TIMEOUT_MS || 2000}ms`);
});