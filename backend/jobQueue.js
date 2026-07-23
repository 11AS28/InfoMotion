/**
 * jobQueue.js
 * Coadă de joburi cu pool de workeri pentru compilare/execuție C++ și Python în Docker Sandbox
 */

const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_WORKERS = parseInt(process.env.MAX_WORKERS) || 2;
const COMPILE_TIMEOUT_MS = parseInt(process.env.COMPILE_TIMEOUT_MS) || 10_000; // 10s
const RUN_TIMEOUT_MS = parseInt(process.env.RUN_TIMEOUT_MS) || 2_000;          // 2s
const MAX_OUTPUT_BYTES = 512 * 1024;                                             // 512 KB
const TMP_DIR = process.env.TMP_DIR || '/tmp';

let activeWorkers = 0;
const queue = [];

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
      scheduleNext();
    });
}

function enqueue(jobFn) {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject, jobFn });
    scheduleNext();
  });
}

// ─── Utilitare fișiere ───────────────────────────────────────────────────────
function uniqueFiles(language) {
  const id = crypto.randomBytes(8).toString('hex');
  const ext = language === 'python' ? 'py' : 'cpp';
  return {
    id,
    containerName: `sandbox_${id}`, // Nume unic pentru Docker Container
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

// ─── Job-ul propriu-zis ──────────────────────────────────────────────────────
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

    // 3. EXECUȚIE ÎN DOCKER SANDBOX
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
    cleanupFiles(files.fullSrc, files.fullExe, files.fullInp);
  }
}

// ─── Funcția de spawn specială pentru Sandbox ────────────────────────────
function runInDockerSandbox(files, language) {
  return new Promise((resolve) => {
    const inputFd = fs.openSync(files.fullInp, 'r');

    // [D] Flag-ul -B previne generarea de fișiere .pyc pe disc
    const runCmd = language === 'python'
      ? `python3 -B ./${files.src}`
      : `./${files.exe}`;

    const dockerArgs = [
      'run', '--rm',
      '--name', files.containerName, // [A] Nume unic pentru a putea fi oprit individual
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

      const runtimeError = code !== 0 || code === 137;

      resolve({
        stdout,
        stderr,
        memoryMb: null,
        timeSec: null,
        runtimeError: runtimeError && stderr.length >= 0 && code !== 0,
      });
    });

    // [A] Timeout fixat: Omoară DOAR containerul curent folosind containerName
    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');

      execFile('docker', ['kill', files.containerName], () => {
        // Ignorăm erorile dacă containerul se închisese deja singur între timp
      });
    }, RUN_TIMEOUT_MS + 500);

    proc.on('close', () => clearTimeout(timer));
  });
}

// ─── Export public ───────────────────────────────────────────────────────────
module.exports = {
  submitCodeJob(code, input, language = 'cpp') {
    return enqueue(() => codeJob(language, code, input));
  },
  getQueueStats,
};