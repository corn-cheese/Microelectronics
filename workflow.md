# Codex Max Run Master Workflow: 2-Stage BJT PPA Experiment

This workflow is the source prompt for repeated maxrun-style Codex runs in
this worktree. The current branch is `codex/2stage-bjt-ppa`; do not recreate
3BJT sweep artifacts except for reading the preserved final comparison table.

## Source Of Truth

Read these first:

```powershell
Get-ChildItem -File *.md
Get-Content -Raw -Encoding UTF8 .\2stage-bjt.md
Get-Content -Raw -Encoding UTF8 .\next.md
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt3_final_candidate_comparison.csv
rg --files .\netlists .\results\ngspice .\maxrun
```

Priority:

1. Assignment original document in the repo root
2. Active design document: `2stage-bjt.md`
3. Preserved 3BJT comparison: `results/ngspice/tables/bjt3_final_candidate_comparison.csv`
4. Actual generated 2BJT netlists/results
5. Historical notes in `next.md`, `plan.md`, `progress.md`, and `change.md`

## Active Goal

Convert the project from the verified 3BJT fallback into a 2BJT PPA
experiment:

```text
VIN -> CE1 -> CE2 -> output rebias -> OPAMP follower -> two RC filter poles -> 10 pF load
```

Initial pass/fail targets:

```text
midband gain near 40 dB
lower cutoff near 10 Hz
upper cutoff >= 20 kHz
far high-frequency rolloff <= -80 dB/dec from 100 kHz to 1 MHz
output common-mode near 2.5 V
no clipping or large ringing under 1 mV, 1 kHz transient input
area and power compared directly against bjt3_sweep_hfbuf_r10k_c150p
```

## File Policy

Keep:

```text
assignment original document in the repo root
workflow.md
maxrun/WORKFLOW_INDEX.md
maxrun/workflows/*.md
results/ngspice/tables/bjt3_final_candidate_comparison.csv
netlists/bjt2_op.spice
```

Delete or avoid regenerating:

```text
netlists/bjt3_*.spice
results/ngspice/csv/bjt3_*.csv
results/ngspice/raw/bjt3_*.raw
results/ngspice/logs/bjt3_*.log
results/ngspice/plots/bjt3_*.png
results/ngspice/tables/bjt3_*.csv except bjt3_final_candidate_comparison.csv
```

Generate only 2BJT artifacts:

```text
netlists/bjt2_*.spice
results/ngspice/csv/bjt2_*.csv
results/ngspice/raw/bjt2_*.raw
results/ngspice/logs/bjt2_*.log
results/ngspice/plots/bjt2_*.png
results/ngspice/tables/bjt2_*.csv
```

## Simulation Commands

Run structure checks before the sweep:

```powershell
node .\maxrun\test_bjt2_runner_structure.mjs
```

Run the 2BJT PPA sweep:

```powershell
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4
```

If ngspice needs lower concurrency:

```powershell
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 2
```

Common log scan:

```powershell
Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

## Decision Logic

Keep 3BJT fallback if:

```text
2BJT cannot reach near-40 dB gain
2BJT cannot keep fH >= 20 kHz
2BJT cannot meet the far -80 dB/dec rolloff proxy
2BJT transient nRMSE becomes much worse
2BJT area/power improvement is too small to justify the performance loss
```

Switch to 2BJT if:

```text
performance remains acceptable
area drops materially from removing one large coupling capacitor
power is lower or not much worse
AC/transient nRMSE stays competitive
the final story is a balanced PPA optimization rather than only pass/fail
```

## Change Log Rule

After each maxrun iteration, prepend or append a short entry to `change.md`:

```markdown
## YYYY-MM-DD - <cycle or run name>

- Problem: <what was wrong, missing, or uncertain>
- Change: <what was changed or generated>
- Verification: <command/result, pass/fail, or why verification was not run>
- Next: <next focused action>
```

Keep raw run details in CSVs, logs, plots, or `progress.md`.

## Git Rule

Before final response in a maxrun iteration:

```powershell
git status --short
```

Commit and push only when explicitly requested or when that maxrun cycle is
being run as an autonomous checkpoint workflow.
