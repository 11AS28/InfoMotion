importScripts('./binji-shared.js');

const OUTPUT_LIMIT = 512 * 1024;
const COMPILE_TIMEOUT = 15000;

let api;
let currentOutput;

const appendOutput = (text, fd) => {
  if (!currentOutput || (fd !== 1 && fd !== 2)) return;
  const bytes = new TextEncoder().encode(text);
  const target = fd === 1 ? currentOutput.stdout : currentOutput.stderr;
  currentOutput.size += bytes.byteLength;
  if (currentOutput.size <= OUTPUT_LIMIT) target.push(text);
  else currentOutput.exceeded = true;
};

const createApi = () => {
  const options = {
    async readBuffer(filename) {
      const response = await fetch(filename);
      if (!response.ok) throw new Error(`Toolchain resource failed to load: ${response.status}`);
      return response.arrayBuffer();
    },
    async compileStreaming(filename) {
      return WebAssembly.compile(await (await fetch(filename)).arrayBuffer());
    },
    hostWrite(text, fd) {
      appendOutput(text, fd);
    },
    clang: './clang',
    lld: './lld',
    memfs: './memfs',
    sysroot: './sysroot.tar'
  };
  return new API(options);
};

const outputResult = () => ({
  output: currentOutput.stdout.join(''),
  error: currentOutput.stderr.join(''),
  outputExceeded: currentOutput.exceeded
});

const compileAndRun = async ({ code, input }) => {
  api ||= createApi();
  self.postMessage({ type: 'phase', phase: 'toolchain-ready' });
  await api.ready;
  currentOutput = { stdout: [], stderr: [], size: 0, exceeded: false };
  api.memfs.setStdinStr(input);

  try {
    self.postMessage({ type: 'phase', phase: 'compile-start' });
    await api.compile({ input: 'main.cpp', contents: code, obj: 'main.o' });
  } catch (error) {
    return { status: 'Eroare de compilare', ...outputResult(), error: outputResult().error || error.message };
  }

  currentOutput = { stdout: [], stderr: [], size: 0, exceeded: false };
  try {
    self.postMessage({ type: 'phase', phase: 'link-start' });
    await api.link('main.o', 'main.wasm');
  } catch (error) {
    return { status: 'Eroare de compilare', ...outputResult(), error: outputResult().error || error.message };
  }

  if (currentOutput.exceeded) {
    return { status: 'Output Limit Exceeded', ...outputResult() };
  }

  const module = await WebAssembly.compile(api.memfs.getFileContents('main.wasm'));
  currentOutput = { stdout: [], stderr: [], size: 0, exceeded: false };
  self.postMessage({ type: 'phase', phase: 'run' });
  try {
    await api.run(module, 'main.wasm');
  } catch (error) {
    return { status: 'Runtime Error', ...outputResult(), error: outputResult().error || error.message };
  }

  const result = outputResult();
  return {
    status: result.outputExceeded ? 'Output Limit Exceeded' : 'Succes',
    ...result
  };
};

self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  const started = performance.now();
  try {
    const result = await compileAndRun(data);
    self.postMessage({
      type: 'result',
      result: { ...result, time: Number(((performance.now() - started) / 1000).toFixed(3)), memory: null }
    });
  } catch (error) {
    self.postMessage({
      type: 'failure',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
