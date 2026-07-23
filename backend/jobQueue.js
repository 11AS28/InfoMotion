/**
 * jobQueue.js
 * Coadă de joburi cu pool de workeri pentru compilare/execuție C++ și Python în Docker Sandbox
 *
 * Funcționează ca pbinfo/infoarena (Izolat complet în containere Docker):
 * request → coadă → worker liber → (compilare dacă e cazul) → execuție în Docker → răspuns
 */

const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_WORKERS = parseInt(process.env.MAX_WORKERS) || 2; // compilări/execuții simultane
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

// ─── Auto-detectare limbaj (ca să nu fie nevoie ca frontend-ul să trimită explicit) ──
function detectLanguage(code) {
  if (!code || typeof code !== 'string') return 'cpp';

  const trimmed = code.trim();

  // Semnale puternice de C/C++
  const cppSignals = [
    /#include\s*<\w+/,
    /using\s+namespace\s+std/,
    /int\s+main\s*\(/,
    /std::/,
    /cout\s*<</,
    /cin\s*>>/,
  ];

  // Semnale puternice de Python
  const pySignals = [
    /^\s*import\s+\w+/m,
    /^\s*from\s+\w+\s+import/m,
    /^\s*def\s+\w+\s*\(.*\)\s*:/m,
    /print\s*\(.*\)\s*$/m,
    /^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m,
    /:\s*$/m, // linii terminate în ':' (def/if/for/while python-style)
  ];

  let cppScore = 0;
  let pyScore = 0;

  for (const rx of cppSignals) if (rx.test(trimmed)) cppScore++;
  for (const rx of pySignals) if (rx.test(trimmed)) pyScore++;

  // Semnal decisiv: ';' la finalul liniilor + acolade => aproape sigur C++
  const semicolonLines = (trimmed.match(/;\s*$/gm) || []).length;
  const braceCount = (trimmed.match(/[{}]/g) || []).length;
  if (semicolonLines > 2 || braceCount > 2) cppScore += 2;

  if (pyScore > cppScore) return 'python';
  return 'cpp'; // default, păstrează comportamentul vechi dacă nu suntem siguri
}

// ─── Utilitare fișiere ───────────────────────────────────────────────────────
function uniqueFiles(language) {
  const id = crypto.randomBytes(8).toString('hex');
  const ext = language === 'python' ? 'py' : 'cpp';
  return {
    id,
    src: `src_${id}.${ext}`,
    exe: `exe_${id}`,
    inp: `inp_${id}.txt`,
    fullSrc: path.join(TMP_DIR, `src_${id}.${ext}`),
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

// ─── Job-ul propriu-zis (compilare, dacă e cazul, + execuție izolate în Docker) ──
async function codeJob(language, code, input) {
  const files = uniqueFiles(language);

  try {
    // 1. Scriem fișierele temporare pe sistemul gazdă
    fs.writeFileSync(files.fullSrc, code, 'utf8');
    fs.writeFileSync(files.fullInp, input ?? '', 'utf8');

    // 2. COMPILARE ÎN DOCKER — doar pentru C++
    if (language === 'cpp') {
      const compileArgs = [
        'run', '--rm',
        '-v', `${TMP_DIR}:/sandbox`,
        '-w', '/sandbox',
        'infomotion-sandbox:latest',
        'g++', files.src, '-O2', '-o', files.exe, '-std=c++17'
      ];

      const compileResult = await new Promise((resolve) => {
        execFile('docker', compileArgs, { timeout: COMPILE_TIMEOUT_MS, maxBuffer: 512 * 1024 }, (err, stdout, stderr) => {
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
    }
    // Pentru Python nu există pas de compilare — sărim direct la execuție.

    // 3. EXECUȚIE ÎN DOCKER SANDBOX (limitări stricte de hardware, identice pentru ambele limbaje)
    const runResult = await runInDockerSandbox(files, language);

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
        error: runResult.stderr || 'Programul a crăpat în timpul execuției (Ex: Killed / Memorie depășită).',
      };
    }

    return {
      status: 'Succes',
      output: runResult.stdout,
      memory: runResult.memoryMb,
      time: runResult.timeSec,
      language,
    };
  } finally {
    // Cleanup garantat pentru fișierele de pe sistemul gazdă
    cleanupFiles(files.fullSrc, files.fullExe, files.fullInp);
  }
}

// ─── Funcția de spawn specială pentru Sandbox ────────────────────────────
function runInDockerSandbox(files, language) {
  return new Promise((resolve) => {
    const inputFd = fs.openSync(files.fullInp, 'r');

    // Fără /usr/bin/time — rulăm direct programul
    const runCmd = language === 'python'
      ? `python3 ./${files.src}`
      : `./${files.exe}`;

    const dockerArgs = [
      'run', '--rm',
      '-i',
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=4m',
      '--user', '1000:1000',
      '--memory=64m',
      '--cpus=0.5',
      '--network=none',
      '-v', `${TMP_DIR}:/sandbox:rw`,
      '-w', '/sandbox',
      'infomotion-sandbox:latest',
      'sh', '-c', runCmd
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

      if (signal === 'SIGTERM' || signal === 'SIGKILL' || timedOut) {
        return resolve({ timedOut: true });
      }

      // Fără /usr/bin/time nu mai avem stats de memorie/timp
      // Code 137 = OOM kill (limita --memory=64m depășită)
      const runtimeError = code !== 0 || code === 137;

      resolve({
        stdout,
        stderr,
        memoryMb: null,
        timeSec: null,
        runtimeError: runtimeError && stderr.length >= 0 && code !== 0,
      });
    });

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');

      execFile('docker', ['ps', '-q', '--filter', `ancestor=infomotion-sandbox:latest`], (err, stdout) => {
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
   * Trimite un job de cod în coadă pentru a fi rulat în Sandbox.
   * Dacă `language` nu e specificat, se detectează automat din conținutul codului.
   * @param {string} code
   * @param {string} input
   * @param {string} [language] - 'cpp' | 'python' (opțional)
   * @returns {Promise<Object>} rezultatul compilării/execuției
   */
  submitCodeJob(code, input, language) {
    const finalLanguage = language || detectLanguage(code);
    return enqueue(() => codeJob(finalLanguage, code, input));
  },

  detectLanguage,
  getQueueStats,
};