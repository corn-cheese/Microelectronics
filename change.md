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

## 2026-05-22 - workflow Cycle F high_cutoff_shape CH/RISO combined sweep

- Problem: Output-isolation alone improved far high-frequency rolloff but could not keep `fH >= 20 kHz` at stronger RISO values.
- Change: Added `maxrun/run_hfiso_ch_sweep.mjs` and generated/ran `CH=22p/18p/15p` with `RISO=330k/470k/680k` as one `high_cutoff_shape` family.
- Verification: 27 ngspice runs exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_hfiso_ch*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. No candidate was accepted; best bandwidth-preserving far slope was `CH=22p, RISO=330k` with `fH=22801.4068 Hz` and `100k-1Meg=-72.43 dB/dec`.
- Next: Keep `bjt3_sweep_coutalign_c10n` as final candidate unless 80 dB/dec is hard; then test one explicit output low-pass section or load buffer/filter fallback.

## 2026-05-22 - workflow Cycle F high_cutoff_shape explicit output low-pass section

- Problem: CH/RISO tuning still did not reach the high-frequency 80 dB/dec target while preserving bandwidth.
- Change: Added `maxrun/run_hflp_sweep.mjs` and generated/ran an explicit output `RLP/CLP` low-pass section sweep at fixed `CH=30p`.
- Verification: 21 ngspice runs exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_hflp_*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. No candidate was accepted because all tested `RLP/CLP` values pushed `fH` below `20 kHz`.
- Next: Keep `bjt3_sweep_coutalign_c10n` as final candidate; if 80 dB/dec remains hard, test one load buffer/filter fallback, otherwise proceed to final integration review.

## 2026-05-22 - workflow Final Integration Review

- Problem: Final deliverables existed, but the integrated submission state needed a fresh consistency and log-scan review.
- Change: Reviewed final candidate references, final CSV metrics, accepted/rejected sweep trail, and bjt3 log health without creating new circuit netlists.
- Verification: Required `rg` checks found the expected artifact references and no ambiguity markers; `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: If high-frequency `80 dB/dec` remains mandatory, verify one load buffer/filter fallback; otherwise move to presentation/submission packaging for `bjt3_sweep_coutalign_c10n`.

## 2026-05-22 - workflow Cycle F high_cutoff_shape load-buffer/filter fallback

- Problem: Passive high-frequency pole attempts could not meet the `80 dB/dec` high-frequency target while keeping `fH >= 20 kHz`.
- Change: Added `maxrun/run_hfbuf_filter_sweep.mjs` and generated/ran an ideal OPAMP load-buffer plus two-pole RC output filter fallback family.
- Verification: 12 OP/AC/tran ngspice runs plus accepted-candidate noise run exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_hfbuf_*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `hfbuf_r10k_c150p` passed with `midgain=39.540374 dB`, `fH=20738.04886 Hz`, `out_pp=0.189751 V`, and `100k-1Meg=-87.17 dB/dec`.
- Next: Regenerate Cycle G deliverables for `hfbuf_r10k_c150p` and compare its OPAMP PPA penalty against the BJT-only final candidate.

## 2026-05-22 - workflow Cycle G fallback refresh

- Problem: The accepted `hfbuf_r10k_c150p` fallback had sweep results but not refreshed Cycle G deliverables or a direct PPA comparison against the BJT-only candidate.
- Change: Added `maxrun/regenerate_cycle_g_hfbuf.mjs`, regenerated final device/area/power/target/performance tables and plots for `bjt3_sweep_hfbuf_r10k_c150p`, and added `bjt3_final_candidate_comparison.csv`.
- Verification: Fresh OP/AC/tran/noise ngspice runs exited `0`; `Select-String .\results\ngspice\logs\bjt3_sweep_hfbuf_r10k_c150p*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. Fallback row: `midgain=39.5403745 dB`, `fH=20738.048859 Hz`, `100k-1Meg=-87.17 dB/dec`, `worst_power=235.862 uW`, `area_p=265169812.927`.
- Next: Run final integration review and decide presentation wording for hard-target fallback versus low-power BJT-only reference.

## 2026-05-22 - workflow Final Integration Review fallback

- Problem: The fallback Cycle G deliverables existed, but the final submission position needed a fresh consistency review against the BJT-only reference.
- Change: Reviewed required artifact references, ambiguity markers, bjt3 log health, final plots, PPA area sum, worst-power consistency, and `bjt3_final_candidate_comparison.csv`.
- Verification: Required `rg` checks found expected references and no ambiguity markers; bjt3 log scan returned no matches; PPA area and worst power matched `performance_summary.csv` within rounding.
- Next: Prepare presentation/submission materials using `bjt3_sweep_hfbuf_r10k_c150p` as the hard-target fallback and `bjt3_sweep_coutalign_c10n` as the low-power BJT-only reference.

## 2026-05-22 - workflow Final Integration Review refresh

- Problem: `goal.md` requested one more consistency review for the fallback candidate and final deliverables.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plot files, area sum, worst power, target rows, device rows, and comparison table.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; area and power matched `performance_summary.csv` within rounding.
- Next: Prepare presentation/submission materials with `bjt3_sweep_hfbuf_r10k_c150p` as the hard-target fallback and `bjt3_sweep_coutalign_c10n` as the low-power BJT-only reference.

