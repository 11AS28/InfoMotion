require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

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

const ai = new GoogleGenAI({});

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
 


app.post('/api/generate-cases', async (req, res) => {
  try {
    const { algoritm, tipModul } = req.body;

    if (!algoritm) {
      return res.status(400).json({ error: "Lipsește numele algoritmului." });
    }

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    // Parsăm JSON-ul simplu primit de la Gemini
    const testCases = JSON.parse(response.text);
    res.json(testCases);

  } catch (error) {
    console.error("Eroare Gemini:", error);
    res.status(500).json({ error: "Eroare la generarea cazurilor simple." });
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