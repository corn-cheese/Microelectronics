import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..").replace(/\\/g, "/");
const ngspice = "C:/eda/ngspice/Spice64/bin/ngspice_con.exe";
const netlistDir = `${root}/netlists`;
const csvDir = `${root}/results/ngspice/csv`;
const rawDir = `${root}/results/ngspice/raw`;
const logDir = `${root}/results/ngspice/logs`;
const tableDir = `${root}/results/ngspice/tables`;
const baselineVersion = "bjt3_sweep_coutalign_c10n";
const DEFAULT_PARALLEL = 4;
const RUN_PARALLEL = parseParallelArg(process.argv.slice(2));

const candidates = [
  { chSuffix: "22p", ch: "22p", rSuffix: "330k", riso: "330k", risoNumeric: 330e3 },
  { chSuffix: "22p", ch: "22p", rSuffix: "470k", riso: "470k", risoNumeric: 470e3 },
  { chSuffix: "22p", ch: "22p", rSuffix: "680k", riso: "680k", risoNumeric: 680e3 },
  { chSuffix: "18p", ch: "18p", rSuffix: "330k", riso: "330k", risoNumeric: 330e3 },
  { chSuffix: "18p", ch: "18p", rSuffix: "470k", riso: "470k", risoNumeric: 470e3 },
  { chSuffix: "18p", ch: "18p", rSuffix: "680k", riso: "680k", risoNumeric: 680e3 },
  { chSuffix: "15p", ch: "15p", rSuffix: "330k", riso: "330k", risoNumeric: 330e3 },
  { chSuffix: "15p", ch: "15p", rSuffix: "470k", riso: "470k", risoNumeric: 470e3 },
  { chSuffix: "15p", ch: "15p", rSuffix: "680k", riso: "680k", risoNumeric: 680e3 },
];

function parseParallelArg(args) {
  const index = args.findIndex((arg) => arg === "--parallel" || arg.startsWith("--parallel="));
  if (index === -1) return DEFAULT_PARALLEL;
  const raw = args[index].includes("=") ? args[index].split("=")[1] : args[index + 1];
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--parallel must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

function stem(candidate) {
  return `bjt3_sweep_hfiso_ch${candidate.chSuffix}_r${candidate.rSuffix}`;
}

function fmt(n, digits = 8) {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if ((abs !== 0 && abs < 1e-3) || abs >= 1e6) {
    return n.toExponential(8).replace(/0+e/, "e").replace(/\.e/, "e");
  }
  return Number(n.toFixed(digits)).toString();
}

function csvEscape(value) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(headers, rows) {
  return `${headers.map(csvEscape).join(",")}\n${rows
    .map((row) => headers.map((h) => csvEscape(row[h])).join(","))
    .join("\n")}\n`;
}

function parseWsTable(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines[0].trim().split(/\s+/);
  return lines.slice(1).map((line) => {
    const vals = line.trim().split(/\s+/).map(Number);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = vals[i];
    });
    return row;
  });
}

function interpLog(rows, freq, key) {
  for (let i = 1; i < rows.length; i += 1) {
    const a = rows[i - 1];
    const b = rows[i];
    if (a.frequency <= freq && b.frequency >= freq) {
      const x1 = Math.log10(a.frequency);
      const x2 = Math.log10(b.frequency);
      const t = (Math.log10(freq) - x1) / (x2 - x1);
      return a[key] + (b[key] - a[key]) * t;
    }
  }
  return NaN;
}

function slopeDbDec(rows, f1, f2) {
  return (interpLog(rows, f2, "gain_db") - interpLog(rows, f1, "gain_db")) /
    (Math.log10(f2) - Math.log10(f1));
}

function findCutoff(rows, midDb, side) {
  const threshold = midDb - 3;
  const oneKIndex = rows.findIndex((r) => r.frequency >= 1000);
  if (side === "lower") {
    for (let i = oneKIndex; i > 0; i -= 1) {
      const hi = rows[i];
      const lo = rows[i - 1];
      if (hi.gain_db >= threshold && lo.gain_db <= threshold) {
        const x1 = Math.log10(lo.frequency);
        const x2 = Math.log10(hi.frequency);
        const t = (threshold - lo.gain_db) / (hi.gain_db - lo.gain_db);
        return 10 ** (x1 + (x2 - x1) * t);
      }
    }
  } else {
    for (let i = oneKIndex + 1; i < rows.length; i += 1) {
      const lo = rows[i - 1];
      const hi = rows[i];
      if (lo.gain_db >= threshold && hi.gain_db <= threshold) {
        const x1 = Math.log10(lo.frequency);
        const x2 = Math.log10(hi.frequency);
        const t = (threshold - lo.gain_db) / (hi.gain_db - lo.gain_db);
        return 10 ** (x1 + (x2 - x1) * t);
      }
    }
  }
  return NaN;
}

