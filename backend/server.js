require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const { submitCppJob, getQueueStats } = require('./jobQueue');
const { addLog, getLogs } = require('./logger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://info-motion.vercel.app', 'http://localhost:5173'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

app.post('/api/log-event', (req, res) => {
  const { type, actionCode, message } = req.body;

  if (!type || !actionCode || !message) {
    return res.status(400).json({ error: 'Date incomplete pentru generarea logului.' });
  }

  // Sincronizăm formatul cu cel de securitate ca să apară frumos în JSON
  addLog(type, actionCode, message);
  return res.json({ success: true });
});

// Ruta dedicată pentru logurile critice de securitate din AuthContext
app.post('/api/security-log', (req, res) => {
  const { action, username, message } = req.body;

  if (!action || !message) {
    return res.status(400).json({ error: 'Date log incomplete.' });
  }

  const userValid = username || 'ANONYMOUS';
  // Formatează logul exact cum vrei să apară pe ecran
  addLog('WARN', action, `[User: ${userValid}] - ${message}`);

  // Îl vezi live și în terminalul tău Fedora!
  console.log(`🚨 [SECURITATE] [${action}] ${userValid}: ${message}`);

  return res.json({ success: true });
});
app.get('/api/admin/logs', (_req, res) => {
  return res.json({ logs: getLogs() });
});

// Ruta dedicată pentru logurile critice de securitate din AuthContext
app.post('/api/security-log', (req, res) => {
  const { action, username, message } = req.body;

  if (!action || !message) {
    return res.status(400).json({ error: 'Date log incomplete.' });
  }

  // Folosește logger-ul tău existent ca să le salveze direct în memorie și în logs.json
  const userValid = username || 'ANONYMOUS';
  addLog('WARN', action, `[User: ${userValid}] - ${message}`);

  // Opțional: Le printezi cu roșu/alarmă în consola de Fedora să le vezi live ca admin
  console.log(`🚨 [SECURITATE] [${action}] ${userValid}: ${message}`);

  return res.json({ success: true });
});

app.post('/api/simulate', async (req, res) => {
  try {
    const { algorithmType, inputData } = req.body;

    if (!inputData || !Array.isArray(inputData)) {
      return res.status(400).json({ error: 'Datele de intrare lipsesc sau sunt invalide!' });
    }

    let steps = [];

    switch (algorithmType) {
      case 'bubbleSort':
      case 'BubbleSortAnim':
        steps = simulateBubbleSort(inputData);
        break;
      case 'quick_sort_dinamic':
        steps = simulateQuickSortJS(inputData);
        break;
      case 'strlen_dinamic':
      case 'strcpy_dinamic': {
        const cuvant = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      }
      case 'cautare_binara_div_imp': {
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : inputData[0];
        steps = simulateCautareBinaraDivImpJS(inputData, targetCautat);
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
  const { code, input, username } = req.body; // Poți trimite opțional și username-ul de pe frontend dacă vrei să știi cine rulează

  if (!code) {
    return res.status(400).json({ error: 'Nu ai trimis niciun cod!' });
  }

  const stats = getQueueStats();
  if (stats.queueLength >= 10) {
    // 🚨 Logăm supraîncărcarea serverului de C++
    addLog('WARN', 'QUEUE_OVERFLOW', `Server blocat: Coada de execuție C++ a depășit limita.`);
    return res.status(503).json({
      status: 'Server ocupat',
      error: 'Prea multe joburi în așteptare. Încearcă din nou în câteva secunde.',
    });
  }

  try {
    const result = await submitCppJob(code, input);

    if (result.status !== 'Succes') {
      // 📝 Logăm dacă codul a dat eroare de compilare/runtime (util pentru statistici de securitate sau bug-uri grave)
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