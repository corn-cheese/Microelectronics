import assert from "node:assert/strict";
import fs from "node:fs/promises";

const runnerPath = "maxrun/run_bjt2_ppa_sweep.mjs";
const source = await fs.readFile(runnerPath, "utf8");

assert.match(source, /DEFAULT_PARALLEL\s*=\s*4/, "bjt2 runner should default to four ngspice jobs");
assert.match(source, /--parallel/, "bjt2 runner should accept a --parallel override");
assert.match(source, /function\s+runPool/, "bjt2 runner should run ngspice jobs through a bounded pool");
assert.match(source, /function\s+stem/, "bjt2 runner should centralize bjt2 stem naming");
assert.match(source, /function\s+isPlotWritePermissionError/, "bjt2 runner should identify plot write permission failures");
assert.match(source, /async\s+function\s+writePlotsBestEffort/, "bjt2 runner should make final plot writes best-effort after numeric deliverables");
assert.match(source, /async\s+function\s+selectWritableArtifactDir/, "bjt2 runner should select a writable artifact directory before invoking ngspice");
assert.match(source, /csv_tmp/, "bjt2 runner should have a writable CSV fallback for locked result directories");
assert.match(source, /raw_tmp/, "bjt2 runner should have a writable raw fallback for locked result directories");
assert.match(source, /plots_tmp/, "bjt2 runner should have a writable plot fallback for locked result directories");
assert.match(source, /selectWritableArtifactDir\(canonicalPlotDir,[\s\S]*"plot"\)/, "bjt2 runner should report when plots use a fallback directory");
assert.match(source, /permission denied/i, "bjt2 runner log scan should catch ngspice file permission failures");
assert.match(source, /ROPAMP/, "bjt2 runner should model the OPAMP follower with a finite-bandwidth pole");
assert.match(source, /COPAMP=\{1\/\(2\*pi\*ROPAMP\*OPAMP_FT\)\}/, "bjt2 runner should derive the OPAMP pole capacitor from OPAMP_FT");
assert.doesNotMatch(source, /EBUF vbuf 0 vout_drv 0 1/, "bjt2 runner should not use an unlimited-bandwidth output follower");
assert.match(source, /row\.high_slope_100k_1meg <= -80/, "bjt2 acceptance gate should enforce the stated -80 dB/dec far-rolloff target");
assert.match(source, /bjt2_sweep_ppa_/, "bjt2 runner should generate bjt2 sweep artifacts");
assert.doesNotMatch(source, /bjt3_sweep_.*_\$\{kind\}\.spice/, "bjt2 runner must not emit bjt3 netlists");
assert.match(source, /bjt2_vs_bjt3_comparison\.csv/, "bjt2 runner should write the final comparison table");

console.log("bjt2 runner structure checks passed");