function extractLogNumber(log, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = log.match(new RegExp(`${escaped}\\s*=\\s*([-+0-9.eE]+)`));
  return match ? Number(match[1]) : NaN;
}

function logScanText(log) {
  const matches = log.match(/^.*(can't find|unknown|fatal|singular|error|failed).*$/gim);
  return matches ? matches.join(" | ") : "";
}

function ampCore(candidate) {
  return `CIN vin b1_base {CCPL}

RB1_TOP vdd b1_base 3.3Meg
RB1_BOT b1_base 0 1Meg
RC1 vdd b1_collector {RCVAL}
RE1 b1_emitter 0 {REVAL}
XQ1 b1_collector b1_base b1_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH1 b1_collector 0 {CH}

C12 b1_collector b2_base {CCPL}

RB2_TOP vdd b2_base 3.3Meg
RB2_BOT b2_base 0 1Meg
RC2 vdd b2_collector {RCVAL}
RE2 b2_emitter 0 {REVAL}
XQ2 b2_collector b2_base b2_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH2 b2_collector 0 {CH}

C23 b2_collector b3_base {CCPL}

RB3_TOP vdd b3_base 3.3Meg
RB3_BOT b3_base 0 1Meg
RC3 vdd b3_collector {RCVAL}
RE3 b3_emitter 0 {REVAL}
XQ3 b3_collector b3_base b3_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH3 b3_collector 0 {CH}

COUT b3_collector vout_drv {COUT}
ROUT_TOP vdd vout_drv {ROUT}
ROUT_BOT vout_drv 0 {ROUT}
RISO vout_drv vout_final ${candidate.riso}
CLOAD_10P vout_final 0 10p
`;
}

function baseNetlist(kind, candidate) {
  const version = stem(candidate);
  const source =
    kind === "tran"
      ? `VIN vin 0 SIN({VCM} {VIN_AMP} {FIN})`
      : `VIN vin 0 DC {VCM}${kind === "op" ? "" : " AC 1"}`;
  const params = kind === "tran"
    ? `.param VDD=5
.param VCM=2.5
.param VIN_AMP=1m
.param FIN=1k`
    : `.param VDD=5
.param VCM=2.5`;
  const analysis = {
    op: `op
print v(vdd)
print v(b1_base) v(b1_emitter) v(b1_collector)
print v(b2_base) v(b2_emitter) v(b2_collector)
print v(b3_base) v(b3_emitter) v(b3_collector) v(vout_drv) v(vout_final)
print v(b1_base)-v(b1_emitter) v(b1_collector)-v(b1_emitter)
print v(b2_base)-v(b2_emitter) v(b2_collector)-v(b2_emitter)
print v(b3_base)-v(b3_emitter) v(b3_collector)-v(b3_emitter)
print i(vdd)
write ${rawDir}/${version}_op.raw`,
    ac: `set wr_singlescale
set wr_vecnames
op
ac dec 80 1m 1Meg
let gain = v(vout_final)/v(vin)
let gain_vv = mag(gain)
let gain_db = db(gain)
let phase_deg = ph(gain)
meas ac midgain_vv find gain_vv at=1000
meas ac midgain_db find gain_db at=1000
meas ac phase_1k_deg find phase_deg at=1000
wrdata ${csvDir}/${version}_ac.csv gain_vv gain_db phase_deg
write ${rawDir}/${version}_ac.raw frequency v(vin) v(b3_collector) v(vout_drv) v(vout_final) gain gain_vv gain_db phase_deg`,
    tran: `set wr_singlescale
set wr_vecnames
op
tran 5u 100m 0 5u
meas tran out_max max v(vout_final) from=50m to=100m
meas tran out_min min v(vout_final) from=50m to=100m
meas tran vin_max max v(vin) from=50m to=100m
meas tran vin_min min v(vin) from=50m to=100m
wrdata ${csvDir}/${version}_tran.csv v(vin) v(b3_collector) v(vout_drv) v(vout_final) i(vdd)
write ${rawDir}/${version}_tran.raw`,
    noise: `set wr_singlescale
set wr_vecnames
op
noise v(vout_final) VIN dec 80 10 20k
setplot noise1
wrdata ${csvDir}/${version}_noise_10hz_20khz.csv onoise_spectrum inoise_spectrum
write ${rawDir}/${version}_noise_10hz_20khz.raw frequency onoise_spectrum inoise_spectrum
setplot noise2
print onoise_total inoise_total
wrdata ${csvDir}/${version}_noise_10hz_20khz_total.csv onoise_total inoise_total`,
  }[kind];

  return `* SKY130 BJT 3-stage high-frequency CH/RISO sweep ${kind}: CH=${candidate.ch}, RISO=${candidate.riso}
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"

.option savecurrents
.option ${kind === "noise" ? "sparse" : "klu"}
.option reltol=1e-4

${params}
.param CCPL=68n
.param CH=${candidate.ch}
.param RCVAL=120k
.param REVAL=18.5k
.param COUT=10n
.param ROUT=10Meg

VDD vdd 0 {VDD}
${source}

${ampCore(candidate)}

.control
set noaskquit
${analysis}
quit
.endc

.end
`;
}

function runNgspice(stemName) {
  return new Promise((resolve, reject) => {
    const run = spawn(ngspice, ["-b", "-o", `${logDir}/${stemName}.log`, `${netlistDir}/${stemName}.spice`], {
      cwd: root,
      stdio: "ignore",
    });
    run.on("error", reject);
    run.on("close", (code) => resolve(code ?? 1));
  });
}

async function runPool(items, limit, worker) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function writeCandidateNetlists(candidate, includeNoise = false) {
  const version = stem(candidate);
  for (const kind of includeNoise ? ["op", "ac", "tran", "noise"] : ["op", "ac", "tran"]) {
    await fs.writeFile(`${netlistDir}/${version}_${kind}.spice`, baseNetlist(kind, candidate));
  }
}

async function summarizeCandidate(candidate) {
  const version = stem(candidate);
  const acRows = parseWsTable(await fs.readFile(`${csvDir}/${version}_ac.csv`, "utf8"));
  const tranRows = parseWsTable(await fs.readFile(`${csvDir}/${version}_tran.csv`, "utf8"));
  const opLog = await fs.readFile(`${logDir}/${version}_op.log`, "utf8");
  const logs = await Promise.all(["op", "ac", "tran"].map((kind) => fs.readFile(`${logDir}/${version}_${kind}.log`, "utf8")));
  const scan = logs.map(logScanText).filter(Boolean).join(" | ");
  const midgainDb = interpLog(acRows, 1000, "gain_db");
  const lower = findCutoff(acRows, midgainDb, "lower");
  const upper = findCutoff(acRows, midgainDb, "upper");
  const passband = acRows.filter((r) => r.frequency >= 10 && r.frequency <= 20000).map((r) => r.gain_db);
  const settled = tranRows.filter((r) => r.time >= 0.05 && r.time <= 0.1);
  const outVals = settled.map((r) => r["v(vout_final)"]);
  const vinVals = settled.map((r) => r["v(vin)"]);
  const outMax = Math.max(...outVals);
  const outMin = Math.min(...outVals);
  const vinMax = Math.max(...vinVals);
  const vinMin = Math.min(...vinVals);
  const istatic = Math.abs(extractLogNumber(opLog, "i(vdd)"));
  const pdc = 5 * istatic;
  return {
    version: `hfiso_ch${candidate.chSuffix}_r${candidate.rSuffix}`,
    stem: version,
    candidate,
    changed_family: "high_cutoff_shape",
    changed_values: `CH1=CH2=CH3=${candidate.ch}; RISO=${candidate.riso} between vout_drv and vout_final; CLOAD_10P=10p at vout_final`,
    midgain_db: midgainDb,
    lower_cutoff_hz: lower,
    upper_cutoff_hz: upper,
    passband_ripple_db: Math.max(...passband) - Math.min(...passband),
    out_pp: outMax - outMin,
    output_center: (outMax + outMin) / 2,
    vin_pp: vinMax - vinMin,
    high_slope_10k_100k: slopeDbDec(acRows, 10000, 100000),
    high_slope_20k_200k: slopeDbDec(acRows, 20000, 200000),
    high_slope_100k_1meg: slopeDbDec(acRows, 100000, 1000000),
    low_slope_1_10: slopeDbDec(acRows, 1, 10),
    istatic_a: istatic,
    pdc_w: pdc,
    riso_pole_hz: 1 / (2 * Math.PI * candidate.risoNumeric * 10e-12),
    log_scan: scan,
    decision: "",
    notes: "",
  };
}

async function addNoiseTotals(row) {
  const log = await fs.readFile(`${logDir}/${row.stem}_noise.log`, "utf8");
  const scan = logScanText(log);
  row.onoise_total = extractLogNumber(log, "onoise_total");
  row.inoise_total = extractLogNumber(log, "inoise_total");
  row.log_scan = [row.log_scan, scan].filter(Boolean).join(" | ");
}

await fs.mkdir(csvDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(logDir, { recursive: true });
await fs.mkdir(tableDir, { recursive: true });

for (const candidate of candidates) {
  await writeCandidateNetlists(candidate);
}

const jobs = [];
for (const candidate of candidates) {
  const version = stem(candidate);
  for (const kind of ["op", "ac", "tran"]) jobs.push(`${version}_${kind}`);
}

await runPool(jobs, RUN_PARALLEL, async (jobStem) => {
  const code = await runNgspice(jobStem);
  if (code !== 0) throw new Error(`${jobStem} ngspice exit code ${code}`);
});

const rows = [];
for (const candidate of candidates) rows.push(await summarizeCandidate(candidate));

const validRows = rows.filter((row) =>
  !row.log_scan &&
  row.midgain_db >= 35 &&
  row.midgain_db <= 45 &&
  row.lower_cutoff_hz >= 8 &&
  row.lower_cutoff_hz <= 13 &&
  row.upper_cutoff_hz >= 20000 &&
  row.out_pp >= 0.1 &&
  row.out_pp <= 0.3 &&
  row.output_center > 2.45 &&
  row.output_center < 2.55 &&
  row.high_slope_100k_1meg <= -78
);

const selected = validRows
  .sort((a, b) => Math.abs(a.upper_cutoff_hz - 20000) - Math.abs(b.upper_cutoff_hz - 20000))[0] ?? null;

if (selected) {
  selected.decision = "accepted";
  selected.notes = "log scan pass; selected because reduced internal CH creates bandwidth headroom while RISO/CLOAD adds the strongest independent high-frequency pole that still keeps fH above 20 kHz";
  await writeCandidateNetlists(selected.candidate, true);
  const noiseCode = await runNgspice(`${selected.stem}_noise`);
  if (noiseCode !== 0) throw new Error(`${selected.stem}_noise ngspice exit code ${noiseCode}`);
  await addNoiseTotals(selected);
}

for (const row of rows) {
  if (row.decision) continue;
  if (row.log_scan) {
    row.decision = "rejected_transient";
    row.notes = `log scan failed: ${row.log_scan}`;
  } else if (row.upper_cutoff_hz < 20000) {
    row.decision = "rejected_gain";
    row.notes = "log scan pass; rejected because the CH/RISO pole combination moves the upper cutoff below the 20 kHz bandwidth target";
  } else if (row.high_slope_100k_1meg > -78) {
    row.decision = "rejected_gain";
    row.notes = "log scan pass; valid gain/bandwidth/transient behavior, but far high-frequency rolloff is still weaker than the 80 dB/dec hard-target proxy";
  } else {
    row.decision = "rejected_power";
    row.notes = "log scan pass; rejected in favor of a candidate with fH closer to 20 kHz";
  }
}

const baselineSummaryText = await fs.readFile(`${tableDir}/${baselineVersion}_summary.csv`, "utf8");
const baselineGainLine = baselineSummaryText.split(/\r?\n/).find((line) => line.startsWith("midgain_db,"));
const baselineGain = Number(baselineGainLine?.split(",")[1]);

const headers = [
  "version",
  "changed_family",
  "changed_values",
  "midgain_db",
  "lower_cutoff_hz",
  "upper_cutoff_hz",
  "passband_ripple_db",
  "out_pp",
  "output_center",
  "load_gain_delta_db",
  "istatic_a",
  "pdc_w",
  "estimated_area_note",
  "decision",
  "notes",
];

const tableRows = rows.map((row) => ({
  version: row.version,
  changed_family: row.changed_family,
  changed_values: row.changed_values,
  midgain_db: fmt(row.midgain_db, 6),
  lower_cutoff_hz: fmt(row.lower_cutoff_hz, 5),
  upper_cutoff_hz: fmt(row.upper_cutoff_hz, 5),
  passband_ripple_db: fmt(row.passband_ripple_db, 6),
  out_pp: fmt(row.out_pp, 6),
  output_center: fmt(row.output_center, 6),
  load_gain_delta_db: Number.isFinite(baselineGain) ? fmt(row.midgain_db - baselineGain, 6) : "not_rerun",
  istatic_a: fmt(row.istatic_a),
  pdc_w: fmt(row.pdc_w),
  estimated_area_note: `changes CH capacitors to ${row.candidate.ch}; adds one series output-isolation resistor RISO=${row.candidate.riso}; CLOAD_10P remains external and ppa_included=false`,
  decision: row.decision,
  notes: `${row.notes}; RISO/CLOAD pole=${fmt(row.riso_pole_hz, 2)} Hz; high slopes 10k-100k=${fmt(row.high_slope_10k_100k, 2)} dB/dec, 20k-200k=${fmt(row.high_slope_20k_200k, 2)} dB/dec, 100k-1Meg=${fmt(row.high_slope_100k_1meg, 2)} dB/dec${Number.isFinite(row.inoise_total) ? `; target-band noise inoise=${fmt(row.inoise_total)} Vrms` : ""}`,
}));

await fs.writeFile(`${tableDir}/bjt3_sweep_hfiso_ch_summary.csv`, toCsv(headers, tableRows));

const sweepPath = `${tableDir}/bjt3_sweep_summary.csv`;
const existing = await fs.readFile(sweepPath, "utf8");
await fs.writeFile(sweepPath, `${existing.trimEnd()}\n${tableRows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")).join("\n")}\n`);

if (selected) {
  await fs.writeFile(`${tableDir}/${selected.stem}_summary.csv`, toCsv(["metric", "value", "unit", "notes"], [
    { metric: "midgain_db", value: fmt(selected.midgain_db, 6), unit: "dB", notes: "Measured at 1 kHz" },
    { metric: "estimated_lower_cutoff_hz", value: fmt(selected.lower_cutoff_hz, 5), unit: "Hz", notes: "-3 dB crossing relative to 1 kHz midgain" },
    { metric: "estimated_upper_cutoff_hz", value: fmt(selected.upper_cutoff_hz, 5), unit: "Hz", notes: "-3 dB crossing relative to 1 kHz midgain" },
    { metric: "riso_cload_pole_hz", value: fmt(selected.riso_pole_hz, 2), unit: "Hz", notes: "1/(2*pi*RISO*10pF)" },
    { metric: "high_rolloff_10k_to_100k", value: fmt(selected.high_slope_10k_100k, 2), unit: "dB/dec", notes: "High-frequency slope check" },
    { metric: "high_rolloff_20k_to_200k", value: fmt(selected.high_slope_20k_200k, 2), unit: "dB/dec", notes: "High-frequency slope check" },
    { metric: "high_rolloff_100k_to_1meg", value: fmt(selected.high_slope_100k_1meg, 2), unit: "dB/dec", notes: "Far high-frequency slope check" },
    { metric: "out_pp", value: fmt(selected.out_pp, 6), unit: "V", notes: "Transient output peak-to-peak from 50 ms to 100 ms" },
    { metric: "output_center", value: fmt(selected.output_center, 6), unit: "V", notes: "Transient output common-mode estimate" },
    { metric: "istatic", value: fmt(selected.istatic_a), unit: "A", notes: "OP static supply current" },
    { metric: "pdc", value: fmt(selected.pdc_w), unit: "W", notes: "VDD times static current" },
    { metric: "inoise_total", value: fmt(selected.inoise_total), unit: "Vrms", notes: "Integrated input-referred noise from 10 Hz to 20 kHz" },
    { metric: "log_scan", value: selected.log_scan ? "fail" : "pass", unit: "", notes: selected.log_scan || "No forbidden log scan matches in OP/AC/tran/noise logs" },
    { metric: "decision", value: "accepted", unit: "", notes: "Accepted CH/RISO high-frequency shape candidate; Cycle G deliverables need refresh" },
  ]));
}

console.log(JSON.stringify({
  selected: selected?.version ?? null,
  rows: tableRows,
}, null, 2));
