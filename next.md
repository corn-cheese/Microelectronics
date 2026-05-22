# Next Handoff: Why Move from 3BJT to 2BJT

## Current State

The current pushed `main` branch contains the verified 3-stage BJT baseline.

Latest known baseline:

```text
commit: a88a212 first 3bjt
branch: main
status: pushed to origin/main
```

The strongest current submission candidate is:

```text
version: bjt3_sweep_hfbuf_r10k_c150p
topology:
  3 common-emitter BJT stages
  output coupling/rebias
  ideal OPAMP unity follower
  two post-buffer RC low-pass poles
  10 pF load
```

Measured result:

```text
midband gain      = 39.5403745 dB
lower cutoff      = 10.598446 Hz
upper cutoff      = 20738.048859 Hz
HF rolloff        = -87.174173 dB/dec from 100 kHz to 1 MHz
AC nRMSE          = 0.105900392044
transient nRMSE   = 0.029755172563
power             = 235.862 uW
area              = 2.651698129268e8 p
decision          = accepted_fallback
```

This candidate is performance-safe. It satisfies the hard high-frequency rolloff proxy and remains stable with the 10 pF load.

## Why the Current 3BJT Design Is Not the End Point

The 3BJT design is robust, but it may not be optimal for relative PPA grading.

The project grading is balanced:

```text
Area        8 points
Power       8 points
Performance 8 points
Presentation 6 points
```

Area and power are ranked competitively. Therefore, a design with perfect performance but very poor area or power may lose to a design with slightly weaker but still acceptable performance and much better area/power.

The key issue is that the 3BJT design has very large coupling capacitors.

Current area contributors:

```text
CIN, C12, C23 = 68 nF x3      -> about 2.490988292949e8 p
COUT          = 10 nF         -> about 1.221072692622e7 p
CBUF1, CBUF2  = 150 pF x2     -> about 3.663218077865e5 p
OPAMP         = one unit      -> 1000 p
```

This means the area is dominated by the large 68 nF coupling capacitors. The OPAMP is not the area problem under this project's area model.

Important conclusion:

```text
Do not optimize area by removing the OPAMP first.
Optimize area by reducing large coupling capacitors and/or reducing the number of coupling capacitors.
```

## Why 2BJT Is Worth Trying

The 3-stage design uses three large coupling capacitors:

```text
CIN
C12
C23
```

A 2-stage design can potentially remove one large interstage coupling capacitor.

Expected benefit:

```text
one fewer large coupling capacitor
lower area
possibly lower power
still enough gain if each stage is pushed harder
```

The trade-off:

```text
3BJT:
  easier performance
  easier gain/headroom
  each stage has lower gain burden
  larger capacitor count and larger area

2BJT:
  lower stage count
  fewer large coupling capacitors
  area and power improvement possible
  harder gain/headroom/distortion/noise optimization
```

The move to 2BJT is not because 3BJT was wrong. The 3BJT design is a valid safe baseline. The move to 2BJT is a competitive PPA optimization attempt.

## RC and Area Trade-Off

Low-frequency cutoff is controlled by RC products.

Approximate relation:

```text
f = 1 / (2*pi*R*C)
```

For the same cutoff:

```text
increase R -> decrease C possible
decrease C -> capacitor area decreases
increase R -> resistor area increases
```

Therefore the real optimization is not "make C smaller" in isolation. It is:

```text
find the R/C point where capacitor area reduction is larger than resistor area increase,
while gain, bandwidth, noise, bias, and transient response remain acceptable.
```

Current observation:

```text
capacitor area dominates resistor area by a large margin.
```

So there is likely room to increase selected resistances and reduce coupling capacitors. However, large resistances create risks:

```text
higher thermal noise
weaker bias stiffness
more operating-point sensitivity
slower settling
more interaction with BJT input impedance
possible transient degradation
```

The next sweep should vary resistance scaling and capacitance values together.

## OPAMP Interpretation

The OPAMP in the current successful candidate is not used as the main gain source. It is used as a unity-gain load buffer/filter driver.

Purpose:

```text
isolate the BJT gain path from the 10 pF load
allow two extra RC poles after the buffer
achieve about 80 dB/dec high-frequency rolloff
```

Existing passive-only 3BJT high-frequency shaping was not enough. It tended to hit a wall around:

```text
about -72 to -75 dB/dec
```

or it pushed the upper cutoff below 20 kHz.

The successful OPAMP/filter fallback achieved:

```text
fH = 20.738 kHz
HF rolloff 100 kHz to 1 MHz = -87.17 dB/dec
```

The OPAMP area penalty is small in this project:

```text
OPAMP area = 1000 p
```

The OPAMP power penalty is more meaningful:

```text
OPAMP_FT = 2 MHz
IOPAMP = OPAMP_FT * 7e-12 = 14 uA
power penalty at 5 V = about 70 uW
```

Therefore:

```text
OPAMP hurts power more than area.
Large coupling capacitors hurt area much more than OPAMP does.
```

## Recommended 2BJT Topology

Do not start with pure 2BJT passive-only unless specifically testing a baseline.

Primary recommended candidate:

```text
VIN
 -> CE1
 -> interstage coupling
 -> CE2
 -> COUT / output rebias
 -> OPAMP unity follower
 -> two-pole RC output filter
 -> 10 pF load
```

This keeps the role split clean:

```text
BJT stages: voltage gain
OPAMP: load isolation only
post-buffer RC: high-frequency rolloff
```

This topology is the most direct PPA experiment:

```text
reduce one BJT stage
reduce one large coupling capacitor
retain OPAMP/filter to protect 80 dB/dec performance
search for better area/power balance than 3BJT
```

