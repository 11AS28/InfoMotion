require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');
const { simulateExchangeSort } = require('./simulators/exchangeSortSim');
const { simulateSelectionSort } = require('./simulators/selectionSortSim');
const { simulateInsertionSort } = require('./simulators/insertionSortSim');
const { simulateFibonacciRecursiv } = require('./simulators/simulateFibonacci');
const { simulateBFS } = require('./simulators/simulateBFS');

const { submitCppJob, getQueueStats } = require('./jobQueue');
const { addLog, getLogs } = require('./logger');

const app = express();
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
app.post('/api/simulate', async (req, res) => {
  try {
    const { algorithm, array, algorithmType, inputData } = req.body;

    const finalAlgorithm = algorithm || algorithmType;
    const finalArray = array || inputData;

    let steps = [];

    switch (finalAlgorithm) {
      // Algoritmii care au nevoie STRICT de un array valid de numere
      case 'bubbleSort':
      case 'BubbleSortAnim':
      case 'quick_sort_dinamic':
      case 'InterschimbareSort':
      case 'SelectieSort':
      case 'InserctieSort': {
        if (!finalArray || !Array.isArray(finalArray)) {
          return res.status(400).json({ error: 'Datele de intrare lipsesc sau sunt invalide (trebuie să fie un vector)!' });
        }
        const numericArray = finalArray.map(Number);
        
        if (finalAlgorithm === 'bubbleSort' || finalAlgorithm === 'BubbleSortAnim') {
          steps = simulateBubbleSort(numericArray);
        } else if (finalAlgorithm === 'quick_sort_dinamic') {
          steps = simulateQuickSortJS(numericArray);
        } else if (finalAlgorithm === 'InterschimbareSort') {
          steps = simulateExchangeSort(numericArray);
        } else if (finalAlgorithm === 'SelectieSort') {
          steps = simulateSelectionSort(numericArray);
        } else if (finalAlgorithm === 'InserctieSort') {
          steps = simulateInsertionSort(numericArray);
        }
        break;
      }

      // Căutarea binară (are nevoie de array + target)
      case 'cautare_binara_div_imp': {
        if (!finalArray || !Array.isArray(finalArray)) {
          return res.status(400).json({ error: 'Datele de intrare lipsesc sau sunt invalide!' });
        }
        const numericArray = finalArray.map(Number);
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : numericArray[0];
        steps = simulateCautareBinaraDivImpJS(numericArray, targetCautat);
        break;
      }

      // Strlen / Strcpy (lucrează cu caractere transmise ca coduri ASCII într-un array)
      case 'strlen_dinamic':
      case 'strcpy_dinamic': {
        if (!finalArray || !Array.isArray(finalArray)) {
          return res.status(400).json({ error: 'Cuvântul lipsește sau este invalid!' });
        }
        const cuvant = finalArray.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      }

      // Fibonacci (are nevoie doar de primul element din input ca număr simplu)
      case 'fibonacci_recursiv': {
        if (!finalArray || (Array.isArray(finalArray) && finalArray.length === 0)) {
          return res.status(400).json({ error: 'Lipsește valoarea pentru Fibonacci!' });
        }
        // Luăm prima valoare indiferent dacă vine ca array sau valoare simplă
        const n = Array.isArray(finalArray) ? Number(finalArray[0]) : Number(finalArray);
        if (isNaN(n)) {
          return res.status(400).json({ error: 'Valoarea introdusă nu este un număr valid!' });
        }
        steps = simulateFibonacciRecursiv(n);
        break;
      }

      // BFS pe graf (nu folosește deloc finalArray, ci edges și startNode)
      case 'bfs_dinamic': {
        const muchii = req.body.edges;
        const start = req.body.startNode;

        if (!muchii || !Array.isArray(muchii) || muchii.length === 0) {
          return res.status(400).json({ error: 'Lipsesc muchiile grafului!' });
        }
        if (start === undefined || start === null) {
          return res.status(400).json({ error: 'Lipsește nodul de start!' });
        }

        steps = simulateBFS(muchii, start);
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
  const { code, input, username } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Nu ai trimis niciun cod!' });
  }

  const stats = getQueueStats();
  if (stats.queueLength >= 10) {
    addLog('WARN', 'QUEUE_OVERFLOW', `Server blocat: Coada de execuție C++ a depășit limita.`);
    return res.status(503).json({
      status: 'Server ocupat',
      error: 'Prea multe joburi în așteptare. Încearcă din nou în câteva secunde.',
    });
  }

  try {
    const result = await submitCppJob(code, input);

    if (result.status !== 'Succes') {
      addLog('INFO', 'CPP_EXECUTION_ERROR', `Codul C++ rulat a returnat starea: ${result.status}`);
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