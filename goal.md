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

Current accepted working candidate:

- Topology: 3-stage NPN common-emitter amplifier
- BJT device: `sky130_fd_pr__npn_05v5_W1p00L1p00`
- RC: 120k
- RE: 18.5k
- RB_TOP: 3.3Meg
- RB_BOT: 1Meg
- CIN/C12/C23: 68n
- CH1/CH2/CH3: 30p
- COUT: 10n
- ROUT_TOP/ROUT_BOT: 10Meg / 10Meg
- CLOAD: 10p
- Final candidate stem: `bjt3_sweep_coutalign_c10n`

## Current Results

- Midband gain: about 39.53 dB, about 94.77 V/V
- Upper cutoff: about 23.39 kHz
- Lower cutoff: about 10.60 Hz
- Output DC center: about 2.50 V after output coupling/rebias
- 10 pF transient: stable, no obvious clipping or ringing
- Bias/headroom: acceptable active-region operation
- Target-band noise, 10 Hz to 20 kHz: documented for the COUT-aligned candidate, with about 15.0 uVrms input-referred noise
- Low-frequency practical rolloff improved versus the 68 nF output-coupled candidate, and AC nRMSE improved from about 0.16544 to 0.160141.
- Refreshed Cycle G deliverables now target `bjt3_sweep_coutalign_c10n`: worst power about 165.862 uW, PPA area about 2.648e8 p, transient nRMSE about 0.02439, and AC/transient plots are regenerated.

## Known Design Gaps

- Gain is about 0.47 dB below the 40 dB target after output rebias.
- Output coupling/rebias PPA is now documented for one 10 nF capacitor and two 10 MOhm resistors, but the capacitor area remains the dominant PPA cost.
- Low-frequency rolloff improved but still does not fully reach 80 dB/dec in the practical low-frequency skirt near cutoff. With COUT=10 nF and ROUT_TOP || ROUT_BOT about 5 MOhm, the output pole is about 3.18 Hz; measured slopes are about +72.51 dB/dec from 0.316 Hz to 3.162 Hz and +49.26 dB/dec from 1 Hz to 10 Hz.
- High-frequency rolloff is also not yet 80 dB/dec in the simulated range. The final candidate shows about -21.29 dB/dec from 10 kHz to 100 kHz and -57.06 dB/dec from 100 kHz to 1 MHz. Internally, only CH1/CH2/CH3 are intentional high-frequency pole capacitors; CLOAD_10P is an external evaluation load, so a deliberate 4th high-frequency pole or filter section may be required if 80 dB/dec is a hard target.

## Next Sweep Priority

1. Add or tune an intentional 4th high-frequency pole if 80 dB/dec high-frequency rolloff is required, then verify gain, bandwidth, phase, load stability, and noise.
2. If lower-skirt 80 dB/dec is still treated as a hard target, evaluate COUT/ROUT together as a later output-rebias family run.
3. Re-run OP, AC, transient, 10 pF load, noise, and Cycle G deliverables after each accepted change.

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
