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

## 2026-05-23 - 2BJT PPA maxrun API verification rerun

- Problem: The active master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 simulator log scan, file-policy scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without changing topology, runner code, or candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the bjt3 file-policy scan found only `results/ngspice/tables/bjt3_final_candidate_comparison.csv`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun workflow rerun

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no disallowed generated `bjt3_*` basenames outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun latest source workflow run

- Problem: The active source workflow requested a fresh source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, simulator log scan, file-policy check, and preserved 3BJT fallback comparison.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. The runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check exited `0`; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches. The live file-policy scan found only the preserved `bjt3_final_candidate_comparison.csv` plus the expected `bjt2_vs_bjt3_comparison.csv` comparison file containing `bjt3_` text.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun API rerun

- Problem: The master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun source prompt rerun

- Problem: The active source workflow requested another source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without changing topology or candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no generated `bjt3_*` basename outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun repeated verification

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no generated `bjt3_*` basename outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; further tuning should only target AC nRMSE or far-rolloff margin if it preserves the material power and area advantage.

## 2026-05-23 - 2BJT PPA maxrun verification rerun

- Problem: The master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no generated `bjt3_*` basename outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; further tuning should target AC nRMSE or far-rolloff margin only if it preserves the material power and area advantage.

## 2026-05-23 - 2BJT PPA maxrun direct rerun

- Problem: The active workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, live file-policy check, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without hand-editing topology, runner code, or candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; live `bjt3_` artifact scan found only `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; only pursue further tuning if it improves AC nRMSE or far-rolloff margin without giving back the material power and area advantage.

## 2026-05-23 - 2BJT PPA maxrun API rerun verified

- Problem: The master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no generated `bjt3_` artifact basename outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; only trade area or power back for a clear AC nRMSE or far-rolloff margin improvement.

## 2026-05-23 - 2BJT PPA maxrun latest rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches; the live file-policy check found no generated `bjt3_` artifact basename outside `results/ngspice/tables/bjt3_final_candidate_comparison.csv`; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; only trade area or power back for a clear AC nRMSE or far-rolloff margin improvement.

## 2026-05-23 - 2BJT PPA maxrun Seoul rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches, and the live file-policy check found no generated `bjt3_` artifact basename outside the preserved comparison table.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; only trade area or power back for a clear AC nRMSE or far-rolloff margin improvement.

## 2026-05-23 - 2BJT PPA maxrun API validation

- Problem: The master workflow requested another current source-of-truth read, 2BJT structure check, PPA sweep rerun, bjt2 log scan, file-policy check, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. Fresh generated artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical CSV/RAW/plot directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches, and the live file-policy check found no generated `bjt3_` artifacts outside the preserved comparison table.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; only trade area or power back for a clear AC nRMSE or far-rolloff margin improvement.

## 2026-05-23 - 2BJT PPA maxrun current API rerun

- Problem: The current source workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or hand-authored candidate definitions. The sweep refreshed 2BJT generated artifacts and summary tables, again using `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin only if it preserves the power and area advantage.

## 2026-05-23 - 2BJT PPA maxrun current rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or netlists. Fresh CSV/RAW/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should only target AC nRMSE or extra far-rolloff margin if it preserves the `-170.690 uW` power and `-8.308739e7 p` area advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun replay from master prompt

- Problem: The current master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, bjt2 log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without hand-editing topology, runner code, or candidate netlists. Fresh CSV/RAW/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should only target AC nRMSE or extra far-rolloff margin if it preserves the `-170.690 uW` power and `-8.308739e7 p` area advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun latest validation

- Problem: The active master workflow requested another source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no hand-authored topology, runner, or netlist edits were needed. Fresh CSV/RAW/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the active PPA switch candidate; next tuning should only target AC nRMSE or extra far-rolloff margin if it preserves the `-170.690 uW` power and `-8.308739e7 p` area advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun fresh replay

- Problem: The master workflow requested another source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or netlists. Fresh process artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; future tuning should only trade area or power back for a clear AC nRMSE or far-rolloff margin improvement.

## 2026-05-23 - 2BJT PPA maxrun source workflow rerun

- Problem: The master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT-only workflow without changing topology, runner code, or netlists. The sweep refreshed 2BJT outputs and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; future tuning should focus on AC nRMSE or extra far-rolloff margin without giving back the material power and area reductions.

## 2026-05-23 - 2BJT PPA maxrun reproduced candidate

- Problem: The active master workflow requested another current source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without changing topology, runner code, or netlists. The sweep refreshed only 2BJT outputs and again wrote fresh CSV/raw/plot artifacts through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next tuning should target AC nRMSE or extra far-rolloff margin without giving back the material power and area reductions.

## 2026-05-23 - 2BJT PPA maxrun fresh verification

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without hand-editing topology, runner code, or netlists. The sweep refreshed only 2BJT outputs and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the current PPA switch candidate; only tune further if AC nRMSE or far-rolloff margin can improve without losing the material area and power advantage.

