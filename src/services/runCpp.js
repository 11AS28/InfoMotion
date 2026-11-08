const COMPILE_TIMEOUT = 15000;
const RUN_TIMEOUT = 2000;
const WORKER_URL = '/cpp-toolchain/infomotion-cpp-worker.js';

export class CppFallbackError extends Error {}

let worker;

const createWorker = () => {
  return worker || (worker = new Worker(WORKER_URL));
};

const terminateWorker = () => {
  worker?.terminate();
  worker = null;
};

export const runCpp = (code, input, options = {}) => {
  if (typeof WebAssembly === 'undefined' || typeof SharedArrayBuffer === 'undefined') {
    throw new CppFallbackError('Browserul nu suportă izolarea necesară pentru C++ WASM.');
  }

  const currentWorker = createWorker();
  options.onProgress?.('Se încarcă compilatorul C++...');

  return new Promise((resolve, reject) => {
    let settled = false;
    const started = performance.now();
    let timer;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      currentWorker.removeEventListener('message', handleMessage);
      currentWorker.removeEventListener('error', handleError);
      resolve({
        status: result.status,
        output: result.output || '',
        error: result.error || '',
        time: result.time ?? Number(((performance.now() - started) / 1000).toFixed(3)),
        memory: null
      });
    };

    const armTimeout = (duration, status, message) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        terminateWorker();
        if (status === 'Compile Timeout') {
          finish({ status, error: message, time: duration / 1000 });
        } else {
          finish({ status, error: message, time: duration / 1000 });
        }
      }, duration);
    };

    const handleMessage = ({ data }) => {
      if (data.type === 'phase' && data.phase === 'run') {
        options.onPhase?.('run', performance.now());
        armTimeout(RUN_TIMEOUT, 'Time Limit Exceeded (TLE)', 'Programul a rulat mai mult de 2 secunde.');
        return;
      }
      if (data.type === 'phase') {
        options.onPhase?.(data.phase, performance.now());
        return;
      }
      if (data.type === 'result') {
        finish(data.result);
        return;
      }
      if (data.type === 'failure') {
        settled = true;
        clearTimeout(timer);
        currentWorker.removeEventListener('message', handleMessage);
        currentWorker.removeEventListener('error', handleError);
        terminateWorker();
        reject(new CppFallbackError(data.error));
      }
    };

    const handleError = (error) => {
      settled = true;
      clearTimeout(timer);
      currentWorker.removeEventListener('message', handleMessage);
      currentWorker.removeEventListener('error', handleError);
      terminateWorker();
      reject(new CppFallbackError(error.message || 'C++ WASM worker failed.'));
    };

    currentWorker.addEventListener('message', handleMessage);
    currentWorker.addEventListener('error', handleError);
    armTimeout(
      COMPILE_TIMEOUT,
      'Compile Timeout',
      'Compilatorul C++ a depășit limita de 15 secunde. Pe telefoane lente, prima încărcare poate dura mai mult.'
    );
    currentWorker.postMessage({ type: 'run', code, input });
  });
};
