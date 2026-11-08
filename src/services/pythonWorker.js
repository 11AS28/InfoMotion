const PYODIDE_VERSION = '0.27.2';
const OUTPUT_LIMIT = 512 * 1024;

let pyodidePromise;

const loadPyodide = async () => {
  if (!pyodidePromise) {
    const pyodideUrl = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
    const { loadPyodide: load } = await import(/* @vite-ignore */ pyodideUrl);
    pyodidePromise = load({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
    });
  }
  return pyodidePromise;
};

const runPython = async ({ code, input }) => {
  const pyodide = await loadPyodide();
  const source = JSON.stringify(code ?? '');
  const stdin = JSON.stringify(input ?? '');

  const result = await pyodide.runPythonAsync(`
import builtins
import io
import json
import sys
import time
import traceback

code = ${source}
input_data = ${stdin}

class OutputLimitExceeded(Exception):
    pass

class LimitedWriter(io.TextIOBase):
    def __init__(self):
        self.value = []
        self.size = 0

    def write(self, text):
        text = str(text)
        if self.size + len(text.encode("utf-8")) > ${OUTPUT_LIMIT}:
            raise OutputLimitExceeded()
        self.value.append(text)
        self.size += len(text.encode("utf-8"))
        return len(text)

    def flush(self):
        pass

    def getvalue(self):
        return "".join(self.value)

class LineInput(io.TextIOBase):
    def __init__(self, value):
        self.lines = value.splitlines(True)
        if value and not self.lines:
            self.lines = [value]
        self.index = 0

    def readline(self, size=-1):
        if self.index >= len(self.lines):
            return ""
        line = self.lines[self.index]
        self.index += 1
        if size >= 0:
            return line[:size]
        return line

stdout = LimitedWriter()
stderr = LimitedWriter()
old_stdout, old_stderr, old_stdin = sys.stdout, sys.stderr, sys.stdin
started = time.perf_counter()
status = "Succes"
error = ""

try:
    sys.stdout, sys.stderr, sys.stdin = stdout, stderr, LineInput(input_data)
    namespace = {"__name__": "__main__", "__builtins__": builtins.__dict__}
    exec(compile(code, "<student_code>", "exec"), namespace, namespace)
except OutputLimitExceeded:
    status = "Output Limit Exceeded"
    error = "Programul a generat mai mult de 512KB output."
except BaseException as exception:
    status = "Runtime Error"
    frames = [
        frame for frame in traceback.extract_tb(exception.__traceback__)
        if frame.filename == "<student_code>"
    ]
    error = "Traceback (most recent call last):\\n"
    error += "".join(traceback.format_list(frames))
    error += "".join(traceback.format_exception_only(type(exception), exception))
finally:
    sys.stdout, sys.stderr, sys.stdin = old_stdout, old_stderr, old_stdin

json.dumps({
    "status": status,
    "output": stdout.getvalue(),
    "error": error if error else stderr.getvalue(),
    "time": round(time.perf_counter() - started, 3),
    "memory": None
})
`);

  return JSON.parse(result);
};

self.postMessage({ type: 'ready' });

self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;

  try {
    self.postMessage({ type: 'result', result: await runPython(data) });
  } catch (error) {
    self.postMessage({
      type: 'result',
      result: {
        status: 'Runtime Error',
        output: '',
        error: error instanceof Error ? error.message : String(error),
        time: 0,
        memory: null
      }
    });
  }
};