## 2026-05-23 - 2BJT PPA maxrun workflow replay

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or add far-rolloff margin without sacrificing the power/area advantage versus the 3BJT fallback.

## 2026-05-23 - 2BJT PPA maxrun command replay

- Problem: The active workflow requested a current source-of-truth read, 2BJT runner structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only workflow without hand-editing topology, runner code, or netlists. Fresh process outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches.
- Next: Keep this row as the current 2BJT PPA switch candidate; further tuning should improve AC nRMSE or add far-rolloff margin only if it preserves the 170.690 uW power and 8.308739e7 p area reductions versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun repeat verification

- Problem: The master workflow requested another source-of-truth read, 2BJT-only structure check, fresh PPA sweep, bjt2 log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT PPA workflow without hand-editing topology, runner code, or netlists. The sweep refreshed 2BJT outputs and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; only run another tuning pass if it improves AC nRMSE or far-rolloff margin while preserving the material area and power reduction.

## 2026-05-23 - 2BJT PPA maxrun verification repeat

- Problem: The maxrun workflow requested another source-of-truth read, 2BJT-only runner structure check, fresh PPA sweep, bjt2 log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without hand-editing topology, runner code, or netlists. The sweep refreshed 2BJT outputs and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; only pursue another tuning pass if it improves AC nRMSE or far-rolloff margin while preserving the large area and power advantage.

## 2026-05-23 - 2BJT PPA maxrun source workflow rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, bjt2 log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without topology, runner, or hand-authored netlist edits. The sweep regenerated only 2BJT outputs and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; further tuning should target AC nRMSE or extra far-rolloff margin only if it preserves the material area and power advantage.

## 2026-05-23 - 2BJT PPA maxrun accepted-candidate rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, bjt2 log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT PPA workflow without hand-editing topology, runner, or netlists. The sweep regenerated only 2BJT outputs and used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches; `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; only run further tuning for AC nRMSE or far-rolloff margin if it preserves the large area and power advantage.

## 2026-05-23 - 2BJT PPA maxrun table-confirmed rerun

- Problem: The active master workflow requested another fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT artifacts/tables through the existing fallback output directories where canonical CSV/raw/plot directories were not writable.
- Verification: Structure check passed. The sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or add far-rolloff margin without sacrificing the material area/power reduction.

## 2026-05-23 - 2BJT PPA maxrun fresh verification

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep, log scan, and direct PPA comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no hand-authored runner, topology, or netlist edits were needed. The run regenerated 2BJT artifacts and again wrote csv/raw/plot outputs to `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches; `bjt2_vs_bjt3_comparison.csv` shows `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; only tune AC nRMSE or far-rolloff margin if the material area and power gains remain intact.

## 2026-05-23 - 2BJT PPA maxrun verification rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT structure validation, PPA sweep, bjt2 log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, topology, or hand-authored netlist edits were needed. The sweep regenerated 2BJT artifacts and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches, and `bjt2_vs_bjt3_comparison.csv` shows `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; only tune AC nRMSE or far-rolloff margin if the large area/power advantage is preserved.

## 2026-05-23 - 2BJT PPA maxrun master workflow rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep, simulator log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no hand-authored topology, runner, or netlist edits were needed. The run regenerated 2BJT artifacts and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` exited `0`. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested BJT2 log scan returned no matches, and `bjt2_vs_bjt3_comparison.csv` shows `-170.689875 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this 2BJT row as the active PPA switch candidate; only tune AC nRMSE or far-rolloff margin if the large area/power advantage is preserved.

## 2026-05-23 - 2BJT PPA maxrun assignment-gated rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only structure guard, PPA sweep, log scan, and assignment-aware comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT PPA runner at `--parallel 4`; no topology, runner, or hand-authored netlist edits were needed. The run regenerated only 2BJT sweep artifacts and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this 2BJT row as the active PPA switch candidate; the next focused action is optional AC nRMSE or far-rolloff margin tuning only if it preserves the large area and power gains versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun source-truth rerun

- Problem: The active workflow requested another source-of-truth read, 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, topology, or netlist edits were needed. Fresh generated data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; further tuning should only target AC nRMSE or far-rolloff margin if it preserves the material area/power advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun reproducibility check

- Problem: The active workflow needed a fresh reproducibility pass for the accepted 2BJT PPA candidate against the preserved 3BJT fallback.
- Change: Reran the 2BJT runner structure guard and the full `run_bjt2_ppa_sweep.mjs --parallel 4` sweep; no topology or runner edits were needed.
- Verification: Structure check passed; sweep exited `0` and reselected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `39.7601021 dB` midgain, `12.56994968 Hz` lower cutoff, `20409.38025254 Hz` upper cutoff, `-80.5594 dB/dec` far rolloff, `65.172 uW` power, and `1.820824e8 p` area. The bjt2 log scan returned no matches.
- Next: Keep this 2BJT row as the active PPA switch candidate; further work should only tune AC nRMSE or rolloff margin if the area/power gains remain intact.

