# Change Log

Short decision log for workflow iterations. Keep this file concise; use `progress.md` for detailed run notes.

## Entry Format

```markdown
## YYYY-MM-DD - <cycle or run name>

- Problem: <what was wrong, missing, or uncertain>
- Change: <what was changed or generated>
- Verification: <command/result, pass/fail, or why verification was not run>
- Next: <next focused action>
```

## 2026-05-22 - rolloff slope gap recorded

- Problem: The current final candidate does not visibly show 80 dB/dec rolloff near both practical skirts. Low-frequency rolloff near cutoff drops to about +60 dB/dec or +40 dB/dec depending on the measured decade, and high-frequency rolloff is about -21 dB/dec to -57 dB/dec over 10 kHz to 1 MHz.
- Change: Added the low-frequency pole-alignment gap and high-frequency 4th-pole gap to `goal.md`.
- Verification: Checked `bjt3_sweep_rebias_cout68n_r10meg_ac.csv`; far-low-frequency slope reaches about +80 dB/dec, but the near-cutoff skirt does not. High-frequency slope does not reach -80 dB/dec in the simulated range.
- Next: Sweep COUT/ROUT for low-frequency pole alignment and add or tune an intentional 4th high-frequency pole if 80 dB/dec is required.

## 2026-05-22 - workflow Cycle F COUT pole alignment

- Problem: The 68 nF output coupling pole was too far below the other high-pass poles, weakening the practical low-frequency skirt.
- Change: Swept only `COUT` at fixed `ROUT=10Meg/10Meg` and accepted `COUT=10n` as `bjt3_sweep_coutalign_c10n`.
- Verification: 12 ngspice runs exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_coutalign_c*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. Accepted row: `midgain=39.533420 dB`, `fL=10.59978 Hz`, `fH=23386.60 Hz`, `out_pp=0.189597 V`, `ac_nrmse=0.160141`.
- Next: Regenerate Cycle G final deliverables for `bjt3_sweep_coutalign_c10n`.

## 2026-05-22 - workflow Cycle G refresh

- Problem: Final Cycle G tables and plots still described the older `bjt3_sweep_rebias_cout68n_r10meg` candidate.
- Change: Regenerated device, area, power, target H(s), performance, and AC/transient plot deliverables for `bjt3_sweep_coutalign_c10n`.
- Verification: OP/AC/tran/noise ngspice runs exited `0`; c10n log scan returned no matches. `performance_summary.csv` now records `midgain=39.53342 dB`, `fL=10.59978 Hz`, `fH=23386.60 Hz`, `area_p=264800475.176`, `worst_power=165.862 uW`.
- Next: Run final integration review, or if 80 dB/dec high-frequency rolloff is mandatory, evaluate one 4th-pole candidate.

## 2026-05-22 - workflow Cycle F high_cutoff_shape 4th-pole output-cap sweep

- Problem: The final candidate still has weak high-frequency rolloff compared with the 80 dB/dec target.
- Change: Added `maxrun/run_hf4pole_sweep.mjs` and generated/ran `bjt3_sweep_hf4pole_chout*_{op,ac,tran}.spice` for output shunt `CHOUT=10p/15p/22p/33p/47p`.
- Verification: 15 ngspice runs exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_hf4pole_chout*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. No candidate was accepted: `10p` kept `fH=20593.90 Hz` but far slope was still only `-57.23 dB/dec`, while larger values pushed `fH` below `20 kHz`.
- Next: Evaluate an output-isolation resistor plus fourth-pole/load capacitor family instead of a bare output shunt capacitor.
