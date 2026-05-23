# 2-Stage BJT Neural Signal Amplifier

This branch converts the previous 3BJT solution into a 2BJT PPA experiment.
The 3BJT design remains the verified fallback, but its area is dominated by
large coupling capacitors. The purpose of this branch is to test whether one
fewer gain stage and one fewer large coupling capacitor can improve the
area/power balance while keeping acceptable performance.

## Preserved 3BJT Baseline

Keep this comparison artifact:

```text
results/ngspice/tables/bjt3_final_candidate_comparison.csv
```

Known 3BJT fallback:

```text
version: bjt3_sweep_hfbuf_r10k_c150p
topology: 3 common-emitter BJT stages + COUT rebias + ideal OPAMP follower + two RC output poles
midband gain: 39.5403745 dB
lower cutoff: 10.598446 Hz
upper cutoff: 20738.048859 Hz
far high-frequency rolloff: -87.174173 dB/dec from 100 kHz to 1 MHz
AC nRMSE: 0.105900392044
transient nRMSE: 0.029755172563
power: 235.862 uW
area: 2.651698129268e8 p
decision: accepted_fallback
```

Known low-power 3BJT reference:

```text
version: bjt3_sweep_coutalign_c10n
midband gain: 39.53342 dB
lower cutoff: 10.599777 Hz
upper cutoff: 23386.59595 Hz
far high-frequency rolloff: -57.06 dB/dec from 100 kHz to 1 MHz
power: 165.862 uW
area: 2.648004751759e8 p
```

## 2BJT Target

Target topology:

```text
VIN
  -> CIN
  -> CE1
  -> C12
  -> CE2
  -> COUT / output rebias to 2.5 V
  -> OPAMP unity follower with finite-FT pole
  -> two-pole RC output filter
  -> 10 pF load
```

Role split:

```text
BJT stages: voltage gain
OPAMP: load isolation only
post-buffer RC filter: high-frequency rolloff
```

Initial gates:

```text
midband gain: near 40 dB
lower cutoff: near 10 Hz
upper cutoff: >= 20 kHz
far high-frequency rolloff: <= -80 dB/dec from 100 kHz to 1 MHz
load: 10 pF at vout_final
output common-mode: near 2.5 V
area: materially below the 3BJT fallback if possible
power: below or competitive with the 3BJT fallback if possible
```

## Files To Keep

Keep assignment/source documents and workflow documents:

```text
assignment original document in the repo root
workflow.md
maxrun/WORKFLOW_INDEX.md
maxrun/workflows/*.md
```

Keep the 3BJT final comparison table only:

```text
results/ngspice/tables/bjt3_final_candidate_comparison.csv
```

Keep the 2BJT operating-point sanity check:

```text
netlists/bjt2_op.spice
results/ngspice/tables/bjt2_op_summary.csv
```

## Active 2BJT Runner

Run the first-pass 2BJT PPA sweep with:

```powershell
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4
```

The runner generates:

```text
netlists/bjt2_sweep_ppa_*_{op,ac,tran,noise}.spice
results/ngspice/csv/bjt2_sweep_ppa_*.csv
results/ngspice/raw/bjt2_sweep_ppa_*.raw
results/ngspice/logs/bjt2_sweep_ppa_*.log
results/ngspice/plots/bjt2_sweep_ppa_*_{ac,tran}.png
results/ngspice/tables/bjt2_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_performance_summary.csv
results/ngspice/tables/bjt2_area_calculation.csv
results/ngspice/tables/bjt2_power_calculation.csv
results/ngspice/tables/bjt2_device_list.csv
results/ngspice/tables/bjt2_target_hs.csv
results/ngspice/tables/bjt2_vs_bjt3_comparison.csv
```

## Design Notes

The 2BJT design is not assumed to beat 3BJT. It must earn the switch by
showing enough area or power improvement to justify any performance loss.

The large PPA area term in the 3BJT fallback is the coupling capacitor stack:

```text
CIN, C12, C23 = 68 nF x3
COUT = 10 nF
```

The first 2BJT attempt removes one large interstage capacitor:

```text
CIN, C12 = first-pass coupling capacitor sweep
COUT = output rebias capacitor
```

The OPAMP should not be removed first for area. Under the assignment model it
costs only 1000 p area, but it costs power through:

```text
IOPAMP = OPAMP_FT * 7e-12
```

Therefore maxrun should tune OPAMP_FT for power only after gain, bandwidth,
transient behavior, and far high-frequency rolloff are under control.

## Current Accepted 2BJT Candidate

Latest accepted sweep row:

```text
version: bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k
topology: 2 common-emitter BJT stages + COUT rebias + finite-FT OPAMP follower + two RC output poles
midband gain: 39.7601021 dB
lower cutoff: 12.56994968 Hz
upper cutoff: 20409.38025254 Hz
far high-frequency rolloff: -80.5594 dB/dec from 100 kHz to 1 MHz
AC nRMSE: 0.136319434501
transient nRMSE: 0.023733677809
power: 65.172 uW
area: 1.820824e8 p
decision: accepted
```

Compared with `bjt3_sweep_hfbuf_r10k_c150p`, this 2BJT candidate is weaker on
AC nRMSE and far-rolloff margin, but materially better on PPA:

```text
power delta: -170.690 uW
area delta: -8.308739e7 p
```

In this local worktree, `results/ngspice/csv` and `results/ngspice/raw` deny
new process writes. The runner detects that condition and writes fresh raw data
to:

```text
results/ngspice/csv_tmp
results/ngspice/raw_tmp
```

The summary and comparison tables in `results/ngspice/tables` are generated
from those fresh fallback raw-data directories.

## Current Next Step

Run:

```powershell
node .\maxrun\test_bjt2_runner_structure.mjs
node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4
```

Then review:

```text
results/ngspice/tables/bjt2_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_vs_bjt3_comparison.csv
```