## 2026-05-23 - 2BJT PPA maxrun live verification

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure validation, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the declared 2BJT structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, netlist, or topology edits were needed. Fresh outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches.
- Next: Keep the accepted 2BJT row as the active PPA switch candidate; any next tuning should improve AC nRMSE or far-rolloff margin without giving back the large area/power advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun Seoul verification

- Problem: The master workflow requested a current source-of-truth pass, 2BJT structure check, PPA sweep, simulator log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, netlist, or topology edits were needed. Fresh run data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; additional tuning should target AC nRMSE or far-rolloff margin only if it preserves the material area/power advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun command verification

- Problem: The master workflow requested a fresh source-of-truth pass, 2BJT runner structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, netlist, or topology edits were needed. Fresh csv/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; further tuning should target AC nRMSE or far-rolloff margin only if it preserves the material area/power reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun repeat verification

- Problem: The master workflow requested another source-of-truth pass, 2BJT runner structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner, netlist, or topology edits were needed. Fresh artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; further tuning should improve AC nRMSE or far-rolloff margin only if it preserves the large area/power advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun workflow refresh

- Problem: The active workflow requested a fresh source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`; no runner or netlist edits were needed. Fresh generated data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; further tuning should focus on AC nRMSE or far-rolloff margin only if it preserves the material area/power reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun verification refresh

- Problem: The active master workflow requested another source-of-truth read, 2BJT-only runner structure check, sweep rerun, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner or netlist edits were needed. The run regenerated only 2BJT artifacts/tables and again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; further tuning should focus on AC nRMSE or far-rolloff margin only if it preserves the large area/power reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun command refresh

- Problem: The master workflow requested another current-source read, 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner or netlist edits were needed. Fresh generated data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; next useful tuning should improve AC nRMSE or far-rolloff margin without giving back the material area/power advantage.

## 2026-05-23 - 2BJT PPA maxrun latest refresh

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only structure validation, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner or netlist edits were needed. Fresh generated data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; next useful tuning should improve AC nRMSE or far-rolloff margin without giving back the material area/power advantage.

## 2026-05-23 - 2BJT PPA workflow rerun

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT structure guard, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`; no runner or netlist edits were needed. Fresh generated data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; next useful tuning should improve AC nRMSE or far-rolloff margin without giving back the material area/power advantage.

## 2026-05-23 - 2BJT PPA maxrun validation refresh

- Problem: The master workflow requested another source-of-truth read, 2BJT structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`; no netlist or runner edits were needed.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; next useful work is improving AC nRMSE or far-rolloff margin without losing the area/power advantage.

## 2026-05-23 - 2BJT PPA source workflow verification

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only runner structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT summary/comparison artifacts. The runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; next tuning should focus on AC nRMSE or far-rolloff margin without giving back the large area/power savings versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow rerun

- Problem: The active master workflow requested a fresh maxrun-style pass from source-of-truth docs through 2BJT runner validation, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the existing 2BJT-only structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing the current 2BJT summary/comparison artifacts while avoiding regeneration of retired `bjt3_*` sweep outputs. Fresh csv/raw/plot outputs again fell back to `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested BJT2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should frame it as a material area/power improvement with weaker AC nRMSE and tighter far-rolloff margin than `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun confirmation

- Problem: The master workflow requested another verification pass from source-of-truth docs through 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the existing 2BJT structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing the current 2BJT summary/comparison tables without regenerating old `bjt3_*` sweep artifacts. Fresh csv/raw/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the material area/power win while disclosing weaker AC nRMSE and tight far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun current verification

- Problem: The current master workflow requested another source-of-truth read, 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT-generated netlists/results/tables. Fresh csv/raw/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the large power/area reduction while disclosing weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun rerun check

- Problem: The current master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT structure guard and `--parallel 4` PPA sweep, refreshing the current 2BJT netlists/results/tables without regenerating old `bjt3_*` sweep artifacts. Fresh csv/raw/plot outputs again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested bjt2 log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; report the material power/area win while disclosing weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun repeat verification

- Problem: The active workflow requested another source-of-truth read, 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT structure guard and PPA sweep at `--parallel 4`, refreshing current 2BJT generated tables/artifacts while avoiding regeneration of old `bjt3_*` sweep artifacts; fresh csv/raw/plot outputs again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the material area/power improvement while disclosing weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun verification

- Problem: The active workflow requested another source-of-truth read, 2BJT-only structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT structure guard and PPA sweep at `--parallel 4`, refreshing current 2BJT netlists/results/tables while avoiding regeneration of `bjt3_*` sweep artifacts; fresh csv/raw/plot outputs again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the material area/power improvement while disclosing weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun rerun

- Problem: The active workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, refreshing generated 2BJT summaries/artifacts without regenerating 3BJT sweep artifacts; fresh csv/raw/plot outputs again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the material power/area win while disclosing weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun confirmation

- Problem: The active workflow requested another current source read, 2BJT structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, refreshing 2BJT summaries/artifacts while preserving the 3BJT final comparison source; fresh csv/raw/plot outputs again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the power/area win while disclosing weaker AC nRMSE and the tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun recheck

- Problem: The active workflow needed another current-source read, 2BJT-only structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT structure guard and PPA sweep at `--parallel 4`, refreshing generated 2BJT summaries/artifacts while preserving the 3BJT final comparison source; the runner again used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; present the power/area gain and disclose the weaker AC nRMSE plus tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun reproduction

- Problem: The active maxrun workflow needed a current source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT structure guard and PPA sweep at `--parallel 4`, refreshing the generated 2BJT tables/artifacts while preserving the 3BJT comparison source and using `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical result directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; report the material power/area win and disclose the weaker AC nRMSE plus narrower far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun workflow refresh

