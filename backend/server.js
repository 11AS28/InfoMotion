require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const http = require('http'); 
const { Server } = require('socket.io'); 

const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://info-motion.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

const arenaProblems = {
  bubble_sort: {
    tests: [
      { input: "5\n5 4 3 2 1", expected: "1 2 3 4 5" },
      { input: "4\n-3 2 0 -1", expected: "-3 -1 0 2" },
      { input: "6\n9 1 4 9 2 0", expected: "0 1 2 4 9 9" }
    ]
  }
};

// --- RUTE API EXISTENTE (PĂSTRATE 100%) ---

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
      case 'strcpy_dinamic': {
        const cuvant = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        steps = await simulateStrlen(cuvant);
        break;
      }

      case 'cautare_binara_div_imp': {
        const targetCautat = req.body.target !== undefined
          ? parseInt(req.body.target)
          : inputData[0];
        steps = simulateCautareBinaraDivImpJS(inputData, targetCautat);
        break;
      }

      default:
        return res.status(400).json({ error: "Algoritm neimplementat" });
    }

    return res.json({ steps });
  } catch (error) {
    console.error("Eroare la simulare:", error);
    return res.status(500).json({ error: "Eroare internă de server" });
  }
});

app.post('/api/run-cpp', (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Nu ai trimis niciun cod!" });
  }

  const uniqueId = crypto.randomBytes(8).toString('hex');
  const targetDir = '/tmp';
  const fileName = path.join(targetDir, `cod_${uniqueId}.cpp`);
  const exeName = path.join(targetDir, `program_${uniqueId}`);
  const inputFileName = path.join(targetDir, `input_${uniqueId}.txt`);

  fs.writeFileSync(fileName, code);
  fs.writeFileSync(inputFileName, input || "");

  exec(`g++ ${fileName} -o ${exeName}`, (compileError, stdout, stderr) => {
    if (compileError) {
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

      return res.status(400).json({
        status: "Eroare de compilare",
        error: stderr
      });
    }

    const executeCommand = `/usr/bin/time -f "PERF_STATS MEM:%M TIME:%e" ${exeName} < ${inputFileName}`;

    exec(executeCommand, { timeout: 2000, maxBuffer: 1024 * 512 }, (runError, runStdout, runStderr) => {
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
      if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

      if (runError) {
        if (runError.killed || runError.signal === 'SIGTERM') {
          return res.status(400).json({
            status: "Time Limit Exceeded (TLE)",
            error: "Codul tău a rulat mai mult de 2 secunde! Ai grijă la buclele infinite."
          });
        }

        if (runError.message && runError.message.includes("maxBuffer exceeded")) {
          return res.status(400).json({
            status: "Output Limit Exceeded",
            error: "Programul a generat prea mult text! Limita maximă afișabilă este de 512 KB."
          });
        }

        return res.status(400).json({
          status: "Runtime Error",
          error: runStderr || "Programul a returnat o eroare sau a crăpat în timpul execuției."
        });
      }

      const match = runStderr.match(/PERF_STATS MEM:(\d+) TIME:([\d.]+)/);

      let memoryUsedMb = 0;
      let timeUsedSec = 0;

      if (match) {
        const memoryKb = parseInt(match[1], 10);
        timeUsedSec = parseFloat(match[2]);
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

// --- RUTA COMPILARE PENTRU DUELURI (CU FIX DE CURĂȚARE REZULTATE) ---

app.post('/api/compile-duel', (req, res) => {
  const { code, roomId } = req.body;
  console.log(`[SANDBOX] Primit cod pentru compilare în camera: ${roomId}`);

  if (!code) {
    return res.status(400).json({ success: false, error: "Codul nu poate fi gol!" });
  }

  const problemConfig = arenaProblems.bubble_sort;
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const targetDir = '/tmp';
  
  const fileName = path.join(targetDir, `duel_${uniqueId}.cpp`);
  const exeName = path.join(targetDir, `duel_prog_${uniqueId}`);

  const fullCodeWithMain = `
#include <iostream>
#include <algorithm>
using namespace std;

${code}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int arr[n];
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    bubbleSort(arr, n);
    
    for(int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}
  `;

  fs.writeFileSync(fileName, fullCodeWithMain);

  exec(`g++ ${fileName} -o ${exeName}`, async (compileError, stdout, stderr) => {
    if (compileError) {
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      console.log(`[SANDBOX] Eroare de compilare g++!`);
      return res.json({ success: false, error: "Eroare de compilare:\n" + stderr });
    }

    let testsPassedCount = 0;
    let allTestsPassed = true;
    let errorMessage = "";

    for (let i = 0; i < problemConfig.tests.length; i++) {
      const currentTest = problemConfig.tests[i];
      const inputFileName = path.join(targetDir, `duel_in_${uniqueId}_${i}.txt`);
      
      fs.writeFileSync(inputFileName, currentTest.input);

      try {
        await new Promise((resolve, reject) => {
          exec(`${exeName} < ${inputFileName}`, { timeout: 1500 }, (runError, runStdout, runStderr) => {
            if (fs.existsSync(inputFileName)) fs.unlinkSync(inputFileName);

            if (runError) {
              allTestsPassed = false;
              errorMessage = `Testul ${i + 1} a eșuat (Runtime Error / TLE).`;
              reject();
              return;
            }

            // Fix spații și linii noi (\n)
            const userOutput = runStdout.replace(/\s+/g, ' ').trim();
            const expectedOutput = currentTest.expected.replace(/\s+/g, ' ').trim();

            if (userOutput !== expectedOutput) {
              allTestsPassed = false;
              errorMessage = `Testul ${i + 1} greșit!\nInput: ${currentTest.input.replace('\n', ' | ')}\nOutput-ul tău: "${userOutput}"\nOutput așteptat: "${expectedOutput}"`;
              reject();
              return;
            }

            testsPassedCount++;
            resolve();
          });
        });
      } catch (e) {
        break; 
      }
    }

    if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
    if (fs.existsSync(exeName)) fs.unlinkSync(exeName);

    const realProgressPercent = Math.round((testsPassedCount / problemConfig.tests.length) * 100);
    console.log(`[SANDBOX] Rezultat: ${testsPassedCount}/${problemConfig.tests.length} teste trecute.`);

    return res.json({
      success: true,
      allTestsPassed: allTestsPassed,
      progressPercent: realProgressPercent,
      error: errorMessage
    });
  });
});

// --- CONFIGURARE ȘI LOGICĂ SOCKET.IO (PĂSTRATĂ ȘI SECURIZATĂ) ---

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://info-motion.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

let matchmakingQueue = [];

io.on('connection', (socket) => {
  console.log(`[SOCKET CONNECT] Utilizator conectat: ${socket.id}`);

  socket.on('join_queue', (userData) => {
    if (matchmakingQueue.find(p => p.id === socket.id)) return;

    console.log(`Userul ${userData?.username || socket.id} a intrat în coadă.`);
    
    matchmakingQueue.push({
      id: socket.id,
      username: userData?.username || "Anonim"
    });

    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();
      const roomId = `room_${player1.id}_${player2.id}`;

      console.log(`🚀 Meci creat în camera ${roomId} între ${player1.username} și ${player2.username}`);

      // Trimitem direct pe id-urile unice ca să evităm desincronizarea camerelor native
      const matchPayload = {
        roomId: roomId,
        players: { p1: player1, p2: player2 },
        problem: {
          title: "Bug în Bubble Sort (C++)",
          description: "Algoritmul primit sortează elementele descrescător în loc de crescător. Modifică-l astfel încât vectorul să fie sortat corect în ordine crescătoare și să treacă toate testele sandbox-ului.",
          startingCode: `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] < arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}`
        }
      };

      io.to(player1.id).emit('match_found', matchPayload);
      io.to(player2.id).emit('match_found', matchPayload);
    }
  });

// Actualizare progres live (acum declanșat doar la rularea testelor)
  socket.on('update_progress', (data) => {
    io.emit('opponent_updated_progress_broadcast', data);
  });

  // Când cineva chiar trimite soluția salvată cu toate testele luate
  socket.on('player_solved', (data) => {
    const { roomId, username } = data;
    console.log(`[REAL WIN] Jucătorul ${username} a învins în camera ${roomId}`);
    
    // Serverul dă semnalul de stop global transmițând exact cine e campionul
    io.emit('duel_ended_broadcast', { 
      roomId, 
      winnerUsername: username 
    });
  });

  socket.on('leave_queue', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.id !== socket.id);
    console.log(`Un utilizator a ieșit manual din coadă: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.id !== socket.id);
    console.log(`Utilizator deconectat: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Serverul InfoMotion rulează pe portul ${PORT} (complet cu simulări și rute)`);
});