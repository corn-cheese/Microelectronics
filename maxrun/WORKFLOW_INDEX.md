# Maxrun Workflow Index

This worktree started from the `codex/2stage-bjt-ppa` branch. The active
low-frequency experiment branch is `codex/2stage-bjt-lowfreq-ppa`.

## Primary Run

Use this command for one automated workflow pass:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Runs 1
```

That script reads `workflow.md` and passes it to:

```powershell
codex.cmd exec --cd <repo-root> -
```

## Low-Frequency PPA Branch Run

Use this command for the branched low-frequency-shape workflow:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Workflow .\workflow_lowfreq_ppa.md -Runs 1
```

Read the branch goal first:

```text
nextgoal.md
workflow_lowfreq_ppa.md
workflow_branch.md
```

## Direct Simulation Run

For circuit generation and ngspice simulation without another Codex pass:

```powershell
node .\maxrun\test_bjt2_runner_structure.mjs
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4
```

Use lower concurrency if needed:

```powershell
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 2
```

## Active Outputs

The 2BJT runner writes only `bjt2_*` artifacts:

```text
netlists/bjt2_sweep_ppa_*_{op,ac,tran,noise}.spice
results/ngspice/csv/bjt2_sweep_ppa_*.csv
results/ngspice/raw/bjt2_sweep_ppa_*.raw
results/ngspice/logs/bjt2_sweep_ppa_*.log
results/ngspice/plots/bjt2_sweep_ppa_*_{ac,tran}.png
results/ngspice/tables/bjt2_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_vs_bjt3_comparison.csv
```

## Preserved 3BJT Reference

Keep this table as the comparison baseline:

```text
results/ngspice/tables/bjt3_final_candidate_comparison.csv
```

Do not regenerate old `bjt3_*` raw, CSV, log, plot, or netlist artifacts in
this branch unless the user explicitly asks for a 3BJT rerun.

## Historical Plan Workflows

The files under `maxrun/workflows/` are historical planning prompts. They are
kept as workflow documentation, but they are not the active run path for this
2BJT branch.