- Problem: The active maxrun workflow requested a current source-of-truth read, 2BJT structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, refreshing the generated 2BJT summary/comparison tables and using `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical output directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested log scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate and report the area/power win with the weaker AC nRMSE and narrower far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun current pass

- Problem: The active workflow requested a fresh 2BJT-only structure check, PPA sweep, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT runner and refreshed current 2BJT numeric tables/artifacts while leaving `bjt3_final_candidate_comparison.csv` as the only referenced 3BJT result artifact.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested log scan returned no matches; fresh raw data used `csv_tmp`/`raw_tmp`/`plots_tmp` because canonical directories were not writable.
- Next: Keep this row as the active 2BJT PPA switch candidate and report the lower area/power alongside weaker AC nRMSE and narrower far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source-prompt rerun

- Problem: The active maxrun source prompt requested a fresh source-of-truth read, 2BJT structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, refreshing current 2BJT tables and fallback `csv_tmp`/`raw_tmp`/`plots_tmp` artifacts while preserving the 3BJT comparison table.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; report the lower area/power and disclose the weaker AC nRMSE and narrower far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun source-prompt pass

- Problem: The active source prompt requested a fresh source-of-truth read, 2BJT structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the 2BJT-only runner at `--parallel 4`, regenerating current 2BJT netlists/results/tables and using `csv_tmp`/`raw_tmp`/`plots_tmp` where canonical result directories were locked.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should state the area/power win and the weaker AC nRMSE/far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA workflow rerun

- Problem: The active maxrun source prompt requested another source-of-truth read, 2BJT structure check, PPA sweep, log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, regenerating current 2BJT tables and fallback CSV/raw/plot artifacts without regenerating deleted `bjt3_*` sweep artifacts.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final reporting should emphasize the lower power/area and disclose the weaker AC nRMSE and far-rolloff margin versus the 3BJT fallback.

## 2026-05-23 - 2BJT workflow source-prompt rerun

- Problem: The active workflow prompt requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT-only structure test and PPA sweep at `--parallel 4`, regenerating current 2BJT numeric tables and fallback CSV/raw/plot artifacts without regenerating deleted `bjt3_*` sweep files.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this 2BJT row as the current PPA switch candidate; present the tradeoff as materially lower power/area than `bjt3_sweep_hfbuf_r10k_c150p` with weaker AC nRMSE and less far-rolloff margin.

## 2026-05-23 - 2BJT maxrun rerun from workflow prompt

- Problem: The active maxrun workflow requested a fresh verification of the 2BJT PPA experiment against the preserved 3BJT comparison source.
- Change: Reran the 2BJT runner structure check and full PPA sweep at `--parallel 4`, regenerating only `bjt2_*` numeric artifacts/tables with local `csv_tmp`/`raw_tmp`/`plots_tmp` fallbacks for locked canonical result directories.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this 2BJT row as the active PPA switch candidate; final reporting should cite the artifact-directory fallback note and the weaker AC nRMSE/far-rolloff margin versus the 3BJT fallback.

## 2026-05-23 - 2BJT PPA maxrun verification

- Problem: The active 2BJT PPA branch needed a fresh maxrun verification from the current worktree before reporting the switch candidate against the preserved 3BJT fallback.
- Change: Reran the 2BJT runner structure check and full PPA sweep at `--parallel 4`; the sweep regenerated only 2BJT artifacts and reused the local `csv_tmp`/`raw_tmp`/`plots_tmp` write fallbacks.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this 2BJT row as the active PPA switch candidate; final packaging should explicitly mention the local artifact-directory permission fallback.

## 2026-05-23 - 2BJT accepted sweep verification refresh

- Problem: The active 2BJT PPA candidate needed a fresh verification pass from the current runner and generated tables before final reporting.
- Change: Reran the 2BJT structure guard and PPA sweep at `--parallel 4`, regenerating only 2BJT netlists/results/tables with canonical CSV/raw/plot write fallbacks.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. The requested `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` scan returned no matches.
- Next: Keep this row as the active 2BJT PPA switch candidate; final packaging should cite the `csv_tmp`/`raw_tmp`/`plots_tmp` fallback note if local directory permissions remain locked.

## 2026-05-23 - 2BJT accepted sweep current rerun

- Problem: The accepted 2BJT PPA candidate needed a current maxrun rerun and log/table verification against the preserved 3BJT fallback comparison.
- Change: Ran the 2BJT structure guard and full PPA sweep at `--parallel 4`, regenerating 2BJT summary, performance, area, power, and comparison tables while leaving 3BJT artifacts untouched except the preserved comparison source.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. Numeric raw/CSV writes used `raw_tmp`/`csv_tmp`; selected AC plot overwrite was skipped by `EPERM`.
- Next: Keep the 2BJT candidate as the active PPA switch row and either fix plot-directory permissions or document the numeric-table-backed plot caveat for packaging.

## 2026-05-23 - 2BJT accepted candidate verification rerun

- Problem: The current 2BJT switch candidate needed a fresh maxrun verification after the finite-FT OPAMP and writable `csv_tmp`/`raw_tmp` fallback changes.
- Change: Reran the structure guard and 2BJT PPA sweep, regenerating current 2BJT numeric tables/logs/netlists while preserving the 3BJT comparison table as the only `bjt3_*` result artifact.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. Plot overwrite still reported `EPERM`, so fresh numeric CSV/raw artifacts were written through `csv_tmp`/`raw_tmp`.
- Next: Keep this as the current 2BJT PPA switch candidate and decide whether to document the plot-permission caveat or resolve local permissions before final presentation packaging.

## 2026-05-23 - 2BJT finite-FT OPAMP accepted sweep

- Problem: The 2BJT sweep was using an unlimited-bandwidth ideal follower, leaving only four effective high-frequency poles and missing the far `-80 dB/dec` proxy. The canonical `results/ngspice/csv` and `results/ngspice/raw` directories also denied process writes, which could silently leave stale CSV/raw data behind.
- Change: Updated `maxrun/run_bjt2_ppa_sweep.mjs` to model `OPAMP_FT` as a real follower pole, added 250 kHz OPAMP-FT 2BJT candidates, tightened the acceptance gate to `<= -80 dB/dec`, added writable `csv_tmp`/`raw_tmp` fallback directories, and expanded structure checks/log scanning for permission failures. Updated `2stage-bjt.md` with the accepted candidate.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. Standard and permission log scans over `results\ngspice\logs\bjt2*.log` returned no matches after stale probe cleanup.
- Next: Treat this as the current 2BJT switch candidate, then review presentation risk from the higher AC nRMSE and the local `csv_tmp`/`raw_tmp` permission workaround before final packaging.

## 2026-05-23 - 2BJT PPA sweep rerun

- Problem: The required 2BJT sweep command failed after numerical deliverables because this workspace denied overwriting the selected AC plot PNG in `results/ngspice/plots`; the current 2BJT result also remained a best-effort candidate rather than a gate-passing switch candidate.
- Change: Added structure coverage for plot permission handling and changed `maxrun/run_bjt2_ppa_sweep.mjs` so final plot writes are best-effort after CSV/table deliverables are written. Reran the 2BJT PPA sweep.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re4p7k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft2m` with `midgain=38.3076309 dB`, `fL=11.95168399 Hz`, `fH=19427.61799 Hz`, `100k-1Meg=-71.0547006 dB/dec`, `power=125.242 uW`, and `area=1.821021e8 p`. Log scan over `results\ngspice\logs\bjt2*.log` returned no matches. Plot overwrite still reported an explicit `EPERM` warning in this sandbox.
- Next: Keep the 3BJT fallback for now; tune the 2BJT candidate family toward stronger far high-frequency rolloff and `fH >= 20 kHz` before considering a switch.

