import assert from "node:assert/strict";
import fs from "node:fs/promises";

const runnerPaths = [
  "maxrun/run_hf4pole_sweep.mjs",
  "maxrun/run_hfiso_sweep.mjs",
  "maxrun/run_bjt2_ppa_sweep.mjs",
];

for (const runnerPath of runnerPaths) {
  const source = await fs.readFile(runnerPath, "utf8");

  assert.match(source, /DEFAULT_PARALLEL\s*=\s*4/, `${runnerPath} should default to four ngspice jobs`);
  assert.match(source, /--parallel/, `${runnerPath} should accept a --parallel override`);
  assert.match(source, /function\s+runPool/, `${runnerPath} should run ngspice jobs through a bounded pool`);
  assert.match(source, /spawn\(/, `${runnerPath} should use async child processes`);
  assert.doesNotMatch(source, /spawnSync/, `${runnerPath} should not block on spawnSync`);
}

console.log("parallel sweep runner checks passed");
