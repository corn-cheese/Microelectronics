# Codex Max Run Workflow: 2BJT Low-Frequency Shape PPA Branch

This workflow is the source prompt for the next branch after
`codex/2stage-bjt-ppa`. The active branch should be:

```text
codex/2stage-bjt-lowfreq-ppa
```

The goal is not to rerun the same fixed candidate list. The goal is to test
whether adding or reshaping one low-frequency high-pass section improves the
overall PPA score by improving the target H(s) match.

## Read First

```powershell
Get-Content -Raw -Encoding UTF8 .\nextgoal.md
Get-Content -Raw -Encoding UTF8 .\2stage-bjt.md
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_ppa_sweep_summary.csv
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt2_vs_bjt3_comparison.csv
Get-Content -Raw -Encoding UTF8 .\results\ngspice\tables\bjt3_final_candidate_comparison.csv
rg --files .\netlists .\results\ngspice .\maxrun
```

## Active Baseline

Use this 2BJT candidate as the direct comparison baseline:

```text
bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k
```

Do not compare only against the 3BJT fallback. The decision for this branch is:

```text
current 2BJT PPA candidate vs new 2BJT low-frequency-shape candidate
```

## Implementation Task

Create a focused low-frequency PPA sweep without deleting or regenerating old
3BJT artifacts.

Preferred file:

```text
maxrun/run_bjt2_lowfreq_ppa_sweep.mjs
```

It may reuse helpers and formulas from:

```text
maxrun/run_bjt2_ppa_sweep.mjs
```

Generate only `bjt2_lowfreq_*` netlist/result stems for new candidates.

## Candidate Family

Start with output high-pass split candidates:

```text
b2_collector -> COUT1 -> vhp_mid -> COUT2 -> vout_drv
```

Add a high-value rebias divider at `vhp_mid`. Keep the existing final rebias
divider at `vout_drv`. Keep the OPAMP follower and two output RC low-pass poles.

Initial sweep grid:

```text
COUT1/COUT2: 3.3n, 4.7n, 6.8n, 10n
RHP/ROUT:    10Meg, 15Meg, 22Meg, 33Meg
CH:          20p, 21p, 22p, 24p
CBUF:        180p, 200p, 220p
RBUF:        10k, 12k
OPAMP_FT:    250k
```

Keep the first run modest. Prefer a targeted grid over a huge Cartesian product
if runtime becomes too high.

## Metrics To Report

For every candidate, report at least:

```text
midgain_db
lower_cutoff_hz
upper_cutoff_hz
gain_at_10hz_relative_to_midband_db
gain_at_20khz_relative_to_midband_db
low_slope_1hz_10hz_db_dec
high_slope_100k_1meg_db_dec
passband_ripple_db
ac_nrmse
tran_nrmse
output_center
out_pp
worst_power_w
estimated_area_p
decision
notes
```

Also write a direct comparison table:

```text
results/ngspice/tables/bjt2_lowfreq_vs_current_comparison.csv
```

## Selection Logic

Reject candidates with simulator log errors, output common-mode failure,
clipping/ringing, `fH < 20 kHz`, or far high-frequency slope weaker than
`-80 dB/dec`.

Among valid candidates, rank by:

```text
1. lower AC nRMSE versus current 0.136319
2. 10 Hz relative gain close to -3 dB
3. stronger 1 Hz-10 Hz low-frequency slope
4. power close to or below 65.172 uW
5. area close to or below 1.820824e8 p
```

Accept a new candidate only if its performance-shape gain is clear enough to
justify any area or power increase. If the gain is marginal, keep the current
accepted 2BJT candidate and document that low-frequency reshaping did not raise
overall PPA.

## Verification Commands

Run structure checks:

```powershell
node .\maxrun\test_bjt2_runner_structure.mjs
```

Run the new sweep:

```powershell
node .\maxrun\run_bjt2_lowfreq_ppa_sweep.mjs --parallel 4
```

If ngspice needs lower concurrency:

```powershell
node .\maxrun\run_bjt2_lowfreq_ppa_sweep.mjs --parallel 2
```

Scan logs:

```powershell
Select-String .\results\ngspice\logs\bjt2_lowfreq*.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

## Change Log Rule

After the run, update `change.md` with:

```markdown
## 2026-05-23 - 2BJT low-frequency shape PPA branch

- Problem: current 2BJT PPA candidate has weak low-frequency target H(s) match.
- Change: <candidate family and files changed>
- Verification: <commands and selected metrics>
- Next: <keep current candidate or promote new low-frequency-shaped candidate>
```

Before final response, run:

```powershell
git status --short
```