## 2026-05-23 - 2BJT maxrun conversion

- Problem: The worktree still had 3BJT-centered workflow text and many stale `bjt3_*` raw/csv/log/netlist artifacts, while the branch goal is a 2BJT PPA sweep.
- Change: Replaced the active design/workflow docs with 2BJT instructions, added `maxrun/run_bjt2_ppa_sweep.mjs`, added a structure test, and fixed `netlists/bjt2_op.spice` to write into this worktree.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\test_parallel_sweep_runners.mjs` passed. `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` generated bjt2 netlists/results/tables/plots; log scan over `results\ngspice\logs\bjt2*.log` returned no matches. Stale `bjt3_*` artifacts were removed except `results/ngspice/tables/bjt3_final_candidate_comparison.csv`.
- Next: Tune 2BJT gain/rolloff trade-off from the current best-effort candidate: `bjt2_sweep_ppa_rc120k_re4p7k_rb4p7m_c68n_cout10n_ch30p_r10k_c220p_ft2m`.

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

## 2026-05-23 - 2BJT PPA sweep verification rerun

- Problem: The 2BJT branch needed a fresh runner structure check and PPA sweep rerun against the preserved 3BJT fallback comparison.
- Change: Ran the 2BJT-only structure test and reran `run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating summary/comparison tables from fresh fallback raw-data directories where canonical CSV/raw writes were denied.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; bjt2 log scan returned no fatal/error/singular/unknown matches.
- Next: Use `bjt2_vs_bjt3_comparison.csv` as the current decision table and prepare the PPA story around materially lower 2BJT power/area with weaker AC nRMSE and smaller rolloff margin than the 3BJT fallback.

## 2026-05-23 - 2BJT PPA verification repeat

