// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const { exec } = require('child_process'); 
const path = require('path'); // Adăugat pentru manipularea sigură a căilor de fișiere
const crypto = require('crypto'); // Adăugat pentru a genera ID-uri unice pentru fișiere

// Importurile tale originale pentru simulatoare
const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const app = express();
const PORT = process.env.PORT || 5000;

// Activăm middleware-urile obligatorii
app.use(cors());          
app.use(express.json());  

// =========================================================================
// RUTA 1: Pentru animații (Codul tău original nemodificat, doar optimizat)
// =========================================================================
app.post('/api/simulate', async (req, res) => {
  try {
    const { algorithmType, inputData } = req.body;
    
    if (!inputData || !Array.isArray(inputData)) {
      return res.status(400).json({ error: "Datele de intrare lipsesc sau sunt invalide!" });
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
        const cuvantStrlen = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvantStrlen);
        break;

      case 'strcpy_dinamic':
        const cuvantStrcpy = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvantStrcpy); 
        break;

      case 'cautare_binara_div_imp': {
        const targetCautat = req.body.target !== undefined ? parseInt(req.body.target) : inputData[0];
        steps = simulateCautareBinaraDivImpJS(inputData, targetCautat);
        break;
      }

      default:
        return res.status(400).json({ error: "Algoritm neimplementat" });
    }

    return res.json({ steps });

  } catch (error) {
    console.error("Eroare la simulare:", error);
    return res.status(500).json({ error: "Eroare internă de server la rularea binarului C++" });
  }
});

// =========================================================================
// RUTA 2: Super-ruta securizată și paralelă pentru executat C++
// =========================================================================
app.post('/api/run-cpp', (req, res) => {
  const { code, input } = req.body; 

  if (!code) {
    return res.status(400).json({ error: "Nu ai trimis niciun cod!" });
  }

  // -------------------------------------------------------------------------
  // PASUL 0: Filtru de Securitate Antihack (RCE Protection)
  // -------------------------------------------------------------------------
  const cuvinteInterzise = [
    "system", "popen", "fork", "exec", "syscall", "unistd",
    "fstream", "ifstream", "ofstream", "remove", "rename"
  ];

  // Eliminăm comentariile din cod ca să nu prindem cuvinte interzise scrise în comentarii
  const codFaraComentarii = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

  for (let cuvant of cuvinteInterzise) {
    // Folosim RegExp ca să verificăm cuvântul exact (să nu blocăm variabile gen "system_status")
    const regex = new RegExp(`\\b${cuvant}\\b`);
    if (regex.test(codFaraComentarii)) {
      return res.status(403).json({
        status: "Securitate Încălcată",
        error: `Utilizarea cuvântului sau a funcției '${cuvant}' este strict interzisă din motive de securitate!`
      });
    }
  }

  // PASUL 1: Generare ID unic pentru sesiune (Evită suprapunerea fișierelor la utilizatori simultani)
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const fileName = `cod_${uniqueId}.cpp`;
  const exeName = `program_${uniqueId}`;
  const inputFileName = `input_${uniqueId}.txt`;

  // Pasul A: Salvăm textul primit în fișierul fizic .cpp unic
  fs.writeFileSync(fileName, code);

  // Pasul B: Deschidem terminalul ascuns și compilăm cu g++
  exec(`g++ ${fileName} -o ${exeName}`, (compileError, stdout, stderr) => {
    
    if (compileError) {
      // Curățăm fișierul sursă dacă a dat eroare de compilare
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      
      return res.status(400).json({
        status: "Eroare de compilare",
        error: stderr 
      });
    }

    const exeAbsolutePath = path.join(__dirname, exeName);
    let runCommand = `"${exeAbsolutePath}"`; // Ghilimelele previn problemele dacă există spații în căi
    
    if (input) {
      fs.writeFileSync(inputFileName, input);
      runCommand = `"${exeAbsolutePath}" < ${inputFileName}`;
    }

    exec(runCommand, { timeout: 2000 }, (runError, runStdout, runStderr) => {
      
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      
      if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
      if (fs.existsSync(`${exeName}.exe`)) fs.unlinkSync(`${exeName}.exe`); 
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);
      
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

      if (runError) {
        // Cazul 1: Timeout (Bucle infinite)
        if (runError.killed) {
          return res.status(400).json({ 
            status: "Time Limit Exceeded (TLE)", 
            error: "Codul tău a rulat mai mult de 2 secunde! Ai grijă la buclele infinite (while sau for)." 
          });
        }
        
        // Cazul 2: Errore de Memorie / Pointeri / Segmentare (Codul Linux standard pentru SegFault este 139)
        if (runError.code === 139) {
          return res.status(400).json({
            status: "Segmentation Fault (Runtime Error)",
            error: "Programul a crăpat în timpul rulării! Ai accesat memorie nealocată (ex: vectori în afara limitelor sau pointeri defecți)."
          });
        }

        // Cazul 3: Alt tip de eroare de execuție
        return res.status(400).json({ 
          status: "Runtime Error", 
          error: runStderr || "Programul a returnat un cod de eroare la execuție." 
        });
      }

      // Pasul E: Totul a mers perfect! Trimitem output-ul către React
      return res.json({
        status: "Succes",
        output: runStdout
      });
    });
  });
});

// Pornim serverul unic pe portul setat (5000 local)
app.listen(PORT, () => {
    console.log(`🚀 Serverul InfoMotion Securizat rulează pe http://localhost:${PORT}`);
});