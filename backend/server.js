require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const { exec } = require('child_process'); 
const path = require('path'); 
const crypto = require('crypto'); 

// Importurile pentru simulatoare
const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const app = express();
const PORT = process.env.PORT || 5000;
// Permite doar site-ului tău de pe Vercel să vorbească cu serverul de Render
app.use(cors({
  origin: ['https://infomotion.vercel.app', 'http://localhost:3000'], // Pune aici domeniul tău oficial de Vercel + localhost pentru când testezi local
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));         
app.use(express.json());  

// =========================================================================
// RUTA 1: Pentru animații (Neschimbată)
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

// =========================================================================
// RUTA 2: Super-ruta securizată industrial (Docker Sandbox)
// =========================================================================
app.post('/api/run-cpp', (req, res) => {
  const { code, input } = req.body; 

  if (!code) {
    return res.status(400).json({ error: "Nu ai trimis niciun cod!" });
  }

  // PASUL 1: ID unic și izolat în folderul Linux /tmp
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const targetDir = '/tmp'; 
  const fileName = path.join(targetDir, `cod_${uniqueId}.cpp`);
  const exeName = path.join(targetDir, `program_${uniqueId}`);
  const inputFileName = path.join(targetDir, `input_${uniqueId}.txt`);

  // Scriem fișierul de cod local pe server în folderul /tmp
  fs.writeFileSync(fileName, code);
  
  // Creăm fișierul de input (chiar dacă e gol, ca să nu crape redirectarea < în Docker)
  fs.writeFileSync(inputFileName, input || "");

  // PASUL 2: Compilarea inițială direct pe server (pentru viteză)
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

    // PASUL 3: CONSTRUIREA CUȘTII DOCKER (Aici se întâmplă magia)
    // --rm                 -> Șterge containerul în milisecunda în care codul s-a oprit
    // --net=none           -> Taie complet internetul (Hackerul nu poate trimite date în exterior)
    // -m 64m               -> Limitează memoria RAM la exact 64MB (OOM/MLE Protection)
    // --cpus="0.5"         -> Alocă maxim jumătate de nucleu de procesor (Previne blocarea totală a serverului)
    // -v /tmp:/sandbox     -> Mapează folderul /tmp de pe server în folderul /sandbox din container
    
    const binarContainer = `/sandbox/program_${uniqueId}`;
    const inputContainer = `/sandbox/input_${uniqueId}.txt`;
    
    const dockerCommand = `docker run --rm --net=none -m 64m --cpus="0.5" -v /tmp:/sandbox infomotion-sandbox sh -c "${binarContainer} < ${inputContainer}"`;

    // Rulăm executabilul în container cu un timeout strâns de 2000ms (TLE Protection)
    // maxBuffer împiedică blocarea serverului în cazul în care consola dă un text infinit
    exec(dockerCommand, { timeout: 2000, maxBuffer: 1024 * 512 }, (runError, runStdout, runStderr) => {
      
      // Ștergem IMEDIAT toate fișierele de pe server ca să eliberăm spațiul
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

      if (runError) {
        // Cazul A: Time Limit Exceeded (Killed de Node.js la timeout sau oprit de Docker)
        if (runError.killed || runError.signal === 'SIGTERM') {
          return res.status(400).json({ 
            status: "Time Limit Exceeded (TLE)", 
            error: "Codul tău a rulat mai mult de 2 secunde! Ai grijă la buclele infinite." 
          });
        }
        
        // Cazul B: Out Of Memory / Memory Limit Exceeded (Cod de ieșire Docker 137 înseamnă de obicei OOM)
        if (runError.code === 137) {
          return res.status(400).json({
            status: "Memory Limit Exceeded (MLE)",
            error: "Programul a depășit limita de memorie de 64MB! Ai grijă la vectorii gigantici alocați aiurea."
          });
        }

        // Cazul C: Segmentation Fault în interiorul Linux-ului din container
        if (runError.code === 139) {
          return res.status(400).json({
            status: "Segmentation Fault (Runtime Error)",
            error: "Programul a crăpat! Ai accesat memorie nealocată (ex: indici în afara limitelor vectorului sau pointeri defecți)."
          });
        }

        // Cazul D: Output prea mare (maxBuffer exceeded)
        if (runError.message && runError.message.includes("maxBuffer exceeded")) {
          return res.status(400).json({
            status: "Output Limit Exceeded",
            error: "Programul a generat prea mult text! Limita maximă afișabilă este de 512 KB."
          });
        }

        // Alte erori nespecificate
        return res.status(400).json({ 
          status: "Runtime Error", 
          error: runStderr || "Programul a returnat o eroare în timpul execuției." 
        });
      }

      // PASUL E: Totul a rulat impecabil!
      return res.json({
        status: "Succes",
        output: runStdout
      });
    });
  });
});

app.listen(PORT, () => {
    console.log(`Serverul InfoMotion de Ultra-Securitate rulează pe portul ${PORT}`);
});