- Problem: The accepted 2BJT PPA result needed another current maxrun verification pass against the preserved 3BJT fallback table.
- Change: Reran the 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`; regenerated 2BJT summary/comparison tables from the existing 2BJT sweep set.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` again selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; bjt2 log scan returned no forbidden matches. Plot writing for the selected AC PNG was skipped by `EPERM` in `results/ngspice/plots`.
- Next: Keep the accepted 2BJT candidate as the current PPA decision row and either resolve plot-directory permissions or proceed with the table-backed PPA comparison story.

## 2026-05-23 - 2BJT plot fallback verification

- Problem: The accepted 2BJT sweep regenerated numeric deliverables but could not write selected-candidate PNG plots into locked `results/ngspice/plots`.
- Change: Added a `plots_tmp` fallback to the 2BJT PPA runner and extended the runner structure check to require the plot fallback path, then reran the 2BJT sweep.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; selected AC/transient PNGs were written to `results/ngspice/plots_tmp`; bjt2 log scan returned no forbidden matches.
- Next: Use the 2BJT comparison table and fallback plot PNGs for the current PPA story; if another maxrun tunes further, focus on improving AC nRMSE or high-frequency rolloff margin without giving back the large power/area savings.

## 2026-05-23 - 2BJT PPA workflow rerun

- Problem: The active 2BJT PPA workflow requested a fresh source-of-truth read, runner structure check, sweep rerun, log scan, and decision update against the preserved 3BJT fallback.
- Change: Reran the 2BJT-only structure test and `run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating 2BJT netlists, fallback CSV/raw/plot outputs, and summary/comparison tables without regenerating 3BJT sweep artifacts.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; `Select-String .\results\ngspice\logs\bjt2*.log` found no forbidden matches.
- Next: Treat the 2BJT candidate as the current PPA decision row, while presenting the tradeoff clearly: much lower power/area than `bjt3_sweep_hfbuf_r10k_c150p`, but weaker AC nRMSE and less far-rolloff margin.

## 2026-05-23 - 2BJT PPA accepted-row refresh

- Problem: The current maxrun prompt requested another source-of-truth read, 2BJT-only runner check, sweep rerun, log scan, and direct comparison against the preserved `bjt3_sweep_hfbuf_r10k_c150p` fallback.
- Change: Reran the 2BJT PPA sweep without touching or regenerating 3BJT sweep artifacts; fresh numeric artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; `Select-String .\results\ngspice\logs\bjt2*.log` found no forbidden matches.
- Next: Keep the accepted 2BJT row as the current PPA decision candidate unless a later tuning pass can improve AC nRMSE or far-rolloff margin without losing the 72.37% power and 31.33% area reductions versus the 3BJT fallback.

## 2026-05-23 - 2BJT PPA workflow confirmation

- Problem: The active maxrun workflow requested a fresh source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and comparison-table review.
- Change: Reran the 2BJT-only structure test and `run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating the 2BJT summary/comparison tables from fresh fallback artifact directories without regenerating 3BJT sweep artifacts.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; the bjt2 log scan found no fatal/error/singular/unknown matches.
- Next: Preserve this row as the current 2BJT PPA candidate and use `bjt2_vs_bjt3_comparison.csv` to explain the lower power/area tradeoff against weaker AC nRMSE and smaller far-rolloff margin.

## 2026-05-23 - 2BJT PPA maxrun refresh

- Problem: The active workflow required another current read/check/sweep cycle for the 2BJT PPA branch against the preserved 3BJT fallback comparison.
- Change: Reran the 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating only 2BJT netlists/results and refreshed summary/comparison tables through the fallback artifact directories.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with 39.7601021 dB gain, 12.56994968 Hz lower cutoff, 20409.38025254 Hz upper cutoff, -80.5594 dB/dec far rolloff, 65.172 uW worst power, and 1.820824e8 p area; `Select-String .\results\ngspice\logs\bjt2*.log` returned no forbidden matches, and selected AC/transient plots were present in `results/ngspice/plots_tmp`.
- Next: Keep the accepted 2BJT row as the current PPA candidate; if more tuning is requested, focus on AC nRMSE and far-rolloff margin without sacrificing the large power/area savings.

## 2026-05-23 - 2BJT PPA workflow maxrun

- Problem: The active maxrun source prompt requested a fresh source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran the 2BJT-only structure guard and PPA sweep at `--parallel 4`, regenerating only 2BJT netlists/results/tables through the existing fallback artifact directories where canonical directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`. `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this 2BJT row as the current PPA switch candidate; present the lower power/area against weaker AC nRMSE and narrower far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source-prompt rerun

