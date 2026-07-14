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
    const { algorithm, array } = req.body;

    // 1. Validăm că am primit vectorul de intrare
    if (!array || !Array.isArray(array)) {
      return res.status(400).json({ error: 'Datele de intrare lipsesc sau sunt invalide!' });
    }

    // 2. Convertim toate elementele la numere ca să evităm bug-uri de comparare de string-uri (ex: "14" vs "8")
    const numericArray = array.map(Number);
    let steps = [];

    switch (algorithm) {
      case 'bubbleSort':
      case 'BubbleSortAnim':
        steps = simulateBubbleSort(numericArray); // Folosește numericArray!
        break;

      case 'quick_sort_dinamic':
        steps = simulateQuickSortJS(numericArray); // Folosește numericArray!
        break;

      case 'strlen_dinamic':
      case 'strcpy_dinamic': {
        // REZOLVAT: Acum mapăm direct din vectorul "array" primit de pe frontend
        const cuvant = array.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      }

      case 'cautare_binara_div_imp': {
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : numericArray[0];
        steps = simulateCautareBinaraDivImpJS(numericArray, targetCautat);
        break;
      }

      case 'InterschimbareSort':
        steps = simulateExchangeSort(numericArray);
        break;

      case 'SelectieSort':
        steps = simulateSelectionSort(numericArray);
        break;

      case 'InserctieSort':
        steps = simulateInsertionSort(numericArray);
        break;

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