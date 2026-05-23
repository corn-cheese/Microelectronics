# Codex Max Run Workflow: 2BJT Autotopo LF-Pressure Pass

This is the active source prompt for one maxrun-style pass in this worktree.
Run it through `maxrun/run_workflow_maxrun.ps1`; do not manually switch back to
the older base `workflow.md` PPA sweep.

Active branch:

```text
codex/2stage-bjt-autotopo-ppa
```

## Current Task

Execute the already-configured autotopo runner exactly once for:

```text
run_id: run_009
family: low_frequency_rolloff_pressure
purpose: add stronger score pressure toward low-frequency rolloff while keeping total relaxed PPA competitive
```

The runner should already contain:

```text
LF_SLOPE_PRESSURE_TARGET = 60
CIN  = 33n, 47n, 56n, 68n
C12  = 33n, 47n, 56n, 68n
COUT = 4.7n, 6.8n, 10n
CH   = 27p, 28p
RBUF = 11k
RC=125k, RE=4.05k, RB_TOP=4.7Meg, RB_BOT=1Meg, CBUF=180p, OPAMP_FT=175k
```

Do not invent another family before running this one. Only edit the runner if
the structure test proves the current run_009 configuration is missing or
invalid.

## Read First

```powershell
Get-Content -Raw -Encoding UTF8 .\change.md
Get-Content -Raw -Encoding UTF8 .\nextgoal.md
Get-Content -Raw -Encoding UTF8 .\2stage-bjt.md
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_autotopo_run_index.csv
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_autotopo_vs_baselines.csv
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_ppa_sweep_summary.csv
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt3_final_candidate_comparison.csv
```

## Baselines

Always compare against:

```text
accepted 2BJT:
bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k

current autotopo best before this run:
read the lowest-score row from results/ngspice/tables/bjt2_autotopo_run_index.csv

3BJT performance fallback:
bjt3_sweep_hfbuf_r10k_c150p
```

As of the current handoff, the best prior autotopo candidate is expected to be
run_008:

```text
bjt2_autotopo_ceopr_rc125k_re4p05k_rb4p7m_c68n_cout10n_ch27p_r11k_c180p_ft175k
score 3.83078704
```

Verify this from the CSV instead of assuming it.

## Required Commands

Run the structure check:

```powershell
node .\maxrun\test_bjt2_runner_structure.mjs
```

Run the LF-pressure autotopo sweep:

```powershell
node .\maxrun\run_bjt2_autotopo_ppa_sweep.mjs --parallel 4
```

If the machine is resource constrained, rerun with lower concurrency:

```powershell
node .\maxrun\run_bjt2_autotopo_ppa_sweep.mjs --parallel 2
```

Scan logs:

```powershell
Select-String .\results\ngspice\logs\bjt2_autotopo*.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

Inspect the updated ranking:

```powershell
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_autotopo_run_index.csv
Import-Csv .\results\ngspice\tables\bjt2_autotopo_ppa_sweep_summary.csv |
  Sort-Object {[double]$_.score} |
  Select-Object -First 10 run_id,family,version,score,decision,low_slope_1hz_10hz_db_dec,gain_at_10hz_relative_to_midband_db,ac_nrmse,tran_nrmse,worst_power_w,estimated_area_p
```

## Decision Logic

Promote run_009 only if it beats the current prior-best score and passes the
relaxed gates.

Keep searching if it improves LF slope meaningfully but loses total relaxed
PPA score.

Abandon the family if stronger LF rolloff collapses bandwidth, transient
behavior, output common-mode, or PPA.

Treat LF improvement as meaningful if at least one is true:

```text
low_slope_1hz_10hz_db_dec improves by >= 10 dB/dec versus run_008
10 Hz relative gain moves closer to the desired -3 dB shape
AC nRMSE improves without transient nRMSE or area/power damage
```

Do not promote a candidate just because LF slope improves. The goal is total
PPA, not a single metric.

## Required Outputs

The workflow pass must leave these files current:

```text
results/ngspice/tables/bjt2_autotopo_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_autotopo_vs_baselines.csv
results/ngspice/tables/bjt2_autotopo_run_index.csv
change.md
```

Append a concise run_009 entry to `change.md`:

```markdown
## 2026-05-23 - 2BJT autotopo relaxed PPA run 9

- Hypothesis: <LF-pressure hypothesis>
- Change: <runner family and score pressure>
- Candidates: <count and grid>
- Best: <version, score, LF slope, 10 Hz relative gain, AC/tran nRMSE, power, area>
- Compared against:
  - accepted 2BJT: <important deltas>
  - prior autotopo best: <important deltas>
  - 3BJT fallback: <important deltas>
- Decision: <promote / keep searching / abandon family>
- Next: <stop/promote prior best or next focused passive family>
```

Keep `change.md` short. Do not paste large tables; use the CSVs as run memory.

## Final Check

Before final response, run:

```powershell
git status --short
```

Report whether run_009 improved total relaxed PPA, only LF shape, or neither.
