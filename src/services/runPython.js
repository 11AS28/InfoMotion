import PythonWorker from './pythonWorker.js?worker';

const DEFAULT_TIMEOUT = 5000;

let worker = null;
let workerReady = null;

const createWorker = () => {
  worker = new PythonWorker();
  workerReady = new Promise((resolve, reject) => {
    const handleMessage = ({ data }) => {
      if (data.type === 'ready') {
        worker.removeEventListener('message', handleMessage);
        resolve();
      }
    };
    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', (error) => {
      worker = null;
      workerReady = null;
      reject(error);
    }, { once: true });
  });
  return worker;
};

const getWorker = () => worker || createWorker();

export const runPython = (code, input, options = {}) => {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const currentWorker = getWorker();

  return workerReady.catch((error) => ({
    status: 'Runtime Error',
    output: '',
    error: error.message || 'Python worker failed to load.',
    time: 0,
    memory: null
  })).then((readyResult) => {
    if (readyResult) return readyResult;

    return new Promise((resolve) => {
    let settled = false;
    const started = performance.now();

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      currentWorker.removeEventListener('message', handleMessage);
      currentWorker.removeEventListener('error', handleError);
      resolve(result);
    };

    const handleMessage = ({ data }) => {
      if (data.type === 'result') {
        finish(data.result);
      }
    };

    const handleError = (error) => {
      worker = null;
      workerReady = null;
      finish({
        status: 'Runtime Error',
        output: '',
        error: error.message || 'Python worker failed.',
        time: Number(((performance.now() - started) / 1000).toFixed(3)),
        memory: null
      });
    };

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      currentWorker.terminate();
      worker = null;
      workerReady = null;
      currentWorker.removeEventListener('message', handleMessage);
      currentWorker.removeEventListener('error', handleError);
      resolve({
        status: 'Time Limit Exceeded (TLE)',
        output: '',
        error: 'Execution timed out after 5 seconds.',
        time: timeout / 1000,
        memory: null
      });
    }, timeout);

    currentWorker.addEventListener('message', handleMessage);
    currentWorker.addEventListener('error', handleError);
    currentWorker.postMessage({ type: 'run', code, input });
    });
  });
};
