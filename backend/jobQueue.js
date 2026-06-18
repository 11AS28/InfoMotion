/**
 * jobQueue.js
 * Coadă de joburi cu pool de workeri pentru compilare/execuție C++ în Docker Sandbox
 *
 * Funcționează ca pbinfo/infoarena (Izolat complet în containere Docker):
 * request → coadă → worker liber → compilare în Docker → execuție în Docker → răspuns
 */

const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_WORKERS = parseInt(process.env.MAX_WORKERS) || 2; // compilări simultane
const COMPILE_TIMEOUT_MS = parseInt(process.env.COMPILE_TIMEOUT_MS) || 10_000; // 10s
const RUN_TIMEOUT_MS = parseInt(process.env.RUN_TIMEOUT_MS) || 2_000;          // 2s
const MAX_OUTPUT_BYTES = 512 * 1024;                                             // 512 KB
const TMP_DIR = process.env.TMP_DIR || '/tmp';

let activeWorkers = 0;
const queue = []; // Array de { resolve, reject, jobFn }

function getQueueStats() {
  return {
    activeWorkers,
    maxWorkers: MAX_WORKERS,
    queueLength: queue.length,
  };
}

// ─── Scheduler intern ────────────────────────────────────────────────────────
function scheduleNext() {
  if (activeWorkers >= MAX_WORKERS || queue.length === 0) return;

  const { resolve, reject, jobFn } = queue.shift();
  activeWorkers++;

  Promise.resolve()
    .then(() => jobFn())
    .then(resolve)
    .catch(reject)
    .finally(() => {
      activeWorkers--;
      scheduleNext(); // încearcă să pornească următorul job
    });
}

function enqueue(jobFn) {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject, jobFn });
    scheduleNext();
  });
}

// ─── Utilitare fișiere ───────────────────────────────────────────────────────
function uniqueFiles() {
  const id = crypto.randomBytes(8).toString('hex');
  return {
    id,
    src: `src_${id}.cpp`,
    exe: `exe_${id}`,
    inp: `inp_${id}.txt`,
    // Căile absolute folosite pentru scriere pe server (gazdă)
    fullSrc: path.join(TMP_DIR, `src_${id}.cpp`),
    fullExe: path.join(TMP_DIR, `exe_${id}`),
    fullInp: path.join(TMP_DIR, `inp_${id}.txt`),
  };
}

function cleanupFiles(...files) {
  for (const f of files) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (_) {}
  }
}

// ─── Job-ul propriu-zis (compilare + execuție izolate în Docker) ───────────────
async function cppJob(code, input) {
  const files = uniqueFiles();

  try {
    // 1. Scriem fișierele temporare în folderul TMP_DIR de pe sistemul gazdă
    fs.writeFileSync(files.fullSrc, code, 'utf8');
    fs.writeFileSync(files.fullInp, input ?? '', 'utf8');

    // 2. COMPILARE ÎN DOCKER
    // Rulăm g++ în interiorul containerului mapând folderul temporar la /app
    const compileArgs = [
  'run', '--rm',
  '-v', `${TMP_DIR}:/sandbox`, // Mapăm folderul temporar la /sandbox (așa cum ai definit în WORKDIR)
  '-w', '/sandbox',
  'infomotion-sandbox:latest', // Folosim noua ta imagine
  'g++', files.src, '-O2', '-o', files.exe, '-std=c++17'
];

    const compileResult = await new Promise((resolve) => {
      const proc = execFile('docker', compileArgs, { timeout: COMPILE_TIMEOUT_MS, maxBuffer: 512 * 1024 }, (err, stdout, stderr) => {
        resolve({ err, stdout, stderr });
      });
    });

    if (compileResult.err) {
      const isTimeout =
        compileResult.err.killed || compileResult.err.signal === 'SIGTERM' || compileResult.err.code === null;

      if (isTimeout) {
        return {
          status: 'Compile Timeout',
          error: `Compilarea a durat mai mult de ${COMPILE_TIMEOUT_MS / 1000}s.`,
        };
      }
      return {
        status: 'Eroare de compilare',
        error: compileResult.stderr || compileResult.err.message,
      };
    }

    // 3. EXECUȚIE ÎN DOCKER SANDBOX (cu limitări de hardware stricte)
    const runResult = await runInDockerSandbox(files);

    if (runResult.timedOut) {
      return {
        status: 'Time Limit Exceeded (TLE)',
        error: `Codul a rulat mai mult de ${RUN_TIMEOUT_MS / 1000}s! Ai grijă la bucle infinite.`,
      };
    }

    if (runResult.outputExceeded) {
      return {
        status: 'Output Limit Exceeded',
        error: `Programul a generat mai mult de ${MAX_OUTPUT_BYTES / 1024}KB output.`,
      };
    }

    if (runResult.runtimeError) {
      return {
        status: 'Runtime Error',
        error: runResult.stderr || 'Programul a crăpat în timpul execuției (Ex: Kiled / Memorie depășită).',
      };
    }

    return {
      status: 'Succes',
      output: runResult.stdout,
      memory: runResult.memoryMb,
      time: runResult.timeSec,
    };
  } finally {
    // Cleanup garantat pentru fișierele de pe sistemul gazdă
    cleanupFiles(files.fullSrc, files.fullExe, files.fullInp);
  }
}

