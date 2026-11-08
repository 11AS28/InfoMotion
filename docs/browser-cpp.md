# Browser C++ toolchain

The browser runner uses the binji/wasm-clang layout directly. These files must
remain together under `public/cpp-toolchain/`:

| File | Role | Current size |
|---|---|---:|
| `clang` | Clang WASI compiler | 31,214,472 bytes |
| `lld` | wasm-ld WASI linker | 19,490,094 bytes |
| `memfs` | binji in-memory filesystem WASM module | 345,442 bytes |
| `sysroot.tar` | libc++ headers and WASI libraries | 9,297,920 bytes |
| `binji-shared.js` | binji runtime and tar extractor | 23,973 bytes |
| `infomotion-cpp-worker.js` | InfoMotion worker adapter | source file |

The four binary artifacts total **60,347,928 bytes** before HTTP compression
(about 57.5 MiB). `binji-shared.js` is vendored from the repository's
`shared.js` and retains its upstream license. The worker follows the upstream
sequence: initialize `memfs`, untar `sysroot.tar`, invoke Clang to emit
`main.o`, invoke LLD to produce `main.wasm`, then instantiate and run it with
stdin. Successful responses are cached by the browser's normal HTTP cache.

Serve these files with their correct content types and Brotli (`br`) or gzip
compression where applicable. `.wasm` should be `application/wasm`; the
toolchain's WASI executables are fetched as binary files and compiled with
`WebAssembly.compile`.

## Runtime limitations

Supported and verified: C++ console programs using `iostream`, `vector`,
`algorithm`, `string`, recursion, and ordinary stdin/stdout. The WASI sandbox
does not provide network access, threads, GUI APIs, process spawning, or a
general host filesystem. `std::filesystem`, file I/O, OS-specific headers,
signals, and native shared libraries are not available. Exceptions may compile
but should not be promised as a portable feature until separately tested.

The UI should explain this before execution:

> Browser C++ supports C++17 console programs. Network, threads, files, OS
> APIs, and filesystem are unavailable.

## Verification checklist

The following cases were run in a Chromium browser against the local Vite
server after downloading these exact files:

- hello world — **PASS**
- `cin` of integers — **PASS**
- `getline` — **PASS**
- `vector` + `sort` — **PASS** (after linking the sysroot's
  `libclang_rt.builtins-wasm32.a`)
- recursive Fibonacci — **PASS**
- compile error with line number — **PASS** (line 3 was reported)
- infinite loop — **PASS** (`Time Limit Exceeded (TLE)` at 2 seconds through
  `runCpp`)
- huge output — **PASS** (`Output Limit Exceeded` at 512 KiB)
- missing input / EOF — **PASS**
- runtime crash — **NOT RELIABLE** with this old binji toolchain: tested integer
  division by zero compiled to a successful `0` result instead of a runtime
  error. Do not present this as a guaranteed crash detector.

Additional runtime-error retest:

- input-dependent division by zero (`10 / b`, input `0`) — **PASS**:
  `Runtime Error`, `divide by zero`
- exact infinite recursion — **NOT DETECTED**: `Succes` with empty output
- vector out-of-bounds write — **NOT DETECTED**: `Succes`, output `after`
- `return 3` — **PASS**: `Runtime Error`, `process exited with code 3.`
- `std::abort()` — **PASS**: `Runtime Error`, `unreachable`

The WASI exit-code and WebAssembly-trap paths are mapped to `Runtime Error`
with readable messages. This toolchain does not provide bounds checking for
ordinary linear-memory accesses, and the tested recursive overflow did not
produce a trap, so students must not be told that arbitrary memory bugs or
stack exhaustion are reliably detected.

COOP/COEP are not required: the implementation uses ordinary WebAssembly
memory and worker messages, not `SharedArrayBuffer`, `Atomics`, or
`crossOriginIsolated`. They were removed from Vite and Vercel. Chromium
reported `crossOriginIsolated: false` while the full checklist still passed.

## Performance measurements

Measured in Chromium on the local Vite server with the browser cache cleared
before the first run. The downloaded binary payload is 60,347,928 bytes
(57.5 MiB), excluding HTTP headers and JavaScript.

| Run | Toolchain ready | Hello compile+link | Total run |
|---|---:|---:|---:|
| Cold cache, first run | 13.6 ms | 1,283 ms | 1,371 ms |
| Warm cache, second run | 12.0 ms | 818 ms | 909 ms |
| Warm `<vector>`, `<algorithm>`, `<map>` | 11.6 ms | 957 ms | 1,036 ms |

The worker and its binji API remain alive for the page session. The extracted
sysroot and compiled clang/lld/memfs modules are reused. Each run resets
stdin/output and overwrites the fixed source/object/wasm paths, so student
globals do not carry over. A timeout terminates the worker; the next run
creates and initializes a fresh one. The browser timeout-then-hello test
returned `Time Limit Exceeded (TLE)` followed by `Succes` with output `after`.

The 15-second compile/link timeout is reasonable for desktop and modern phones,
but a slow phone may need the full budget during the first download and module
initialization. The UI timeout message explicitly says that the first load can
take longer on slow phones. If telemetry later shows false timeouts, increase
the compile budget to 20 seconds; keep the 2-second program runtime limit.
