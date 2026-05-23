# Autotopo MAXRUN Notes

This worktree is for bounded autonomous 2BJT PPA exploration.

Use one pass at a time:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Runs 1
```

`run_workflow_maxrun.ps1` defaults to
`workflow_bjt2_autotopo_relaxed_ppa.md` in this autotopo worktree.

Do not run the same workflow with high `-Runs` blindly. Review
`change.md`, `results/ngspice/tables/bjt2_autotopo_run_index.csv`, and
`results/ngspice/tables/bjt2_autotopo_vs_baselines.csv` between passes.

The current branch is:

```text
codex/2stage-bjt-autotopo-ppa
```

The current worktree path is:

```text
D:\Codex\Support\Microelectronics-2stage-autotopo-ppa
```