// ─── Funcția de spawn specială pentru Sandbox ────────────────────────────
function runInDockerSandbox(files) {
  return new Promise((resolve) => {
    // Deschidem fișierul de input de pe sistemul gazdă pentru a-l injecta ca stdin
    const inputFd = fs.openSync(files.fullInp, 'r');

    // Construim comanda Docker securizată
    // --memory="64m": Limită rigidă de RAM (dacă o depășește, ia Crash/OOM instant)
    // --cpus="0.5": Alocă maxim jumătate de nucleu de procesor ca să nu poată bloca serverul principal
    // --network none: Blochează accesul la internet din interiorul codului C++
    const dockerArgs = [
  'run', '--rm',
  '-i',
  '--read-only',              // 1. Face tot sistemul containerului Read-Only
  '--tmpfs', '/tmp:rw,noexec,nosuid,size=4m', // 2. Permite scriere DOAR în /tmp, dar fără drept de execuție binarie acolo
  '--user', '1000:1000',      // 3. Forțează ID-ul de utilizator non-root (elev)
  '--memory=64m',
  '--cpus=0.5',
  '--network=none',
  '-v', `${TMP_DIR}:/sandbox:rw`, // Mapăm doar folderul de lucru
  '-w', '/sandbox',
  'infomotion-sandbox:latest',
  'sh', '-c', `/usr/bin/time -f "PERF_STATS MEM:%M TIME:%e" ./${files.exe}`
];

    const proc = spawn('docker', dockerArgs, {
      stdio: [inputFd, 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let outputExceeded = false;
    let timedOut = false;

    proc.stdout.on('data', (chunk) => {
      if (stdout.length + chunk.length > MAX_OUTPUT_BYTES) {
        outputExceeded = true;
        proc.kill('SIGKILL');
        return;
      }
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code, signal) => {
      fs.closeSync(inputFd);

      if (outputExceeded) {
        return resolve({ outputExceeded: true });
      }

      // Dacă a fost tăiat de watchdog-ul de proces sau semnalul Docker
      if (signal === 'SIGTERM' || signal === 'SIGKILL' || timedOut) {
        return resolve({ timedOut: true });
      }

      // Parsăm statisticile scrise de utilitarul /usr/bin/time din interiorul imaginii Linux
      const match = stderr.match(/PERF_STATS MEM:(\d+) TIME:([\d.]+)/);
      let memoryMb = 0;
      let timeSec = 0;
      
      if (match) {
        // În Linux, %M returnează în Kilobytes, îl convertim în Megabytes curat
        memoryMb = parseFloat((parseInt(match[1], 10) / 1024).toFixed(2));
        timeSec = parseFloat(match[2]);
        // Eliminăm linia tehnică din stderr ca să lăsăm doar erorile reale de execuție ale elevului
        stderr = stderr.replace(/PERF_STATS MEM:\d+ TIME:[\d.]+\n?/, '').trim();
      }

      // Code 137 în Docker înseamnă de obicei OOM (Out Of Memory) - tăiat pentru că a depășit 64MB
      const runtimeError = (code !== 0 && !match) || code === 137;

      resolve({
        stdout,
        stderr,
        memoryMb,
        timeSec,
        runtimeError: runtimeError || (code !== 0 && stderr.length > 0),
      });
    });

    // Watchdog de siguranță: dacă Docker se blochează, îl dărâmăm forțat
    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
      
      // Backup forțat: rulăm o comandă rapidă de terminare a containerului orfan dacă e cazul
      execFile('docker', ['ps', '-q', '--filter', `ancestor=gcc:latest`], (err, stdout) => {
        if (stdout) {
          const lines = stdout.trim().split('\n');
          lines.forEach(id => { if (id) execFile('docker', ['kill', id]); });
        }
      });
    }, RUN_TIMEOUT_MS + 500);

    proc.on('close', () => clearTimeout(timer));
  });
}

// ─── Export public ───────────────────────────────────────────────────────────
module.exports = {
  /**
   * Trimite un job C++ în coadă pentru a fi rulat în Sandbox.
   * @returns {Promise<Object>} rezultatul compilării/execuției
   */
  submitCppJob(code, input) {
    return enqueue(() => cppJob(code, input));
  },

  getQueueStats,
};