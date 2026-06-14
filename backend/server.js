require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const { exec } = require('child_process'); 
const path = require('path'); 
const crypto = require('crypto'); 

const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://info-motion.vercel.app', 'http://localhost:3000'], 
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));         
app.use(express.json());  

app.post('api/simulate', async (req, res) => {
  try {
    const { algorithmType, inputData } = req.body;
    
    if (!inputData || !Array.isArray(inputData)) 
      return res.status(400).json({ error: "Datele de intrare lipsesc sau sunt invalide!" });
    
    let steps = [];
    switch (algorithmType) {
      case 'bubbleSort':
      case 'BubbleSortAnim': steps = simulateBubbleSort(inputData); break;
      case 'quick_sort_dinamic': steps = simulateQuickSortJS(inputData); break;
      case 'strlen_dinamic':
      case 'strcpy_dinamic':
        const cuvant = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      case 'cautare_binara_div_imp':
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : inputData[0];
        steps = simulateCautareBinaraDivImpJS(inputData, targetCautat);
        break;
      default: return res.status(400).json({ error: "Algoritm neimplementat" });
    }
    return res.json({ steps });
  } catch (error) {
    console.error("Eroare la simulare:", error);
    return res.status(500).json({ error: "Eroare internă de server" });
  }
});

app.post('api/run-cpp', (req, res) => {
  const { code, input } = req.body; 

  if (!code) 
    return res.status(400).json({ error: "Nu ai trimis niciun cod!" });

  const uniqueId = crypto.randomBytes(8).toString('hex');
  const targetDir = '/tmp'; 
  const fileName = path.join(targetDir, `cod_${uniqueId}.cpp`);
  const exeName = path.join(targetDir, `program_${uniqueId}`);
  const inputFileName = path.join(targetDir, `input_${uniqueId}.txt`);

  fs.writeFileSync(fileName, code);
  fs.writeFileSync(inputFileName, input || "");

  // PASUL 2: Compilarea codului C++ direct în containerul principal
  exec(`g++ ${fileName} -o ${exeName}`, (compileError, stdout, stderr) => {
    
    if (compileError) {
      // Curățăm rapid fișierele dacă a dat eroare de sintaxă/compilare
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);
      
      return res.status(400).json({
        status: "Eroare de compilare",
        error: stderr 
      });
    } 

    // PASUL 3: Măsurarea performanței folosind utilitarul nativ /usr/bin/time instalat în Docker
    // %M -> Memoria maximă rezidentă (RSS) în Kilobaiți
    // %e -> Timpul total parcurs de proces în secunde
    const executeCommand = `/usr/bin/time -f "PERF_STATS MEM:%M TIME:%e" ${exeName} < ${inputFileName}`;

    // Rulăm executabilul cu un timeout strâns de 2000ms (TLE Protection)
    // maxBuffer împiedică blocarea serverului în cazul în care programul dă un text infinit (Output Limit)
    exec(executeCommand, { timeout: 2000, maxBuffer: 1024 * 512 }, (runError, runStdout, runStderr) => {
      
      // Curățăm IMEDIAT toate fișierele temporare pentru a nu umple stocarea containerului
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

      if (runError) {
        // Cazul A: Time Limit Exceeded (Killed de Node.js la timeout de 2 secunde)
        if (runError.killed || runError.signal === 'SIGTERM') {
          return res.status(400).json({ 
            status: "Time Limit Exceeded (TLE)", 
            error: "Codul tău a rulat mai mult de 2 secunde! Ai grijă la buclele infinite." 
          });
        }
        
        // Cazul B: Output prea mare (maxBuffer exceeded)
        if (runError.message && runError.message.includes("maxBuffer exceeded")) {
          return res.status(400).json({
            status: "Output Limit Exceeded",
            error: "Programul a generat prea mult text! Limita maximă afișabilă este de 512 KB."
          });
        }

        // Cazul C: Runtime Errors (Segmentation fault, diviziune la zero etc.)
        // Semnalele Linux clasice: SIGSEGV (139/11) sau SIGFPE (136/8)
        return res.status(400).json({ 
          status: "Runtime Error", 
          error: runStderr || "Programul a returnat o eroare sau a crăpat în timpul execuției." 
        });
      }

      // PASUL 4: Extragerea statisticilor de performanță din stderr
      const match = runStderr.match(/PERF_STATS MEM:(\d+) TIME:([\d.]+)/);

      let memoryUsedMb = 0;
      let timeUsedSec = 0;

      if (match) {
        const memoryKb = parseInt(match[1]);
        timeUsedSec = parseFloat(match[2]);
        // Transformăm din KB în MB și păstrăm 2 zecimale
        memoryUsedMb = parseFloat((memoryKb / 1024).toFixed(2));
      }

      return res.json({
        status: "Succes",
        output: runStdout,
        memory: memoryUsedMb,
        time: timeUsedSec
      });
    });
  });
});

app.listen(PORT, () => {
    console.log(`Serverul InfoMotion rulează pe portul ${PORT}`);
});