- Problem: The active master workflow requested a current source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison with the preserved 3BJT fallback table.
- Change: Reran the 2BJT runner structure guard and `run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating only 2BJT netlists/results/tables. Fresh CSV/raw/plot data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA candidate; next tuning should target AC nRMSE or far-rolloff margin without giving back the large area/power savings versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow rerun

- Problem: The maxrun master workflow requested another fresh source-of-truth read, 2BJT-only structure check, sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, regenerating only 2BJT netlists/results/tables through the existing fallback artifact directories.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and the accepted AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this 2BJT row as the current PPA switch candidate; present the large power/area reduction versus `bjt3_sweep_hfbuf_r10k_c150p` while noting weaker AC nRMSE and smaller far-rolloff margin.

## 2026-05-23 - 2BJT PPA maxrun source workflow

- Problem: The active maxrun source prompt requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and comparison-table review without regenerating 3BJT sweep artifacts.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA candidate and use `bjt2_vs_bjt3_comparison.csv` to present the power/area reduction against weaker AC nRMSE and smaller far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow verification

- Problem: The active workflow requested a fresh 2BJT-only verification cycle against the preserved 3BJT fallback comparison table.
- Change: Reran the 2BJT runner structure check and `run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. Fresh raw data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches.
- Next: Keep the accepted 2BJT row as the current PPA candidate; any further tuning should target AC nRMSE and rolloff margin without losing the large area/power reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source workflow confirmation

- Problem: The maxrun source prompt requested another current read/check/sweep cycle for the 2BJT branch without regenerating deleted 3BJT sweep artifacts.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists, fallback CSV/raw/plot artifacts, and summary/comparison tables.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate and use `bjt2_vs_bjt3_comparison.csv` for the final area/power tradeoff story versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow refresh

- Problem: The current master workflow requested a fresh source-of-truth read, 2BJT structure check, PPA sweep rerun, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables and using the existing `csv_tmp`, `raw_tmp`, and `plots_tmp` fallback directories where canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep the 2BJT accepted row as the current PPA candidate; present the 72.37% power and 31.33% area reductions versus `bjt3_sweep_hfbuf_r10k_c150p` while noting weaker AC nRMSE and smaller far-rolloff margin.

## 2026-05-23 - 2BJT PPA workflow validation rerun

- Problem: The master workflow requested another current source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. Fresh CSV/raw/plot data again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; use `bjt2_vs_bjt3_comparison.csv` to frame the material area/power improvement against weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun master cycle

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved `bjt3_sweep_hfbuf_r10k_c150p` fallback.
- Change: Reran the declared 2BJT workflow commands and refreshed only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: `node .\maxrun\test_bjt2_runner_structure.mjs` passed; `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4` exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this 2BJT row as the current PPA candidate; any next tuning pass should target AC nRMSE and far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus the 3BJT fallback.

## 2026-05-23 - 2BJT PPA master workflow rerun

- Problem: The source workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and comparison against the preserved 3BJT final candidate table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; frame the result as a material area/power improvement with weaker AC nRMSE and tighter far-rolloff margin versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow current run

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved `bjt3_final_candidate_comparison.csv` table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables and using `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` where canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.
## 2026-05-23 - 2BJT PPA maxrun validation

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables through the existing `csv_tmp`, `raw_tmp`, and `plots_tmp` fallback directories where canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches.
- Next: Keep this 2BJT row as the current PPA switch candidate; further tuning should target AC nRMSE and far-rolloff margin without losing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA workflow rerun confirmation

- Problem: The active source workflow requested another current source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT final candidate table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables and using `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` where canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and again selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun active workflow

- Problem: The active workflow requested a fresh source-of-truth read, structure check, 2BJT-only PPA sweep, log scan, and comparison against the preserved 3BJT final table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. The runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and the selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or far-rolloff margin without losing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun current validation

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT final candidate table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches, and the selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source workflow cycle

- Problem: The master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep the accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or add far-rolloff margin without losing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun verification refresh

- Problem: The active workflow requested another fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; the runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should focus on AC nRMSE and extra far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source workflow verification

- Problem: The current source workflow requested another fresh source-of-truth read, structure check, 2BJT-only PPA sweep, log scan, and direct comparison against the preserved 3BJT final candidate table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT artifacts and tables through the existing `csv_tmp`, `raw_tmp`, and `plots_tmp` fallback directories where canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or add far-rolloff margin without sacrificing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.
## 2026-05-23 - 2BJT PPA master workflow rerun

- Problem: The active maxrun workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables and using `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` where canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should target AC nRMSE or extra far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun source workflow refresh

- Problem: The active source workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. The runner again wrote fresh CSV/raw/plot artifacts through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should improve AC nRMSE or add far-rolloff margin without losing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun validation refresh

- Problem: The active master workflow requested a current source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved `bjt3_sweep_hfbuf_r10k_c150p` fallback.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; the runner again wrote fresh CSV/raw/plot artifacts through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; the sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun repeat verification

- Problem: The active master workflow requested another source-of-truth read, 2BJT runner structure check, PPA sweep rerun, log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables through the existing fallback `csv_tmp`, `raw_tmp`, and `plots_tmp` directories where canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should improve AC nRMSE or add far-rolloff margin without sacrificing the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA maxrun current cycle

- Problem: The active workflow requested a fresh source-of-truth read, 2BJT runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should focus on AC nRMSE or additional far-rolloff margin without giving back the 170.690 uW power reduction and 8.308739e7 p area reduction versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA master workflow latest rerun

