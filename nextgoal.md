# Next Goal: 2BJT Low-Frequency Shape PPA Branch

This branch is for one focused question:

Can the current 2BJT PPA candidate improve its low-frequency transfer-function
match enough to raise the overall PPA score, while keeping the existing power
advantage and avoiding a large area penalty?

Current branch:

```text
codex/2stage-bjt-lowfreq-ppa
```

Current baseline candidate:

```text
bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k
```

Baseline metrics from the current summary tables:

```text
midband gain                      39.760102 dB
lower cutoff                      12.569950 Hz
upper cutoff                      20409.380253 Hz
10 Hz gain error                  about -4.39 dB from midband
low-frequency slope, 1 Hz-10 Hz   about +41 dB/dec
far high-frequency slope          -80.5594 dB/dec from 100 kHz to 1 MHz
AC nRMSE                          0.136319434501
transient nRMSE                   0.023733677809
power                             65.172 uW
area                              1.820824e8 p
```

## Problem

The current 2BJT candidate is strong on power and area, and it barely satisfies
the far high-frequency rolloff proxy. Its weakest performance issue is the
low-frequency transfer-function shape:

```text
fL is above the nominal 10 Hz target.
10 Hz is attenuated more than the desired -3 dB corner behavior.
The 1 Hz-10 Hz rejection slope is much weaker than the assignment's approximate
80 dB/dec low-frequency target.
```

This means the current design is a good PPA candidate only if performance
strictness is relaxed. If the performance score strongly rewards closeness to
the target H(s), the next run should spend a small amount of area and power to
improve low-frequency shape.

## Main Hypothesis

Adding or reshaping one high-impedance low-frequency high-pass section can
improve the performance score more than it hurts the area and power scores.

The best version is not simply adding a 10 Hz pole. The low-frequency poles
must be redistributed so the total response still lands near -3 dB around
10 Hz while the out-of-band rejection below 10 Hz becomes steeper.

## Candidate Families

Keep the current 2BJT signal path and OPAMP/filter high-frequency protection:

```text
VIN -> CE1 -> CE2 -> output rebias / low-frequency shaping
    -> OPAMP follower -> two RC low-pass poles -> 10 pF load
```

Explore these families in order.

1. Output high-pass split

   Replace the single output coupling section with two smaller high-impedance
   high-pass sections:

   ```text
   b2_collector -> COUT1 -> vhp_mid -> COUT2 -> vout_drv
   ```

   Add a high-value rebias divider at `vhp_mid`, and keep the existing final
   rebias divider at `vout_drv`. Sweep `COUT1`, `COUT2`, `RHP`, and `ROUT`.

   Suggested first grid:

   ```text
   COUT1/COUT2: 3.3n, 4.7n, 6.8n, 10n
   RHP/ROUT:    10Meg, 15Meg, 22Meg, 33Meg
   ```

   This is attractive because the existing 10 nF output capacitor already costs
   area. Splitting it into two smaller capacitors may add a pole without a
   large net capacitor-area increase.

2. Bias-resistance scaling with fixed capacitor values

   Scale `RB_TOP/RB_BOT` while preserving their ratio, then verify DC operating
   point, gain, noise, and transient behavior.

   Suggested first grid:

   ```text
   scale: 1.0x, 1.5x, 2.2x, 3.3x
   ```

   This can lower input/interstage high-pass corners without increasing
   capacitor area, but it may increase resistor area and bias sensitivity.

3. High-frequency margin recovery

   If low-frequency reshaping hurts the upper cutoff or AC nRMSE, retune the
   small collector capacitors and output low-pass filter.

   Suggested first grid:

   ```text
   CH:   20p, 21p, 22p, 24p
   CBUF: 180p, 200p, 220p
   RBUF: 10k, 12k
   ```

   Keep `OPAMP_FT=250k` unless a candidate cannot pass high-frequency checks.
   Increasing OPAMP_FT directly spends power and should be a last resort.

## Acceptance Gates

A candidate should be considered better than the current 2BJT baseline only if
it improves the performance shape enough to justify any area/power cost.

Hard gates:

```text
midband gain:                 39 dB to 41 dB preferred, 35 dB to 45 dB allowed
lower cutoff:                 <= 10.5 Hz preferred
10 Hz gain relative midband:  -2.5 dB to -3.5 dB preferred
upper cutoff:                 >= 20 kHz
20 kHz gain relative midband: near -3 dB
far high-frequency slope:     <= -80 dB/dec from 100 kHz to 1 MHz
output common-mode:           2.45 V to 2.55 V
transient output:             no clipping or large ringing with 1 mV, 1 kHz input
ngspice log scan:             no fatal, singular, unknown, failed, or missing-model errors
```

Performance-improvement gates:

```text
AC nRMSE should improve versus 0.136319, or
1 Hz-10 Hz low-frequency slope should improve by at least 15 dB/dec, or
10 Hz gain error should move close to the -3 dB target.
```

PPA guardrails:

```text
power should stay near the current 65.172 uW baseline.
area increase should ideally stay below 5%.
area increase up to 10% is acceptable only if AC nRMSE and low-frequency shape
improve clearly.
do not add another 68 nF-scale capacitor unless all smaller high-impedance
options fail.
```

## Required Outputs

Create a separate runner or clearly separated candidate family, for example:

```text
maxrun/run_bjt2_lowfreq_ppa_sweep.mjs
results/ngspice/tables/bjt2_lowfreq_ppa_sweep_summary.csv
results/ngspice/tables/bjt2_lowfreq_vs_current_comparison.csv
```

Keep raw run artifacts under `bjt2_lowfreq_*` stems so they do not overwrite
the existing accepted candidate unless a new candidate is selected.

Update `change.md` with the selected result and explain whether the low-frequency
performance gain was large enough to improve overall PPA.

## Stop Conditions

Stop and keep the current 2BJT candidate if:

```text
all low-frequency-shape candidates require more than 10% area increase without
clear AC nRMSE improvement.
all candidates that improve low-frequency shape lose fH >= 20 kHz or far
-80 dB/dec high-frequency rolloff.
transient nRMSE or output common-mode becomes materially worse.
```