## What to Sweep Next

Use the 3BJT candidate as a baseline, but create fresh 2BJT files. Do not overwrite `bjt3_*` outputs.

Suggested sweep dimensions:

```text
RC values:
  tune CE collector loads for target gain and power

RE values:
  tune stage gain, headroom, linearity, and bias current

RB scale:
  increase bias/input resistance to allow smaller coupling caps
  watch noise and operating-point sensitivity

CIN, C12, COUT:
  test 68n, 47n, 33n, 22n, 15n, 10n
  do not reduce caps alone; pair with resistance scaling

RBUF/CBUF:
  tune post-buffer two-pole low-pass
  preserve fH >= 20 kHz
  target far high-frequency rolloff <= -80 dB/dec

OPAMP_FT:
  lower FT if transient/AC still pass, because OPAMP power scales with FT
```

Initial design targets:

```text
midband gain:       close to 40 dB, roughly 39 to 40 dB preferred
lower cutoff:       near 10 Hz; 10 to 12 Hz may be acceptable if nRMSE improves
upper cutoff:       at least 20 kHz
HF rolloff:         <= -80 dB/dec in the far high-frequency check
10 pF load:         no large gain collapse, clipping, or ringing
output common-mode: near 2.5 V
power:              lower than 235.862 uW if possible
area:               materially lower than 2.6517e8 p
```

## File Naming Rules for the 2BJT Branch

Create a branch or worktree for the experiment. Recommended branch name:

```text
codex/2stage-bjt-ppa
```

Keep all 2BJT artifacts separate:

```text
netlists/bjt2_*.spice
maxrun/run_bjt2_*.mjs
results/ngspice/csv/bjt2_*.csv
results/ngspice/raw/bjt2_*.raw
results/ngspice/logs/bjt2_*.log
results/ngspice/plots/bjt2_*.png
results/ngspice/tables/bjt2_*.csv
```

Rename or create:

```text
3stage-bjt.md -> 2stage-bjt.md
```

The new `2stage-bjt.md` should start by summarizing the 3BJT baseline and explaining why 2BJT is being attempted.

## What to Preserve from 3BJT

Preserve these as comparison references:

```text
results/ngspice/tables/bjt3_final_candidate_comparison.csv
results/ngspice/tables/bjt3_sweep_hfbuf_r10k_c150p_summary.csv
results/ngspice/plots/bjt3_sweep_hfbuf_r10k_c150p_ac.png
results/ngspice/plots/bjt3_sweep_hfbuf_r10k_c150p_tran.png
```

The final 2BJT work should include a direct comparison table against:

```text
bjt3_sweep_coutalign_c10n
bjt3_sweep_hfbuf_r10k_c150p
best bjt2 candidate
```

## What Not to Do

Do not assume 2BJT is automatically better.

2BJT may fail because each stage needs more gain:

```text
40 dB total gain = about 100 V/V
2 stages means roughly 10 V/V per stage
```

That is a heavier burden than 3 stages, and can hurt:

```text
headroom
distortion
transient shape
noise
operating-point robustness
```

Do not remove the OPAMP just for area. Under the assignment's model, OPAMP area is tiny compared with the 68 nF capacitors.

Do not overwrite 3BJT outputs. Keep 3BJT as the known-good fallback.

Do not optimize by pass/fail only. This is a relative PPA task, so compare balanced score:

```text
area
power
AC nRMSE
transient nRMSE
gain error
bandwidth target
rolloff target
```

## Suggested Execution Plan

1. Create isolated worktree or branch:

```powershell
cd D:\Codex\Support\Microelectronics
git worktree add D:\Codex\Support\Microelectronics-2stage -b codex/2stage-bjt-ppa
cd D:\Codex\Support\Microelectronics-2stage
```

2. Rename the design document:

```powershell
git mv 3stage-bjt.md 2stage-bjt.md
```

3. Add 3BJT baseline summary to `2stage-bjt.md`.

4. Build a minimal 2-stage CE operating-point netlist:

```text
netlists/bjt2_candidate_op.spice
```

5. Add AC/transient/noise variants:

```text
netlists/bjt2_candidate_ac.spice
netlists/bjt2_candidate_tran.spice
netlists/bjt2_candidate_noise_10hz_20khz.spice
```

6. Add a 2BJT sweep runner:

```text
maxrun/run_bjt2_ppa_sweep.mjs
```

7. Sweep gain/bias first, then coupling-cap area, then output filter.

8. Regenerate final deliverables only after a candidate beats or meaningfully challenges the 3BJT baseline.

9. Produce final comparison:

```text
results/ngspice/tables/bjt2_vs_bjt3_comparison.csv
```

## Decision Logic

Keep the 3BJT baseline if:

```text
2BJT cannot reach near-40 dB gain
2BJT cannot keep fH >= 20 kHz
2BJT cannot meet -80 dB/dec with acceptable nRMSE
2BJT transient shape is worse enough to lose performance score
2BJT area/power improvement is too small to justify performance loss
```

Switch to 2BJT if:

```text
performance remains acceptable
area drops materially because a large coupling cap is removed or reduced
power is lower or not much worse
AC/transient nRMSE stays competitive
the design story is easier to defend as balanced PPA optimization
```

## One-Line Summary

The 3BJT design is the safe performance baseline, but its area is dominated by large coupling capacitors. The 2BJT branch should test whether one fewer gain stage and one fewer large coupling capacitor, combined with an OPAMP buffer and two-pole RC filter, can produce a better balanced PPA score while preserving the required 40 dB gain, 10 Hz to 20 kHz bandwidth, 10 pF load stability, and 80 dB/dec high-frequency rolloff.
