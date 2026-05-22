# Goal: 3-Stage BJT Neural Signal Amplifier

This file is the target checklist for future simulation and tuning runs. Read it before changing netlists or accepting a new candidate.

## Target Specs

- Supply: 5 V
- Input common-mode: 2.5 V
- Input signal: 1 mV small-signal
- Midband gain: 40 dB, about 100 V/V
- Target bandwidth: 10 Hz to 20 kHz
- Load capacitor: 10 pF
- Output: ideally centered around 2.5 V common-mode, unless output coupling and rebias are documented
- Out-of-band signal and noise suppression should be documented

## Current Candidate

Current accepted performance candidate:

- Topology: 3-stage NPN common-emitter amplifier with load-buffer/filter fallback
- BJT device: `sky130_fd_pr__npn_05v5_W1p00L1p00`
- RC: 120k
- RE: 18.5k
- RB_TOP: 3.3Meg
- RB_BOT: 1Meg
- CIN/C12/C23: 68n
- CH1/CH2/CH3: 30p
- COUT: 10n
- ROUT_TOP/ROUT_BOT: 10Meg / 10Meg
- Output fallback: ideal ahdLib-equivalent OPAMP follower, `OPAMP_FT=2Meg`, `IOPAMP=14uA`
- Output filter: `RBUF1=RBUF2=10k`, `CBUF1=CBUF2=150p`
- CLOAD: 10p
- Final candidate stem: `bjt3_sweep_hfbuf_r10k_c150p`

## Current Results

- Midband gain: about 39.54 dB, about 94.86 V/V
- Upper cutoff: about 20.74 kHz
- Lower cutoff: about 10.60 Hz
- Output DC center: about 2.50 V after output coupling/rebias
- 10 pF transient: stable, no obvious clipping or ringing
- Bias/headroom: acceptable active-region operation
- Target-band noise, 10 Hz to 20 kHz: documented for the fallback candidate, with about 15.0 uVrms input-referred noise; ideal buffer noise is not modeled
- Low-frequency practical rolloff remains about +72.52 dB/dec from 0.316 Hz to 3.162 Hz and +49.26 dB/dec from 1 Hz to 10 Hz.
- High-frequency far slope improves to about -87.17 dB/dec from 100 kHz to 1 MHz with the load-buffer/filter fallback.
- Refreshed Cycle G deliverables now target `bjt3_sweep_hfbuf_r10k_c150p`: worst power about 235.862 uW, PPA area about 2.652e8 p, AC nRMSE about 0.10590, transient nRMSE about 0.02976, and AC/transient plots are regenerated.

## Known Design Gaps

- Gain is about 0.46 dB below the 40 dB target after output rebias and fallback filtering.
- Output coupling/rebias PPA is now documented for one 10 nF capacitor and two 10 MOhm resistors, but the capacitor area remains the dominant PPA cost.
- Low-frequency rolloff improved but still does not fully reach 80 dB/dec in the practical low-frequency skirt near cutoff. With COUT=10 nF and ROUT_TOP || ROUT_BOT about 5 MOhm, the output pole is about 3.18 Hz; measured slopes are about +72.51 dB/dec from 0.316 Hz to 3.162 Hz and +49.26 dB/dec from 1 Hz to 10 Hz.
- The load-buffer/filter fallback meets the far high-frequency hard-target proxy, but it adds an ideal OPAMP model whose noise is not included and raises worst power by about 70.0 uW versus the BJT-only candidate.
- The BJT-only candidate `bjt3_sweep_coutalign_c10n` remains the low-power reference: worst power about 165.862 uW, area about 2.648e8 p, AC nRMSE about 0.16014, and far high-frequency slope about -57.06 dB/dec.

## Next Sweep Priority

1. Final integration review for `bjt3_sweep_hfbuf_r10k_c150p` is complete as of 2026-05-22: required CSVs, plots, log scans, area, power, row counts, and `bjt3_final_candidate_comparison.csv` are internally consistent.
2. Prepare presentation/submission materials and state the trade-off explicitly: use `bjt3_sweep_hfbuf_r10k_c150p` when the 80 dB/dec high-frequency proxy is mandatory; use `bjt3_sweep_coutalign_c10n` if lowest power and no ideal OPAMP fallback is preferred.
3. If lower-skirt 80 dB/dec is later treated as a hard target, evaluate COUT/ROUT together as a new output-rebias family run.

## Acceptance Criteria

A candidate is acceptable only if:

- Midband gain is close to 40 dB.
- Lower cutoff is explainably near 10 Hz.
- Upper cutoff is near or above 20 kHz.
- 10 pF load does not cause clipping, instability, or large gain loss.
- Bias remains in active region.
- Noise is simulated and documented.
- Output common-mode is either near 2.5 V or corrected/explained with output coupling.

## Logging Rule

Do not put normal spec gaps in an error log. Treat them as design gaps unless ngspice fails, a required file is missing, convergence breaks, or the circuit leaves a valid operating region.