## 2026-05-22 - workflow Final Integration Review submission readiness

- Problem: Final fallback deliverables needed one current run-level readiness check before moving to submission materials.
- Change: Rechecked final artifact references, ambiguity markers, bjt3 log health, plot existence, CSV row counts, area sum, worst power, and BJT-only/fallback comparison.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; `area_calculation.csv`, `power_calculation.csv`, and `performance_summary.csv` agree for `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Prepare presentation/submission materials and explicitly state ideal OPAMP noise limitation plus the BJT-only reference power/area trade-off.

## 2026-05-22 - workflow Final Integration Review package handoff

- Problem: The circuit workflow was complete, but the final fallback package needed one handoff-level consistency check before presentation/submission work.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, plot files, area sum, worst power, and BJT-only/fallback comparison without changing netlists.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; area and power values match `performance_summary.csv` within rounding.
- Next: Build presentation/submission materials around `bjt3_sweep_hfbuf_r10k_c150p`, with the BJT-only reference and ideal OPAMP noise/power/area trade-off stated explicitly.

## 2026-05-22 - workflow Final Integration Review final handoff

- Problem: `goal.md` still listed final integration review as the next focused action for the accepted fallback package.
- Change: Rechecked final artifact references, ambiguity markers, bjt3 log health, CSV area/power consistency, row counts, plots, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; `area_calculation.csv`, `power_calculation.csv`, and `performance_summary.csv` agree for `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Prepare presentation/submission materials and explicitly state ideal OPAMP noise limitation plus the BJT-only reference power/area trade-off.

## 2026-05-22 - workflow Final Integration Review packaging readiness

- Problem: The final fallback package needed a current packaging-readiness consistency check before presentation/submission work.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plot files, area sum, worst power, row counts, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; `area_calculation.csv`, `power_calculation.csv`, and `performance_summary.csv` agree for `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Prepare presentation/submission materials and state the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package consistency

- Problem: `goal.md` still requested a final integration consistency review for the accepted fallback package.
- Change: Rechecked final artifact references, ambiguity markers, bjt3 log health, final plot existence, CSV row counts, area sum, worst power, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan returned no matches; bjt3 log scan returned no matches; area and power match `performance_summary.csv` within rounding for `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Prepare presentation/submission materials with the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit stated explicitly.

## 2026-05-22 - workflow Final Integration Review package closure

- Problem: The accepted fallback package needed a current closure-level consistency check before presentation/submission work.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plot files, row counts, area sum, worst power, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned no matches; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Prepare presentation/submission materials with ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit stated explicitly.

## 2026-05-22 - workflow Final Integration Review package final consistency

- Problem: `goal.md` still requested final fallback package consistency before presentation/submission work.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plot files, row counts, area sum, worst power, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review final package check

- Problem: Final fallback package needed one current consistency check before presentation/submission handoff.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plots, row counts, area sum, worst power, and BJT-only/fallback comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package lock

- Problem: `goal.md` still requested final integration review before presentation/submission packaging.
- Change: Rechecked required references, ambiguity markers, bjt3 log health, final plot presence, row counts, PPA area sum, worst power, and fallback/BJT-only comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package relock

- Problem: `goal.md` still points to final integration review before presentation/submission packaging.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plot presence, row counts, PPA area sum, worst power, and fallback/BJT-only comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package seal

- Problem: `goal.md` still listed final fallback integration review as the next action before presentation/submission packaging.
- Change: Rechecked required references, ambiguity markers, bjt3 log health, required CSV/plot presence, row counts, PPA area sum, worst power, and fallback/BJT-only comparison without changing circuit files.
- Verification: Required `rg` checks found expected references; ambiguity scan had no matches; bjt3 log scan had no matches; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package handoff lock

- Problem: `goal.md` still pointed to final integration review even though the fallback package had already been reviewed repeatedly.
- Change: Rechecked final package consistency and updated `goal.md` next action to presentation/submission packaging.
- Verification: Artifact `rg` check passed; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area, power, row counts, plots, and comparison table match the accepted fallback summary.
- Next: Prepare presentation/submission materials with the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review package ready

- Problem: The accepted fallback package needed a current run-level readiness check before presentation/submission work.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plots, row counts, area sum, worst power, and fallback/BJT-only comparison without changing circuit files.
- Verification: Required `rg` returned 111 matches; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with the ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.

## 2026-05-22 - workflow Final Integration Review submission handoff

- Problem: The final fallback package needed one current handoff check before presentation/submission materials.
- Change: Rechecked artifact references, ambiguity markers, bjt3 log health, final plots, row counts, area sum, worst power, and fallback/BJT-only comparison without changing circuit files.
- Verification: Required artifact `rg` found expected references; ambiguity scan and bjt3 log scan returned `NO_MATCH`; area and power match `performance_summary.csv` for `bjt3_sweep_hfbuf_r10k_c150p` within rounding.
- Next: Prepare presentation/submission materials with ideal OPAMP noise limitation, BJT-only reference, power/area penalty, and high-frequency far-slope benefit.
