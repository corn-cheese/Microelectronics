import fs from "node:fs/promises";
import zlib from "node:zlib";
import { promisify } from "node:util";

const deflate = promisify(zlib.deflate);
const root = "D:/Codex/Support";
const version = "bjt3_sweep_coutalign_c10n";
const tablesDir = `${root}/results/ngspice/tables`;
const csvDir = `${root}/results/ngspice/csv`;
const logDir = `${root}/results/ngspice/logs`;
const plotsDir = `${root}/results/ngspice/plots`;

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

function csvEscape(value) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(headers, rows) {
  return `${headers.map(csvEscape).join(",")}\n${rows
    .map((row) => headers.map((h) => csvEscape(row[h])).join(","))
    .join("\n")}\n`;
}

function fmt(n, digits = 12) {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if ((abs !== 0 && abs < 1e-3) || abs >= 1e6) {
    return n.toExponential(12).replace(/0+e/, "e").replace(/\.e/, "e");
  }
  return Number(n.toFixed(digits)).toString();
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

function extractLogNumber(log, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = log.match(new RegExp(`${escaped}\\s*=\\s*([-+0-9.eE]+)`));
  return match ? Number(match[1]) : NaN;
}

const acRows = parseWsTable(await fs.readFile(`${csvDir}/${version}_ac.csv`, "utf8"));
const tranRows = parseWsTable(await fs.readFile(`${csvDir}/${version}_tran.csv`, "utf8"));
const opLog = await fs.readFile(`${logDir}/${version}_op.log`, "utf8");

const midDb = interpLog(acRows, 1000, "gain_db");
const lower = findCutoff(acRows, midDb, "lower");
const upper = findCutoff(acRows, midDb, "upper");
const passband = acRows.filter((r) => r.frequency >= 10 && r.frequency <= 20000).map((r) => r.gain_db);
const passbandRipple = Math.max(...passband) - Math.min(...passband);
const targetRows = acRows
  .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
  .map((r) => ({ frequency_hz: r.frequency, ...targetGain(r.frequency) }));
const targetDbVals = targetRows.map((r) => r.db);
const acErr = acRows
  .filter((r) => r.frequency >= 1 && r.frequency <= 1e6)
  .map((r) => r.gain_db - targetGain(r.frequency).db);
const acNrmse = rmse(acErr) / (Math.max(...targetDbVals) - Math.min(...targetDbVals));
const settled = tranRows.filter((r) => r.time >= 0.05 && r.time <= 0.1);
const outVals = settled.map((r) => r["v(vout_final)"]);
const vinVals = settled.map((r) => r["v(vin)"]);
const outMax = Math.max(...outVals);
const outMin = Math.min(...outVals);
const vinMax = Math.max(...vinVals);
const vinMin = Math.min(...vinVals);
const outPp = outMax - outMin;
const outputCenter = (outMax + outMin) / 2;
const avgCurrent = settled.reduce((sum, r) => sum + -r["i(vdd)"], 0) / settled.length;
const targetTran = settled.map((r) => 2.5 - 100 * (r["v(vin)"] - 2.5));
const tranErr = settled.map((r, i) => r["v(vout_final)"] - targetTran[i]);
const tranNrmse = rmse(tranErr) / (Math.max(...targetTran) - Math.min(...targetTran));
const istatic = Math.abs(extractLogNumber(opLog, "i(vdd)"));
const pdc = 5 * istatic;
const pavg = 5 * avgCurrent;
const worstPower = Math.max(pdc, pavg);
const lowSlopeFar = slopeDbDec(acRows, 0.316227766, 3.16227766);
const lowSlopeNear = slopeDbDec(acRows, 1, 10);
const highSlope10k100k = slopeDbDec(acRows, 10000, 100000);
const highSlope20k200k = slopeDbDec(acRows, 20000, 200000);
const highSlope100k1m = slopeDbDec(acRows, 100000, 1000000);

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

const areaRows = [
  {
    component: "Q1-Q3",
    logical_role: "three common-emitter gain transistors",
    library_cell: "sky130_fd_pr_main / npn_05v5",
    value: "mult=1 each",
    geometry: "W1p00L1p00; count=3",
    area_formula: "1p * count",
    area_p: "3",
    ppa_included: "true",
    notes: "BJT assignment area rule",
  },
  {
    component: "RC1-RC3",
    logical_role: "collector load resistors",
    library_cell: resistorCell,
    value: "120000",
    geometry: `w=5.73um; l=${fmt(resLength(120000))}um; count=3`,
    area_formula: "((R-rcon)/rsheet) * w * count, with rcon=68.05 ohm and rsheet=56.46 ohm/um from PDK model",
    area_p: fmt(resArea(120000, 3)),
    ppa_included: "true",
    notes: "collector load area for accepted RC=120k",
  },
  {
    component: "RE1-RE3",
    logical_role: "emitter degeneration resistors",
    library_cell: resistorCell,
    value: "18500",
    geometry: `w=5.73um; l=${fmt(resLength(18500))}um; count=3`,
    area_formula: "((R-rcon)/rsheet) * w * count, with rcon=68.05 ohm and rsheet=56.46 ohm/um from PDK model",
    area_p: fmt(resArea(18500, 3)),
    ppa_included: "true",
    notes: "accepted RE=18.5k gain/headroom point",
  },
  {
    component: "RB1_TOP-RB3_TOP",
    logical_role: "base bias divider upper resistors",
    library_cell: resistorCell,
    value: "3300000",
    geometry: `w=5.73um; l=${fmt(resLength(3300000))}um; count=3`,
    area_formula: "((R-rcon)/rsheet) * w * count, with rcon=68.05 ohm and rsheet=56.46 ohm/um from PDK model",
    area_p: fmt(resArea(3300000, 3)),
    ppa_included: "true",
    notes: "high-value divider reduces interstage AC loading",
  },
  {
    component: "RB1_BOT-RB3_BOT",
    logical_role: "base bias divider lower resistors",
    library_cell: resistorCell,
    value: "1000000",
    geometry: `w=5.73um; l=${fmt(resLength(1000000))}um; count=3`,
    area_formula: "((R-rcon)/rsheet) * w * count, with rcon=68.05 ohm and rsheet=56.46 ohm/um from PDK model",
    area_p: fmt(resArea(1000000, 3)),
    ppa_included: "true",
    notes: "bias divider lower leg",
  },
  {
    component: "ROUT_TOP-ROUT_BOT",
    logical_role: "output rebias divider",
    library_cell: resistorCell,
    value: "10000000",
    geometry: `w=5.73um; l=${fmt(resLength(10000000))}um; count=2`,
    area_formula: "((R-rcon)/rsheet) * w * count, with rcon=68.05 ohm and rsheet=56.46 ohm/um from PDK model",
    area_p: fmt(resArea(10000000, 2)),
    ppa_included: "true",
    notes: "sets final output common-mode to 2.5 V",
  },
  {
    component: "CIN,C12,C23",
    logical_role: "input and interstage coupling capacitors",
    library_cell: capCell,
    value: "6.8E-08",
    geometry: `11.5um x 11.7um; mult=${fmt(capMult(68e-9))}; count=3`,
    area_formula: "11.5 * 11.7 * (C / 110.19fF) * count, using PDK model ctot_a",
    area_p: fmt(capArea(68e-9, 3)),
    ppa_included: "true",
    notes: "sets accepted 10 Hz-ish lower cutoff with the output pole",
  },
  {
    component: "COUT",
    logical_role: "output coupling capacitor before 2.5 V rebias",
    library_cell: capCell,
    value: "1E-08",
    geometry: `11.5um x 11.7um; mult=${fmt(capMult(10e-9))}; count=1`,
    area_formula: "11.5 * 11.7 * (C / 110.19fF) * count, using PDK model ctot_a",
    area_p: fmt(capArea(10e-9, 1)),
    ppa_included: "true",
    notes: "accepted COUT pole-alignment value; replaces earlier 68 nF output capacitor",
  },
  {
    component: "CH1-CH3",
    logical_role: "collector high-frequency pole capacitors",
    library_cell: capCell,
    value: "3E-11",
    geometry: `11.5um x 11.7um; mult=${fmt(capMult(30e-12))}; count=3`,
    area_formula: "11.5 * 11.7 * (C / 110.19fF) * count, using PDK model ctot_a",
    area_p: fmt(capArea(30e-12, 3)),
    ppa_included: "true",
    notes: "sets upper cutoff near target edge",
  },
  {
    component: "CLOAD_10P",
    logical_role: "specified external evaluation load",
    library_cell: capCell,
    value: "1E-11",
    geometry: `11.5um x 11.7um; mult=${fmt(capMult(10e-12))}; count=1`,
    area_formula: "11.5 * 11.7 * (C / 110.19fF) * count, using PDK model ctot_a",
    area_p: fmt(capArea(10e-12, 1)),
    ppa_included: "false",
    notes: "external project load, excluded from amplifier PPA",
  },
];

const areaTotal = areaRows
  .filter((row) => row.ppa_included === "true")
  .reduce((sum, row) => sum + Number(row.area_p), 0);

const deviceRows = [
  ["Q1-Q3", "three common-emitter gain transistors", "sky130_fd_pr_main / npn_05v5", "mult=1 each", "W1p00L1p00", "3", "NPN area rule: 1p per device"],
  ["RC1-RC3", "collector load resistors", resistorCell, "120k", "w=5.73um, length calculated from model", "3", "ideal R mapped to one equivalent high-poly resistor per stage"],
  ["RE1-RE3", "emitter degeneration resistors", resistorCell, "18.5k", "w=5.73um, length calculated from model", "3", "sets accepted gain/headroom point"],
  ["RB1_TOP-RB3_TOP", "base bias divider upper resistors", resistorCell, "3.3Meg", "w=5.73um, length calculated from model", "3", "high impedance divider reduces AC loading and bias current"],
  ["RB1_BOT-RB3_BOT", "base bias divider lower resistors", resistorCell, "1Meg", "w=5.73um, length calculated from model", "3", "keeps base divider ratio from verified candidate"],
  ["ROUT_TOP-ROUT_BOT", "output rebias divider", resistorCell, "10Meg", "w=5.73um, length calculated from model", "2", "rebiases final output to 2.5 V common-mode"],
  ["CIN,C12,C23", "input and interstage coupling capacitors", capCell, "68n", "11.5um x 11.7um, multiplier calculated from model ctot_a", "3", "accepted input/interstage lower-cutoff capacitor family"],
  ["COUT", "output coupling capacitor before rebias divider", capCell, "10n", "11.5um x 11.7um, multiplier calculated from model ctot_a", "1", "accepted output pole-alignment capacitor, reduced from previous 68n"],
  ["CH1-CH3", "collector high-frequency pole capacitors", capCell, "30p", "11.5um x 11.7um, multiplier calculated from model ctot_a", "3", "sets upper cutoff near 23.4 kHz"],
  ["CLOAD_10P", "specified external evaluation load", capCell, "10p", "11.5um x 11.7um, multiplier calculated from model ctot_a", "1", "project load condition, not counted as amplifier PPA area"],
].map(([component, logical_role, library_cell, value, geometry, count, notes]) => ({
  version,
  component,
  logical_role,
  library_cell,
  value,
  geometry,
  count,
  source_netlist: "netlists/bjt3_sweep_rebias_core.inc",
  ppa_included: component === "CLOAD_10P" ? "false" : "true",
  notes,
}));

await fs.mkdir(tablesDir, { recursive: true });
await fs.mkdir(plotsDir, { recursive: true });
await fs.writeFile(`${tablesDir}/device_list.csv`, toCsv(["version", "component", "logical_role", "library_cell", "value", "geometry", "count", "source_netlist", "ppa_included", "notes"], deviceRows));
await fs.writeFile(`${tablesDir}/area_calculation.csv`, toCsv(["component", "logical_role", "library_cell", "value", "geometry", "area_formula", "area_p", "ppa_included", "notes"], areaRows));
await fs.writeFile(`${tablesDir}/power_calculation.csv`, toCsv(["version", "vdd_v", "static_current_a", "pdc_w", "transient_avg_current_a", "pavg_w", "worst_power_w", "notes"], [{
  version,
  vdd_v: "5",
  static_current_a: fmt(istatic),
  pdc_w: fmt(pdc),
  transient_avg_current_a: fmt(avgCurrent),
  pavg_w: fmt(pavg),
  worst_power_w: fmt(worstPower),
  notes: "worst_power_w=max(pdc_w,pavg_w); transient average uses -i(vdd) from 50 ms to 100 ms after settling",
}]));
await fs.writeFile(`${tablesDir}/target_hs.csv`, toCsv(["frequency_hz", "target_gain_vv", "target_gain_db", "target_phase_deg", "weight"], targetRows.map((row) => ({
  frequency_hz: fmt(row.frequency_hz),
  target_gain_vv: fmt(row.vv),
  target_gain_db: fmt(row.db),
  target_phase_deg: fmt(row.phase),
  weight: "1",
}))));
await fs.writeFile(`${tablesDir}/performance_summary.csv`, toCsv(["version", "load_pf", "midband_gain_db", "lower_cutoff_hz", "upper_cutoff_hz", "low_rolloff_db_dec", "high_rolloff_db_dec", "passband_ripple_db", "ac_nrmse", "tran_nrmse", "power_w", "area_p", "decision", "notes"], [{
  version,
  load_pf: "10",
  midband_gain_db: fmt(midDb),
  lower_cutoff_hz: fmt(lower),
  upper_cutoff_hz: fmt(upper),
  low_rolloff_db_dec: fmt(lowSlopeNear),
  high_rolloff_db_dec: fmt(highSlope20k200k),
  passband_ripple_db: fmt(passbandRipple),
  ac_nrmse: fmt(acNrmse),
  tran_nrmse: fmt(tranNrmse),
  power_w: fmt(worstPower),
  area_p: fmt(areaTotal),
  decision: "accepted",
  notes: `Final COUT-aligned output-rebiased 3-stage BJT candidate; 10 pF loaded, no OPAMP fallback; AC nRMSE uses gain dB over 1 Hz to 1 MHz; transient nRMSE uses 2.5 V - 100*(vin-2.5) target from 50 ms to 100 ms; low slopes 0.316-3.162Hz=${fmt(lowSlopeFar, 2)} dB/dec and 1-10Hz=${fmt(lowSlopeNear, 2)} dB/dec; high slopes 10k-100k=${fmt(highSlope10k100k, 2)} dB/dec, 20k-200k=${fmt(highSlope20k200k, 2)} dB/dec, 100k-1Meg=${fmt(highSlope100k1m, 2)} dB/dec`,
}]));

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

await writePng(`${plotsDir}/${version}_ac.png`, 1000, 650, async ({ line, rect }) => {
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

await writePng(`${plotsDir}/${version}_tran.png`, 1000, 650, async ({ line, rect }) => {
  const x0 = 95;
  const y0 = 55;
  const x1 = 960;
  const y1 = 570;
  const x = (t) => x0 + (t - 0.05) / 0.05 * (x1 - x0);
  const y = (v) => y1 - (v - 2.37) / 0.26 * (y1 - y0);
  rect(x0, y0, x1 - x0, y1 - y0, 30, 41, 59);
  for (const t of [0.05, 0.06, 0.07, 0.08, 0.09, 0.1]) line(x(t), y0, x(t), y1, 226, 232, 240);
  for (const v of [2.4, 2.45, 2.5, 2.55, 2.6]) line(x0, y(v), x1, y(v), 226, 232, 240);
  for (let i = 1; i < settled.length; i += 1) {
    const a = settled[i - 1];
    const b = settled[i];
    line(x(a.time), y(a["v(vout_final)"]), x(b.time), y(b["v(vout_final)"]), 37, 99, 235, 2);
    line(x(a.time), y(2.5 - 100 * (a["v(vin)"] - 2.5)), x(b.time), y(2.5 - 100 * (b["v(vin)"] - 2.5)), 220, 38, 38, 2);
  }
});

console.log(JSON.stringify({
  version,
  midband_gain_db: midDb,
  lower_cutoff_hz: lower,
  upper_cutoff_hz: upper,
  out_pp: outPp,
  output_center: outputCenter,
  ac_nrmse: acNrmse,
  tran_nrmse: tranNrmse,
  worst_power_w: worstPower,
  area_p: areaTotal,
}, null, 2));