- Problem: The active master workflow requested a current source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh CSV/raw/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; any next pass should improve AC nRMSE or add far-rolloff margin without sacrificing the power/area advantage versus the 3BJT fallback.

## 2026-05-23 - 2BJT PPA maxrun confirmation

- Problem: The current source workflow requested another source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and preserved 3BJT fallback comparison.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables; fresh raw CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the bjt2 log scan returned no `can't find`, `unknown`, `fatal`, `singular`, `error`, or `failed` matches.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin without giving back the `-170.690 uW` power and `-8.308739e7 p` area advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA workflow rerun

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved `bjt3_final_candidate_comparison.csv`.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. The runner again wrote fresh CSV/RAW/plot artifacts through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and the selected AC/transient PNGs exist in `results/ngspice/plots_tmp`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should improve AC nRMSE or add far-rolloff margin without sacrificing the `-170.690 uW` power and `-8.308739e7 p` area advantage versus `bjt3_sweep_hfbuf_r10k_c150p`.

## 2026-05-23 - 2BJT PPA source workflow verification

- Problem: The current maxrun source workflow requested a source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. Fresh CSV/RAW/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` still reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin without giving back the power/area advantage.
## 2026-05-23 - 2BJT PPA maxrun handoff verification

- Problem: The active master workflow requested a source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved `bjt3_final_candidate_comparison.csv`.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT netlists/results/tables. Fresh CSV/RAW/plot artifacts again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin without giving back the power/area advantage.

## 2026-05-23 - 2BJT PPA maxrun source workflow current run

- Problem: The active maxrun workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and preserved 3BJT fallback comparison.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated netlists/results/tables. The runner again wrote fresh CSV/raw/plot artifacts through `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the far-rolloff pass margin is only about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun current API rerun

- Problem: The active maxrun source workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. The runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin without giving back the power/area advantage.

## 2026-05-23 - 2BJT PPA maxrun API cycle

- Problem: The active source workflow requested a fresh source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, log scan, and direct comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary tables. The runner again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; `Select-String .\results\ngspice\logs\bjt2*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin without giving back the power/area advantage.

## 2026-05-23 - 2BJT PPA master workflow repeat run

- Problem: The current source workflow requested another fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved 3BJT fallback.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. Fresh CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin while preserving the material power/area advantage.

## 2026-05-23 - 2BJT PPA maxrun master workflow run

- Problem: The active master workflow requested a fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved `bjt3_final_candidate_comparison.csv`.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. Fresh CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches, and selected AC/transient PNGs exist in `results/ngspice/plots_tmp`. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin while preserving the material power/area advantage.
## 2026-05-23 - 2BJT PPA maxrun master workflow API verification

- Problem: The active source workflow requested another source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, simulator log scan, and direct comparison against the preserved `bjt3_final_candidate_comparison.csv`.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. Fresh CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or extra far-rolloff margin while preserving the material power/area advantage.

## 2026-05-23 - 2BJT PPA current workflow API confirmation

- Problem: The current source workflow requested another fresh source-of-truth read, 2BJT-only structure check, PPA sweep rerun, simulator log scan, and preserved 3BJT fallback comparison.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. Fresh CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.

## 2026-05-23 - 2BJT PPA maxrun workflow refresh

- Problem: The active master workflow requested another source-of-truth read, 2BJT-only runner structure check, PPA sweep rerun, simulator log scan, and comparison against the preserved 3BJT fallback table.
- Change: Reran `node .\maxrun\test_bjt2_runner_structure.mjs` and `node .\maxrun\run_bjt2_ppa_sweep.mjs --parallel 4`, refreshing only 2BJT generated artifacts and summary/comparison tables. Fresh CSV/RAW/plot outputs again used `results/ngspice/csv_tmp`, `results/ngspice/raw_tmp`, and `results/ngspice/plots_tmp` because the canonical artifact directories were not writable.
- Verification: Structure check passed; sweep exited `0` and selected `bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k` as accepted with `midgain=39.7601021 dB`, `fL=12.56994968 Hz`, `fH=20409.38025254 Hz`, `100k-1Meg=-80.5594 dB/dec`, `AC nRMSE=0.136319434501`, `tran nRMSE=0.023733677809`, `power=65.172 uW`, and `area=1.820824e8 p`; the requested bjt2 log scan returned no matches, and `rg --files .\netlists .\results\ngspice | Select-String -Pattern "bjt3_"` returned only `results/ngspice/tables/bjt3_final_candidate_comparison.csv` and `results/ngspice/tables/bjt2_vs_bjt3_comparison.csv`. `bjt2_vs_bjt3_comparison.csv` reports `-170.690 uW` power and `-8.308739e7 p` area versus `bjt3_sweep_hfbuf_r10k_c150p`.
- Next: Keep this accepted 2BJT row as the current PPA switch candidate; next tuning should target AC nRMSE or additional far-rolloff margin because the current far-rolloff pass margin is about `0.559 dB/dec`.
