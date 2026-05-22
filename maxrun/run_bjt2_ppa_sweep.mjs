import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { promisify } from "node:util";

const deflate = promisify(zlib.deflate);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..").replace(/\\/g, "/");
const ngspice = "C:/eda/ngspice/Spice64/bin/ngspice_con.exe";
const netlistDir = `${root}/netlists`;
const canonicalCsvDir = `${root}/results/ngspice/csv`;
const canonicalRawDir = `${root}/results/ngspice/raw`;
let csvDir = canonicalCsvDir;
let rawDir = canonicalRawDir;
let artifactDirNote = "";
const logDir = `${root}/results/ngspice/logs`;
const tableDir = `${root}/results/ngspice/tables`;
const canonicalPlotDir = `${root}/results/ngspice/plots`;
let plotDir = canonicalPlotDir;
const DEFAULT_PARALLEL = 4;
const RUN_PARALLEL = parseParallelArg(process.argv.slice(2));

const candidates = [
  {
    suffix: "rc120k_re10k_rb4p7m_c47n_cout10n_r10k_c150p_ft2m",
    rc: "120k",
    rcNumeric: 120e3,
    re: "10k",
    reNumeric: 10e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "47n",
    ccplNumeric: 47e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "18p",
    chNumeric: 18e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "150p",
    cbufNumeric: 150e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc120k_re8p2k_rb4p7m_c47n_cout10n_r10k_c150p_ft2m",
    rc: "120k",
    rcNumeric: 120e3,
    re: "8.2k",
    reNumeric: 8.2e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "47n",
    ccplNumeric: 47e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "18p",
    chNumeric: 18e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "150p",
    cbufNumeric: 150e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc120k_re5p6k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft2m",
    rc: "120k",
    rcNumeric: 120e3,
    re: "5.6k",
    reNumeric: 5.6e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "22p",
    chNumeric: 22e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc120k_re4p7k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft2m",
    rc: "120k",
    rcNumeric: 120e3,
    re: "4.7k",
    reNumeric: 4.7e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "30p",
    chNumeric: 30e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc120k_re3p9k_rb4p7m_c68n_cout10n_ch18p_r10k_c220p_ft250k",
    rc: "120k",
    rcNumeric: 120e3,
    re: "3.9k",
    reNumeric: 3.9e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "18p",
    chNumeric: 18e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "250k",
    opampFtNumeric: 250e3,
  },
  {
    suffix: "rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k",
    rc: "120k",
    rcNumeric: 120e3,
    re: "3.9k",
    reNumeric: 3.9e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "22p",
    chNumeric: 22e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "250k",
    opampFtNumeric: 250e3,
  },
  {
    suffix: "rc120k_re3p9k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft250k",
    rc: "120k",
    rcNumeric: 120e3,
    re: "3.9k",
    reNumeric: 3.9e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "30p",
    chNumeric: 30e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "250k",
    opampFtNumeric: 250e3,
  },
  {
    suffix: "rc100k_re3p9k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft2m",
    rc: "100k",
    rcNumeric: 100e3,
    re: "3.9k",
    reNumeric: 3.9e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "30p",
    chNumeric: 30e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc100k_re3p9k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft250k",
    rc: "100k",
    rcNumeric: 100e3,
    re: "3.9k",
    reNumeric: 3.9e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "30p",
    chNumeric: 30e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "250k",
    opampFtNumeric: 250e3,
  },
  {
    suffix: "rc100k_re3p3k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k",
    rc: "100k",
    rcNumeric: 100e3,
    re: "3.3k",
    reNumeric: 3.3e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "22p",
    chNumeric: 22e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "250k",
    opampFtNumeric: 250e3,
  },
  {
    suffix: "rc100k_re4p7k_rb4p7m_c68n_cout15n_ch30p_r10k_c330p_ft1p5m",
    rc: "100k",
    rcNumeric: 100e3,
    re: "4.7k",
    reNumeric: 4.7e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "15n",
    coutNumeric: 15e-9,
    ch: "30p",
    chNumeric: 30e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "330p",
    cbufNumeric: 330e-12,
    opampFt: "1.5Meg",
    opampFtNumeric: 1.5e6,
  },
  {
    suffix: "rc150k_re12k_rb6p8m_c33n_cout10n_r10k_c150p_ft2m",
    rc: "150k",
    rcNumeric: 150e3,
    re: "12k",
    reNumeric: 12e3,
    rbTop: "6.8Meg",
    rbTopNumeric: 6.8e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "33n",
    ccplNumeric: 33e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "15p",
    chNumeric: 15e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "150p",
    cbufNumeric: 150e-12,
    opampFt: "2Meg",
    opampFtNumeric: 2e6,
  },
  {
    suffix: "rc100k_re8p2k_rb4p7m_c68n_cout10n_r15k_c150p_ft1p5m",
    rc: "100k",
    rcNumeric: 100e3,
    re: "8.2k",
    reNumeric: 8.2e3,
    rbTop: "4.7Meg",
    rbTopNumeric: 4.7e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "68n",
    ccplNumeric: 68e-9,
    cout: "10n",
    coutNumeric: 10e-9,
    ch: "18p",
    chNumeric: 18e-12,
    rbuf: "15k",
    rbufNumeric: 15e3,
    cbuf: "150p",
    cbufNumeric: 150e-12,
    opampFt: "1.5Meg",
    opampFtNumeric: 1.5e6,
  },
  {
    suffix: "rc150k_re10k_rb6p8m_c47n_cout15n_r10k_c220p_ft1p5m",
    rc: "150k",
    rcNumeric: 150e3,
    re: "10k",
    reNumeric: 10e3,
    rbTop: "6.8Meg",
    rbTopNumeric: 6.8e6,
    rbBot: "1Meg",
    rbBotNumeric: 1e6,
    ccpl: "47n",
    ccplNumeric: 47e-9,
    cout: "15n",
    coutNumeric: 15e-9,
    ch: "12p",
    chNumeric: 12e-12,
    rbuf: "10k",
    rbufNumeric: 10e3,
    cbuf: "220p",
    cbufNumeric: 220e-12,
    opampFt: "1.5Meg",
    opampFtNumeric: 1.5e6,
  },
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

async function canCreateProbe(dir) {
  const probe = `${dir}/.codex_write_probe`;
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(probe, "probe\n");
    await fs.rm(probe, { force: true }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function selectWritableArtifactDir(canonicalDir, fallbackDir, label) {
  if (await canCreateProbe(canonicalDir)) return { dir: canonicalDir, note: "" };
  if (!(await canCreateProbe(fallbackDir))) {
    throw new Error(`Neither canonical nor fallback ${label} artifact directory is writable`);
  }
  return {
    dir: fallbackDir,
    note: `${label} canonical directory was not writable; used ${path.relative(root, fallbackDir).replace(/\\/g, "/")}`,
  };
}

function stem(candidate) {
  return `bjt2_sweep_ppa_${candidate.suffix}`;
}

function fmt(n, digits = 8) {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if ((abs !== 0 && abs < 1e-3) || abs >= 1e6) {
    return n.toExponential(digits).replace(/0+e/, "e").replace(/\.e/, "e");
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  if (!headers) return [];
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
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
  const matches = log.match(/^.*(can't find|unknown|fatal|singular|error|failed|permission denied).*$/gim);
  return matches ? matches.join(" | ") : "";
}

function targetGain(freq) {
  const gMid = 100;
  const fL = 10;
  const fH = 20000;
  const vv = gMid / Math.sqrt(1 + (fL / freq) ** 8) / Math.sqrt(1 + (freq / fH) ** 8);
  return {
    vv,
    db: 20 * Math.log10(vv),
    phase: 4 * Math.atan(fL / freq) * 180 / Math.PI - 4 * Math.atan(freq / fH) * 180 / Math.PI,
  };
}

function rmse(values) {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
}

function ampCore() {
  return `CIN vin b1_base {CCPL}

RB1_TOP vdd b1_base {RB_TOP}
RB1_BOT b1_base 0 {RB_BOT}
RC1 vdd b1_collector {RCVAL}
RE1 b1_emitter 0 {REVAL}
XQ1 b1_collector b1_base b1_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH1 b1_collector 0 {CH}

C12 b1_collector b2_base {CCPL}

RB2_TOP vdd b2_base {RB_TOP}
RB2_BOT b2_base 0 {RB_BOT}
RC2 vdd b2_collector {RCVAL}
RE2 b2_emitter 0 {REVAL}
XQ2 b2_collector b2_base b2_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH2 b2_collector 0 {CH}

COUT b2_collector vout_drv {COUT}
ROUT_TOP vdd vout_drv {ROUT}
ROUT_BOT vout_drv 0 {ROUT}
EBUF vop_ideal 0 vout_drv 0 1
ROPAMP vop_ideal vbuf {ROPAMP}
COPAMP vbuf 0 {COPAMP}
IOPAMP vdd 0 {IOPAMP}
RBUF1 vbuf vfilt1 {RBUF}
CBUF1 vfilt1 0 {CBUF}
RBUF2 vfilt1 vout_final {RBUF}
CBUF2 vout_final 0 {CBUF}
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
print v(b2_base) v(b2_emitter) v(b2_collector) v(vout_drv) v(vfilt1) v(vout_final)
print v(b1_base)-v(b1_emitter) v(b1_collector)-v(b1_emitter)
print v(b2_base)-v(b2_emitter) v(b2_collector)-v(b2_emitter)
print v(b1_collector)-v(b2_base)
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
write ${rawDir}/${version}_ac.raw frequency v(vin) v(b1_collector) v(b2_collector) v(vout_drv) v(vfilt1) v(vout_final) gain gain_vv gain_db phase_deg`,
    tran: `set wr_singlescale
set wr_vecnames
op
tran 5u 100m 0 5u
meas tran out_max max v(vout_final) from=50m to=100m
meas tran out_min min v(vout_final) from=50m to=100m
meas tran vin_max max v(vin) from=50m to=100m
meas tran vin_min min v(vin) from=50m to=100m
wrdata ${csvDir}/${version}_tran.csv v(vin) v(b1_collector) v(b2_collector) v(vout_drv) v(vfilt1) v(vout_final) i(vdd)
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

  return `* SKY130 BJT 2-stage PPA sweep ${kind}: CE1 -> CE2 -> output rebias -> ideal OPAMP follower -> two RC poles
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"

.option savecurrents
.option ${kind === "noise" ? "sparse" : "klu"}
.option reltol=1e-4

${params}
.param RB_TOP=${candidate.rbTop}
.param RB_BOT=${candidate.rbBot}
.param RCVAL=${candidate.rc}
.param REVAL=${candidate.re}
.param CCPL=${candidate.ccpl}
.param COUT=${candidate.cout}
.param CH=${candidate.ch}
.param ROUT=10Meg
.param RBUF=${candidate.rbuf}
.param CBUF=${candidate.cbuf}
.param OPAMP_FT=${candidate.opampFt}
.param IOPAMP={OPAMP_FT*7e-12}
.param pi=3.141592653589793
.param ROPAMP=1k
.param COPAMP={1/(2*pi*ROPAMP*OPAMP_FT)}

VDD vdd 0 {VDD}
${source}

${ampCore()}

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

const resistorCell = "sky130_fd_pr_main / res_high_po_5p73";
const capCell = "sky130_fd_pr_main / cap_vpp_11p5x11p7_m1m4_noshield";
const resWidth = 5.73;
const rcon = 68.05;
const rsheet = 56.46;
const capCellArea = 11.5 * 11.7;
const ctot = 110.19e-15;
const resLength = (r) => (r - rcon) / rsheet;
const resArea = (r, count) => resLength(r) * resWidth * count;
const capMult = (c) => c / ctot;
const capArea = (c, count) => capCellArea * capMult(c) * count;

function estimateArea(candidate) {
  return [
    2,
    resArea(candidate.rcNumeric, 2),
    resArea(candidate.reNumeric, 2),
    resArea(candidate.rbTopNumeric, 2),
    resArea(candidate.rbBotNumeric, 2),
    resArea(10e6, 2),
    capArea(candidate.ccplNumeric, 2),
    capArea(candidate.coutNumeric, 1),
    capArea(candidate.chNumeric, 2),
    1000,
    resArea(candidate.rbufNumeric, 2),
    capArea(candidate.cbufNumeric, 2),
  ].reduce((sum, value) => sum + value, 0);
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
  const avgCurrent = settled.reduce((sum, r) => sum + -r["i(vdd)"], 0) / settled.length;
  const istatic = Math.abs(extractLogNumber(opLog, "i(vdd)"));
  const pdc = 5 * istatic;
  const pavg = 5 * avgCurrent;
  const targetRows = acRows
    .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
    .map((r) => ({ frequency_hz: r.frequency, ...targetGain(r.frequency) }));
  const targetDbVals = targetRows.map((r) => r.db);
  const acErr = acRows
    .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
    .map((r) => r.gain_db - targetGain(r.frequency).db);
  const targetTran = settled.map((r) => 2.5 + 100 * (r["v(vin)"] - 2.5));
  const tranErr = settled.map((r, i) => r["v(vout_final)"] - targetTran[i]);
  const pole1 = 1 / (2 * Math.PI * candidate.rbufNumeric * candidate.cbufNumeric);
  const pole2 = 1 / (2 * Math.PI * candidate.rbufNumeric * (candidate.cbufNumeric + 10e-12));
  return {
    version: `ppa_${candidate.suffix}`,
    stem: version,
    candidate,
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
    pavg_w: pavg,
    worst_power_w: Math.max(pdc, pavg),
    estimated_area_p: estimateArea(candidate),
    ac_nrmse: rmse(acErr) / (Math.max(...targetDbVals) - Math.min(...targetDbVals)),
    tran_nrmse: rmse(tranErr) / (Math.max(...targetTran) - Math.min(...targetTran)),
    output_filter_pole1_hz: pole1,
    output_filter_pole2_hz: pole2,
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

function candidateScore(row) {
  const gainPenalty = Math.abs(row.midgain_db - 40) * 5;
  const lowerPenalty = Number.isFinite(row.lower_cutoff_hz) ? Math.abs(row.lower_cutoff_hz - 10) / 2 : 50;
  const upperPenalty = row.upper_cutoff_hz >= 20000 ? 0 : (20000 - row.upper_cutoff_hz) / 1000;
  const slopePenalty = row.high_slope_100k_1meg <= -80 ? 0 : row.high_slope_100k_1meg + 80;
  const centerPenalty = Math.abs(row.output_center - 2.5) * 20;
  const areaPenalty = row.estimated_area_p / 1e8;
  const powerPenalty = row.worst_power_w / 1e-4;
  return gainPenalty + lowerPenalty + upperPenalty + slopePenalty + centerPenalty + areaPenalty + powerPenalty;
}

function makeAreaRows(row) {
  const c = row.candidate;
  return [
    ["Q1-Q2", "two common-emitter gain transistors", "sky130_fd_pr_main / npn_05v5", "mult=1 each", "W1p00L1p00; count=2", "1p * count", 2, true, "BJT assignment area rule"],
    ["RC1-RC2", "collector load resistors", resistorCell, c.rcNumeric, `w=5.73um; l=${fmt(resLength(c.rcNumeric))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(c.rcNumeric, 2), true, "collector load area"],
    ["RE1-RE2", "emitter degeneration resistors", resistorCell, c.reNumeric, `w=5.73um; l=${fmt(resLength(c.reNumeric))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(c.reNumeric, 2), true, "gain/headroom setting"],
    ["RB1_TOP-RB2_TOP", "base bias divider upper resistors", resistorCell, c.rbTopNumeric, `w=5.73um; l=${fmt(resLength(c.rbTopNumeric))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(c.rbTopNumeric, 2), true, "high-value divider"],
    ["RB1_BOT-RB2_BOT", "base bias divider lower resistors", resistorCell, c.rbBotNumeric, `w=5.73um; l=${fmt(resLength(c.rbBotNumeric))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(c.rbBotNumeric, 2), true, "bias divider lower leg"],
    ["ROUT_TOP-ROUT_BOT", "output rebias divider", resistorCell, 10e6, `w=5.73um; l=${fmt(resLength(10e6))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(10e6, 2), true, "sets final output common-mode to 2.5 V"],
    ["CIN,C12", "input and interstage coupling capacitors", capCell, c.ccplNumeric, `11.5um x 11.7um; mult=${fmt(capMult(c.ccplNumeric))}; count=2`, "11.5 * 11.7 * (C / 110.19fF) * count", capArea(c.ccplNumeric, 2), true, "2BJT removes one large 3BJT interstage coupling capacitor"],
    ["COUT", "output coupling capacitor before rebias divider", capCell, c.coutNumeric, `11.5um x 11.7um; mult=${fmt(capMult(c.coutNumeric))}; count=1`, "11.5 * 11.7 * (C / 110.19fF) * count", capArea(c.coutNumeric, 1), true, "output rebias coupling capacitor"],
    ["CH1-CH2", "collector high-frequency pole capacitors", capCell, c.chNumeric, `11.5um x 11.7um; mult=${fmt(capMult(c.chNumeric))}; count=2`, "11.5 * 11.7 * (C / 110.19fF) * count", capArea(c.chNumeric, 2), true, "collector pole tuning"],
    ["EBUF/IOPAMP", "ideal ahdLib-equivalent output load buffer", "ahdLib / opamp", `OPAMP_FT=${c.opampFt}`, "area=1000p by assignment rule", "1000p * count", 1000, true, "load isolation and filter driver only"],
    ["RBUF1-RBUF2", "post-buffer two-pole output filter resistors", resistorCell, c.rbufNumeric, `w=5.73um; l=${fmt(resLength(c.rbufNumeric))}um; count=2`, "((R-rcon)/rsheet) * w * count", resArea(c.rbufNumeric, 2), true, "explicit high-frequency output filter"],
    ["CBUF1-CBUF2", "post-buffer two-pole output filter capacitors", capCell, c.cbufNumeric, `11.5um x 11.7um; mult=${fmt(capMult(c.cbufNumeric))}; count=2`, "11.5 * 11.7 * (C / 110.19fF) * count", capArea(c.cbufNumeric, 2), true, "explicit high-frequency output filter"],
    ["CLOAD_10P", "specified external evaluation load", capCell, 10e-12, `11.5um x 11.7um; mult=${fmt(capMult(10e-12))}; count=1`, "11.5 * 11.7 * (C / 110.19fF) * count", capArea(10e-12, 1), false, "external project load, excluded from amplifier PPA"],
  ].map(([component, logical_role, library_cell, value, geometry, area_formula, area_p, ppa_included, notes]) => ({
    component,
    logical_role,
    library_cell,
    value: fmt(Number(value)),
    geometry,
    area_formula,
    area_p: fmt(Number(area_p)),
    ppa_included: ppa_included ? "true" : "false",
    notes,
  }));
}

async function writeDeliverables(rows, selected) {
  const sweepHeaders = [
    "version",
    "stem",
    "rc_ohm",
    "re_ohm",
    "rb_top_ohm",
    "rb_bot_ohm",
    "ccpl_f",
    "cout_f",
    "ch_f",
    "rbuf_ohm",
    "cbuf_f",
    "opamp_ft_hz",
    "midgain_db",
    "lower_cutoff_hz",
    "upper_cutoff_hz",
    "passband_ripple_db",
    "high_slope_100k_1meg_db_dec",
    "out_pp",
    "output_center",
    "ac_nrmse",
    "tran_nrmse",
    "worst_power_w",
    "estimated_area_p",
    "decision",
    "notes",
    "log_scan",
  ];
  await fs.writeFile(`${tableDir}/bjt2_ppa_sweep_summary.csv`, toCsv(sweepHeaders, rows.map((row) => ({
    version: row.version,
    stem: row.stem,
    rc_ohm: fmt(row.candidate.rcNumeric),
    re_ohm: fmt(row.candidate.reNumeric),
    rb_top_ohm: fmt(row.candidate.rbTopNumeric),
    rb_bot_ohm: fmt(row.candidate.rbBotNumeric),
    ccpl_f: fmt(row.candidate.ccplNumeric),
    cout_f: fmt(row.candidate.coutNumeric),
    ch_f: fmt(row.candidate.chNumeric),
    rbuf_ohm: fmt(row.candidate.rbufNumeric),
    cbuf_f: fmt(row.candidate.cbufNumeric),
    opamp_ft_hz: fmt(row.candidate.opampFtNumeric),
    midgain_db: fmt(row.midgain_db, 6),
    lower_cutoff_hz: fmt(row.lower_cutoff_hz, 5),
    upper_cutoff_hz: fmt(row.upper_cutoff_hz, 5),
    passband_ripple_db: fmt(row.passband_ripple_db, 6),
    high_slope_100k_1meg_db_dec: fmt(row.high_slope_100k_1meg, 4),
    out_pp: fmt(row.out_pp, 6),
    output_center: fmt(row.output_center, 6),
    ac_nrmse: fmt(row.ac_nrmse, 12),
    tran_nrmse: fmt(row.tran_nrmse, 12),
    worst_power_w: fmt(row.worst_power_w, 12),
    estimated_area_p: fmt(row.estimated_area_p, 6),
    decision: row.decision,
    notes: row.notes,
    log_scan: row.log_scan,
  }))));

  await fs.writeFile(`${tableDir}/${selected.stem}_summary.csv`, toCsv(["metric", "value", "unit", "notes"], [
    { metric: "midgain_db", value: fmt(selected.midgain_db, 6), unit: "dB", notes: "Measured at 1 kHz" },
    { metric: "estimated_lower_cutoff_hz", value: fmt(selected.lower_cutoff_hz, 5), unit: "Hz", notes: "-3 dB crossing relative to 1 kHz midgain" },
    { metric: "estimated_upper_cutoff_hz", value: fmt(selected.upper_cutoff_hz, 5), unit: "Hz", notes: "-3 dB crossing relative to 1 kHz midgain" },
    { metric: "high_rolloff_100k_to_1meg", value: fmt(selected.high_slope_100k_1meg, 2), unit: "dB/dec", notes: "Far high-frequency slope check" },
    { metric: "out_pp", value: fmt(selected.out_pp, 6), unit: "V", notes: "Transient output peak-to-peak from 50 ms to 100 ms" },
    { metric: "output_center", value: fmt(selected.output_center, 6), unit: "V", notes: "Transient output common-mode estimate" },
    { metric: "worst_power_w", value: fmt(selected.worst_power_w, 12), unit: "W", notes: "max(OP static power, settled transient average power)" },
    { metric: "estimated_area_p", value: fmt(selected.estimated_area_p, 6), unit: "p", notes: "Same PPA area model as 3BJT final comparison" },
    { metric: "ac_nrmse", value: fmt(selected.ac_nrmse, 12), unit: "", notes: "Gain dB normalized RMSE from 1 Hz to 1 MHz versus target H(s)" },
    { metric: "tran_nrmse", value: fmt(selected.tran_nrmse, 12), unit: "", notes: "Settled transient normalized RMSE versus non-inverting 100 V/V target" },
    { metric: "inoise_total", value: fmt(selected.inoise_total), unit: "Vrms", notes: "Integrated input-referred noise from 10 Hz to 20 kHz when noise run completed" },
    { metric: "log_scan", value: selected.log_scan ? "fail" : "pass", unit: "", notes: selected.log_scan || "No forbidden log scan matches in OP/AC/tran/noise logs" },
    { metric: "decision", value: selected.decision, unit: "", notes: selected.notes },
  ]));

  const areaRows = makeAreaRows(selected);
  await fs.writeFile(`${tableDir}/bjt2_area_calculation.csv`, toCsv(["component", "logical_role", "library_cell", "value", "geometry", "area_formula", "area_p", "ppa_included", "notes"], areaRows));
  await fs.writeFile(`${tableDir}/bjt2_device_list.csv`, toCsv(["version", "component", "logical_role", "library_cell", "value", "geometry", "count", "source_netlist", "ppa_included", "notes"], areaRows.map((row) => ({
    version: selected.stem,
    component: row.component,
    logical_role: row.logical_role,
    library_cell: row.library_cell,
    value: row.value,
    geometry: row.geometry,
    count: row.component.includes("Q1-Q2") || row.component.includes("RC1-RC2") || row.component.includes("RE1-RE2") || row.component.includes("RB") || row.component.includes("CH1-CH2") || row.component.includes("RBUF") || row.component.includes("CBUF") || row.component.includes("CIN,C12") ? "2" : "1",
    source_netlist: `netlists/${selected.stem}_ac.spice`,
    ppa_included: row.ppa_included,
    notes: row.notes,
  }))));
  await fs.writeFile(`${tableDir}/bjt2_power_calculation.csv`, toCsv(["version", "vdd_v", "static_current_a", "pdc_w", "transient_avg_power_w", "worst_power_w", "notes"], [{
    version: selected.stem,
    vdd_v: "5",
    static_current_a: fmt(selected.istatic_a),
    pdc_w: fmt(selected.pdc_w),
    transient_avg_power_w: fmt(selected.pavg_w),
    worst_power_w: fmt(selected.worst_power_w),
    notes: "worst_power_w=max(pdc_w,pavg_w); transient average uses -i(vdd) from 50 ms to 100 ms after settling",
  }]));

  const acRows = parseWsTable(await fs.readFile(`${csvDir}/${selected.stem}_ac.csv`, "utf8"));
  const targetRows = acRows
    .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
    .map((r) => ({ frequency_hz: r.frequency, ...targetGain(r.frequency) }));
  await fs.writeFile(`${tableDir}/bjt2_target_hs.csv`, toCsv(["frequency_hz", "target_gain_vv", "target_gain_db", "target_phase_deg", "weight"], targetRows.map((row) => ({
    frequency_hz: fmt(row.frequency_hz),
    target_gain_vv: fmt(row.vv),
    target_gain_db: fmt(row.db),
    target_phase_deg: fmt(row.phase),
    weight: "1",
  }))));
  await fs.writeFile(`${tableDir}/bjt2_performance_summary.csv`, toCsv(["version", "load_pf", "midband_gain_db", "lower_cutoff_hz", "upper_cutoff_hz", "low_rolloff_db_dec", "high_rolloff_100k_1meg_db_dec", "passband_ripple_db", "ac_nrmse", "tran_nrmse", "power_w", "area_p", "decision", "notes"], [{
    version: selected.stem,
    load_pf: "10",
    midband_gain_db: fmt(selected.midgain_db, 8),
    lower_cutoff_hz: fmt(selected.lower_cutoff_hz, 8),
    upper_cutoff_hz: fmt(selected.upper_cutoff_hz, 8),
    low_rolloff_db_dec: fmt(selected.low_slope_1_10, 4),
    high_rolloff_100k_1meg_db_dec: fmt(selected.high_slope_100k_1meg, 4),
    passband_ripple_db: fmt(selected.passband_ripple_db, 8),
    ac_nrmse: fmt(selected.ac_nrmse, 12),
    tran_nrmse: fmt(selected.tran_nrmse, 12),
    power_w: fmt(selected.worst_power_w, 12),
    area_p: fmt(selected.estimated_area_p, 6),
    decision: selected.decision,
    notes: `${selected.notes}; output filter poles=${fmt(selected.output_filter_pole1_hz, 2)} Hz and ${fmt(selected.output_filter_pole2_hz, 2)} Hz`,
  }]));

  const bjt3Rows = await fs.readFile(`${tableDir}/bjt3_final_candidate_comparison.csv`, "utf8")
    .then(parseCsv)
    .catch(() => []);
  const comparisonHeaders = [
    "version",
    "role",
    "midband_gain_db",
    "lower_cutoff_hz",
    "upper_cutoff_hz",
    "high_rolloff_100k_1meg_db_dec",
    "ac_nrmse",
    "tran_nrmse",
    "power_w",
    "area_p",
    "power_delta_vs_bjt3_fallback_w",
    "area_delta_vs_bjt3_fallback_p",
    "decision_note",
  ];
  const fallback = bjt3Rows.find((row) => row.version === "bjt3_sweep_hfbuf_r10k_c150p") ?? {};
  const fallbackPower = Number(fallback.power_w);
  const fallbackArea = Number(fallback.area_p);
  await fs.writeFile(`${tableDir}/bjt2_vs_bjt3_comparison.csv`, toCsv(comparisonHeaders, [
    ...bjt3Rows.map((row) => ({
      version: row.version,
      role: row.role,
      midband_gain_db: row.midband_gain_db,
      lower_cutoff_hz: row.lower_cutoff_hz,
      upper_cutoff_hz: row.upper_cutoff_hz,
      high_rolloff_100k_1meg_db_dec: row.high_rolloff_100k_1meg_db_dec,
      ac_nrmse: row.ac_nrmse,
      tran_nrmse: row.tran_nrmse,
      power_w: row.power_w,
      area_p: row.area_p,
      power_delta_vs_bjt3_fallback_w: Number.isFinite(fallbackPower) ? fmt(Number(row.power_w) - fallbackPower, 12) : "",
      area_delta_vs_bjt3_fallback_p: Number.isFinite(fallbackArea) ? fmt(Number(row.area_p) - fallbackArea, 6) : "",
      decision_note: row.decision_note,
    })),
    {
      version: selected.stem,
      role: "two_stage_ppa_candidate",
      midband_gain_db: fmt(selected.midgain_db, 8),
      lower_cutoff_hz: fmt(selected.lower_cutoff_hz, 8),
      upper_cutoff_hz: fmt(selected.upper_cutoff_hz, 8),
      high_rolloff_100k_1meg_db_dec: fmt(selected.high_slope_100k_1meg, 4),
      ac_nrmse: fmt(selected.ac_nrmse, 12),
      tran_nrmse: fmt(selected.tran_nrmse, 12),
      power_w: fmt(selected.worst_power_w, 12),
      area_p: fmt(selected.estimated_area_p, 6),
      power_delta_vs_bjt3_fallback_w: Number.isFinite(fallbackPower) ? fmt(selected.worst_power_w - fallbackPower, 12) : "",
      area_delta_vs_bjt3_fallback_p: Number.isFinite(fallbackArea) ? fmt(selected.estimated_area_p - fallbackArea, 6) : "",
      decision_note: selected.notes,
    },
  ]));
}

const crcTable = (() => {
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, crc]);
}

async function writePng(file, width, height, drawFn) {
  const pix = Buffer.alloc(width * height * 3, 255);
  const set = (x, y, r, g, b) => {
    const xx = Math.round(x);
    const yy = Math.round(y);
    if (xx < 0 || xx >= width || yy < 0 || yy >= height) return;
    const i = (yy * width + xx) * 3;
    pix[i] = r;
    pix[i + 1] = g;
    pix[i + 2] = b;
  };
  const line = (x0, y0, x1, y1, r, g, b, stroke = 1) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i += 1) {
      const x = x0 + (x1 - x0) * i / steps;
      const y = y0 + (y1 - y0) * i / steps;
      for (let dx = -Math.floor(stroke / 2); dx <= Math.floor(stroke / 2); dx += 1) {
        for (let dy = -Math.floor(stroke / 2); dy <= Math.floor(stroke / 2); dy += 1) set(x + dx, y + dy, r, g, b);
      }
    }
  };
  const rect = (x, y, w, h, r, g, b) => {
    line(x, y, x + w, y, r, g, b);
    line(x + w, y, x + w, y + h, r, g, b);
    line(x + w, y + h, x, y + h, r, g, b);
    line(x, y + h, x, y, r, g, b);
  };
  await drawFn({ line, rect });
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    pix.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", await deflate(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  await fs.writeFile(file, png);
}

async function writePlots(selected) {
  const acRows = parseWsTable(await fs.readFile(`${csvDir}/${selected.stem}_ac.csv`, "utf8"));
  const tranRows = parseWsTable(await fs.readFile(`${csvDir}/${selected.stem}_tran.csv`, "utf8"));
  const targetRows = acRows
    .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
    .map((r) => ({ frequency_hz: r.frequency, ...targetGain(r.frequency) }));
  const settled = tranRows.filter((r) => r.time >= 0.05 && r.time <= 0.1);

  await writePng(`${plotDir}/${selected.stem}_ac.png`, 1000, 650, async ({ line, rect }) => {
    const x0 = 95;
    const y0 = 55;
    const x1 = 960;
    const y1 = 570;
    const x = (f) => x0 + Math.log10(f) / 6 * (x1 - x0);
    const y = (db) => y1 - (db + 100) / 145 * (y1 - y0);
    rect(x0, y0, x1 - x0, y1 - y0, 30, 41, 59);
    for (const f of [1, 10, 100, 1000, 10000, 100000, 1000000]) line(x(f), y0, x(f), y1, 226, 232, 240);
    for (let db = -90; db <= 40; db += 10) line(x0, y(db), x1, y(db), 226, 232, 240);
    const actual = acRows.filter((r) => r.frequency >= 1 && r.frequency <= 1e6);
    for (let i = 1; i < actual.length; i += 1) line(x(actual[i - 1].frequency), y(actual[i - 1].gain_db), x(actual[i].frequency), y(actual[i].gain_db), 37, 99, 235, 2);
    for (let i = 1; i < targetRows.length; i += 1) line(x(targetRows[i - 1].frequency_hz), y(targetRows[i - 1].db), x(targetRows[i].frequency_hz), y(targetRows[i].db), 220, 38, 38, 2);
  });

  await writePng(`${plotDir}/${selected.stem}_tran.png`, 1000, 650, async ({ line, rect }) => {
    const x0 = 95;
    const y0 = 55;
    const x1 = 960;
    const y1 = 570;
    const values = settled.flatMap((r) => [r["v(vout_final)"], 2.5 + 100 * (r["v(vin)"] - 2.5)]);
    const minV = Math.min(...values) - 0.03;
    const maxV = Math.max(...values) + 0.03;
    const x = (t) => x0 + (t - 0.05) / 0.05 * (x1 - x0);
    const y = (v) => y1 - (v - minV) / (maxV - minV) * (y1 - y0);
    rect(x0, y0, x1 - x0, y1 - y0, 30, 41, 59);
    for (const t of [0.05, 0.06, 0.07, 0.08, 0.09, 0.1]) line(x(t), y0, x(t), y1, 226, 232, 240);
    for (let i = 1; i < settled.length; i += 1) {
      const a = settled[i - 1];
      const b = settled[i];
      line(x(a.time), y(a["v(vout_final)"]), x(b.time), y(b["v(vout_final)"]), 37, 99, 235, 2);
      line(x(a.time), y(2.5 + 100 * (a["v(vin)"] - 2.5)), x(b.time), y(2.5 + 100 * (b["v(vin)"] - 2.5)), 220, 38, 38, 2);
    }
  });
}

function isPlotWritePermissionError(error) {
  if (!error || !["EPERM", "EACCES"].includes(error.code)) return false;
  const failedPath = error.path ? path.resolve(error.path).replace(/\\/g, "/") : "";
  return failedPath.startsWith(plotDir);
}

async function writePlotsBestEffort(selected) {
  try {
    await writePlots(selected);
    return "";
  } catch (error) {
    if (!isPlotWritePermissionError(error)) throw error;
    return `plot write skipped: ${error.code} ${error.path}`;
  }
}

const csvSelection = await selectWritableArtifactDir(canonicalCsvDir, `${root}/results/ngspice/csv_tmp`, "csv");
const rawSelection = await selectWritableArtifactDir(canonicalRawDir, `${root}/results/ngspice/raw_tmp`, "raw");
const plotSelection = await selectWritableArtifactDir(canonicalPlotDir, `${root}/results/ngspice/plots_tmp`, "plot");
csvDir = csvSelection.dir;
rawDir = rawSelection.dir;
plotDir = plotSelection.dir;
artifactDirNote = [csvSelection.note, rawSelection.note, plotSelection.note].filter(Boolean).join("; ");

await fs.mkdir(csvDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(logDir, { recursive: true });
await fs.mkdir(tableDir, { recursive: true });
await fs.mkdir(plotDir, { recursive: true });

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
  row.high_slope_100k_1meg <= -80
);

const selected = (validRows.length ? validRows : rows)
  .sort((a, b) => candidateScore(a) - candidateScore(b))[0];

if (!selected) throw new Error("No bjt2 candidates were summarized");

if (validRows.includes(selected)) {
  selected.decision = "accepted";
  selected.notes = "2BJT candidate meets the initial gain, bandwidth, output common-mode, transient swing, and far high-frequency rolloff gates";
} else {
  selected.decision = "best_effort";
  selected.notes = "No 2BJT candidate met every initial gate; selected the lowest penalty row for the next maxrun tuning pass";
}
if (artifactDirNote) selected.notes = `${selected.notes}; ${artifactDirNote}`;

await writeCandidateNetlists(selected.candidate, true);
const noiseCode = await runNgspice(`${selected.stem}_noise`);
if (noiseCode !== 0) throw new Error(`${selected.stem}_noise ngspice exit code ${noiseCode}`);
await addNoiseTotals(selected);

for (const row of rows) {
  if (row.decision) continue;
  if (row.log_scan) {
    row.decision = "rejected_log";
    row.notes = `log scan failed: ${row.log_scan}`;
  } else if (row.upper_cutoff_hz < 20000) {
    row.decision = "rejected_bandwidth";
    row.notes = "upper cutoff is below the 20 kHz target";
  } else if (row.high_slope_100k_1meg > -80) {
    row.decision = "rejected_rolloff";
    row.notes = "far high-frequency rolloff is weaker than the 80 dB/dec proxy";
  } else if (row.midgain_db < 35 || row.midgain_db > 45) {
    row.decision = "rejected_gain";
    row.notes = "midband gain is outside the first-pass 35 dB to 45 dB sweep gate";
  } else {
    row.decision = "rejected_score";
    row.notes = "valid but lower ranked than the selected row by gain/cutoff/slope/area/power score";
  }
}

await writeDeliverables(rows, selected);
const plotWarning = await writePlotsBestEffort(selected);
if (plotWarning) console.warn(plotWarning);

console.log(JSON.stringify({
  selected: selected.stem,
  decision: selected.decision,
  midgain_db: selected.midgain_db,
  lower_cutoff_hz: selected.lower_cutoff_hz,
  upper_cutoff_hz: selected.upper_cutoff_hz,
  high_slope_100k_1meg: selected.high_slope_100k_1meg,
  worst_power_w: selected.worst_power_w,
  estimated_area_p: selected.estimated_area_p,
  artifact_dir_note: artifactDirNote,
  plot_warning: plotWarning,
}, null, 2));
