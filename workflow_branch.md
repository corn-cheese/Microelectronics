# Workflow Branch Instructions

This repo now has a focused branch for the low-frequency PPA experiment:

```text
codex/2stage-bjt-lowfreq-ppa
```

The current checkout has already been switched to that branch.

## Create The Branch Manually

Use this only if you need to recreate the branch from the prior 2BJT PPA branch:

```powershell
git switch codex/2stage-bjt-ppa
git switch -c codex/2stage-bjt-lowfreq-ppa
```

If the branch already exists:

```powershell
git switch codex/2stage-bjt-lowfreq-ppa
```

## Run The Branched Workflow

Preferred command:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Workflow .\workflow_lowfreq_ppa.md -Runs 1
```

Run multiple autonomous passes only after the first pass has produced a sane
runner and summary table:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Workflow .\workflow_lowfreq_ppa.md -Runs 3
```

Direct Codex command without the wrapper:

```powershell
Get-Content -Raw -Encoding UTF8 .\workflow_lowfreq_ppa.md | codex.cmd exec --cd (Get-Location) -
```

## Run Only The Simulation Sweep

After the workflow creates `maxrun/run_bjt2_lowfreq_ppa_sweep.mjs`, run:

```powershell
node .\maxrun\run_bjt2_lowfreq_ppa_sweep.mjs --parallel 4
```

Use lower concurrency if needed:

```powershell
node .\maxrun\run_bjt2_lowfreq_ppa_sweep.mjs --parallel 2
```

## Review Outputs

Expected new files:

```text
maxrun/run_bjt2_lowfreq_ppa_sweep.mjs
results/ngspice/tables/bjt2_lowfreq_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_lowfreq_vs_current_comparison.csv
```

Keep the old current-candidate artifacts until a new candidate is clearly
better. The branch decision is current 2BJT PPA candidate versus new 2BJT
low-frequency-shape candidate.

