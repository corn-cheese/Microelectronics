# Change Log

Context-trimmed decision log. The full previous log is preserved in
`change_archive.md`. Use `results/ngspice/tables/bjt2_autotopo_run_index.csv`
as the source-of-truth run memory for autotopo score history.

## Current Autotopo State

- Current best: run_008 `collector_emitter_operating_point_rebalance`
- Best version: `bjt2_autotopo_ceopr_rc125k_re4p05k_rb4p7m_c68n_cout10n_ch27p_r11k_c180p_ft175k`
- Best score: `3.83078704`
- Decision: keep run_008 as the current relaxed-score 2BJT autotopo candidate.
- Latest run: run_009 `low_frequency_rolloff_pressure`
- Latest decision: keep searching.
- Reason: run_009 applied explicit low-frequency rolloff score pressure, but
  the best candidate did not materially improve the LF shape, raised total
  relaxed score versus run_008, worsened transient fit, and dropped the upper
  cutoff below 20 kHz.
- Next: keep run_008 as handoff; abandon stronger LF-pressure on the existing
  coupling poles unless a later family also restores bandwidth and total score.

## Run Index Summary

- run_001 `existing_pole_rebalance`: score `4.00052558`, decision `promote`.
- run_002 `interstage_low_frequency_shaping`: score `6.41780256`, decision
  `keep_searching`, delta versus prior best `+2.41727698`.
- run_003 `area_aware_output_split`: score `4.97462927`, decision
  `keep_searching`, delta versus prior best `+0.97410369`.
- run_004 `limited_emitter_bypass_shaping`: score `4.07259449`, decision
  `keep_searching`, delta versus prior best `+0.07206891`.
- run_005 `hf_margin_power_retune`: score `3.92247612`, decision `promote`,
  delta versus prior best `-0.07804946`.
- run_006 `hf_margin_robustness_retune`: score `3.89510249`, decision
  `promote`, delta versus prior best `-0.02737363`.
- run_007 `bias_coupling_area_rebalance`: score `4.51797584`, decision
  `keep_searching`, delta versus prior best `+0.62287335`.
- run_008 `collector_emitter_operating_point_rebalance`: score `3.83078704`,
  decision `promote`, delta versus prior best `-0.06431545`.
- run_009 `low_frequency_rolloff_pressure`: score `4.05260891`, decision
  `keep_searching`, delta versus prior best `+0.22182187`.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 9

- Hypothesis: Stronger score pressure toward low-frequency rolloff may improve assignment alignment while keeping the run-8 operating point and relaxed PPA competitive.
- Change: Ran family `low_frequency_rolloff_pressure` with `LF_SLOPE_PRESSURE_TARGET=60`, fixed `RC=125k`, `RE=4.05k`, `RB_TOP=4.7Meg`, `RB_BOT=1Meg`, `CBUF=180p`, `OPAMP_FT=175k`, `RBUF=11k`, and swept existing `CIN`, `C12`, `COUT`, and `CH`.
- Candidates: 95 variants from `CIN={33n,47n,56n,68n}`, `C12={33n,47n,56n,68n}`, `COUT={4.7n,6.8n,10n}`, and `CH={27p,28p}`, with the exact run-8 circuit omitted.
- Best: `bjt2_autotopo_lfrp_rc125k_re4p05k_rb4p7m_cin68n_c12_68n_cout10n_ch28p_r11k_c180p_ft175k`, score `4.05260891`, `1 Hz-10 Hz=40.8018 dB/dec`, `10 Hz relative=-4.292022 dB`, `AC nRMSE=0.125264267787`, `tran nRMSE=0.023872855178`, `power=62.313936 uW`, `area=1.820006e8 p`.
- Compared against:
  - accepted 2BJT: AC nRMSE improves by `0.011055166714`, power drops by `2.858497 uW`, area drops by about `81758.5 p`, and far-HF slope gains about `3.1309 dB/dec`; transient nRMSE worsens by `0.000139177369`, and upper cutoff drops by about `571.522 Hz` to `19837.858 Hz`.
  - prior autotopo best: score worsens by `0.22182187`, LF slope and 10 Hz relative gain are effectively unchanged, AC nRMSE improves by `0.001610598622`, transient nRMSE worsens by `0.000440666948`, area worsens by about `2441.5 p`, and upper cutoff drops by about `276.245 Hz`.
  - 3BJT fallback: keeps the 2BJT practical PPA advantage with about `173.548 uW` lower power and `8.316917e7 p` lower area, but AC nRMSE remains worse by `0.019363875743`, upper cutoff is lower by about `900.190 Hz`, and far-rolloff margin is about `3.4839 dB/dec` weaker.
- Decision: keep searching; do not promote because total relaxed PPA score regressed and the LF shape did not improve meaningfully.
- Next: keep run_008 as the handoff candidate; stop this LF-pressure direction unless a new passive family can recover both LF shape and bandwidth without score regression.
- Rerun: 2026-05-23 API pass at `2026-05-23T01:21:44.886Z` reproduced this run_009 result exactly with a clean autotopo log scan.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 8

- Hypothesis: Rebalance the existing collector-load and emitter-degeneration operating point around the run-6 HF/power network to test whether transient fit or PPA can improve without adding passive topology or large capacitors.
- Change: Updated `maxrun/run_bjt2_autotopo_ppa_sweep.mjs` from run 7 bias/coupling area rebalance to family `collector_emitter_operating_point_rebalance`; restored `CIN=C12=68n`, accepted bias dividers, single `COUT=10n` output coupling, run-6 `OPAMP_FT=175k`, and run-6 `CBUF=180p`, while sweeping only existing `RC`, `RE`, `CH`, and `RBUF` values. Updated `maxrun/test_bjt2_runner_structure.mjs` to require the run-8 family, operating-point grid, and exclusion of the exact run-6 best.
- Candidates: 63 variants in family `collector_emitter_operating_point_rebalance`, sweeping `RC={110k,115k,120k,125k}`, `RE={3.6k,3.75k,3.9k,4.05k}`, `CH={26p,27p}`, `RBUF={10k,11k}`, fixed `CBUF=180p`, `CIN=C12=68n`, `COUT=10n`, `RB_TOP=4.7Meg`, `RB_BOT=1Meg`, and `OPAMP_FT=175k`, with exact run-6 best omitted.
- Best: `bjt2_autotopo_ceopr_rc125k_re4p05k_rb4p7m_c68n_cout10n_ch27p_r11k_c180p_ft175k`, score `3.83078704`, `midgain=40.062103 dB`, `fL=12.394501 Hz`, `fH=20114.103925 Hz`, `10 Hz relative=-4.292232 dB`, `20 kHz relative=-2.970249 dB`, `100k-1Meg=-83.5329 dB/dec`, `AC nRMSE=0.126874866409`, `tran nRMSE=0.023432188230`, `power=62.313936 uW`, `area=1.819982e8 p`.
- Compared against:
  - accepted 2BJT: score improves versus the accepted-baseline reference by about `0.18305424`; AC nRMSE improves by `0.009444568092`, transient nRMSE improves by `0.000301489579`, power drops by `2.858497 uW`, area drops by about `8.420067e4 p`, lower cutoff improves by about `0.175448 Hz`, and far HF slope gains about `2.9735 dB/dec` of margin; upper cutoff drops by about `295.276 Hz` but remains above 20 kHz.
  - prior autotopo best: score improves by `0.06431545`, transient nRMSE improves by `0.001334753389`, power drops by `0.233497 uW`, lower cutoff improves by about `0.176357 Hz`, 10 Hz relative gain moves about `0.0997 dB` closer to the desired -3 dB shape, and far HF slope gains about `0.1577 dB/dec` of margin; AC nRMSE worsens by `0.000082158574`, area worsens by about `999.329 p`, and upper cutoff drops by about `276.619 Hz`.
  - 3BJT fallback: keeps practical PPA advantage with about `173.548 uW` lower power and `8.317161e7 p` lower area, and transient nRMSE is better by `0.006322984333`; AC nRMSE remains worse by `0.020974474365`, upper cutoff is lower by about `623.945 Hz`, and far-rolloff margin is about `3.6413 dB/dec` weaker.
- Decision: promote; the family passes relaxed hard gates, improves the prior best score without adding passive complexity, and the small area/upper-cutoff costs are outweighed by better transient fit, slightly better low-frequency placement, lower power, and stronger far-HF slope.
- Next: Review run 8 as the handoff relaxed-PPA 2BJT candidate; further exploration should focus only on low-frequency shape improvements that preserve run-8 transient and power gains.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 7

- Hypothesis: Scale both legs of the base-bias dividers while reducing the two large `CIN/C12` coupling capacitors, to test whether capacitor-area savings can improve relaxed PPA without adding passive topology or losing the run-6 HF margin.
- Change: Updated `maxrun/run_bjt2_autotopo_ppa_sweep.mjs` from run 6 HF robustness retune to family `bias_coupling_area_rebalance`; preserved the accepted 2BJT signal path, single output coupling network, run-6 `OPAMP_FT=175k`, and run-6 output/HF network neighborhood, while sweeping smaller `CIN/C12` values and bias-divider scale. Updated `maxrun/test_bjt2_runner_structure.mjs` to require the run-7 family and area-aware bias/coupling grid.
- Candidates: 64 variants in family `bias_coupling_area_rebalance`, sweeping `CIN=C12={33n,39n,47n,56n}`, base-bias scale `{1.25x,1.5x,2.0x,2.7x}`, `CH={26p,27p}`, `RBUF={10k,11k}`, fixed `CBUF=180p`, `COUT=10n`, `RC=120k`, `RE=3.9k`, and `OPAMP_FT=175k`.
- Best: `bjt2_autotopo_bcr_rc120k_re3p9k_rbscale1p25x_c56n_cout10n_ch27p_r11k_c180p_ft175k`, score `4.51797584`, `midgain=38.469535 dB`, `fL=13.454296 Hz`, `fH=20282.003174 Hz`, `10 Hz relative=-4.890848 dB`, `20 kHz relative=-2.927803 dB`, `100k-1Meg=-83.4921 dB/dec`, `AC nRMSE=0.119025923585`, `tran nRMSE=0.061452954613`, `power=54.076478 uW`, `area=1.529806e8 p`.
- Compared against:
  - accepted 2BJT: area improves by `2.910175e7 p`, power drops by `11.095955 uW`, AC nRMSE improves by `0.017293510916`, and far HF slope gains about `2.9327 dB/dec` of margin; however score is worse than the accepted-baseline reference by about `0.50413456`, transient nRMSE worsens by `0.037719276804`, midgain drops by about `1.2906 dB`, lower cutoff rises by about `0.8843 Hz`, and 10 Hz relative gain moves farther from the desired -3 dB shape.
  - prior autotopo best: score worsens by `0.62287335`, transient nRMSE worsens by `0.036686012994`, midgain drops by about `1.2909 dB`, lower cutoff rises by about `0.8834 Hz`, and upper cutoff drops by about `108.719 Hz`; area improves by `2.901655e7 p`, power drops by `8.470955 uW`, AC nRMSE improves by `0.007766784250`, and far HF slope gains about `0.1169 dB/dec` of margin.
  - 3BJT fallback: keeps practical PPA advantage with about `181.786 uW` lower power and `1.121892e8 p` lower area, but remains worse on AC nRMSE by `0.013125531541`, transient nRMSE by `0.031697782050`, upper cutoff by about `456.046 Hz`, and far-rolloff margin by about `3.6821 dB/dec`.
- Decision: keep searching; the family passes relaxed hard gates and proves capacitor-area reduction is possible, but the score regression versus run 006 is too large and the transient/low-frequency penalties make it a weaker practical PPA candidate.
- Next: Stop and promote run 6 unless a new passive family can improve transient behavior while preserving the run-7 area/power savings.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 6

- Hypothesis: Probe robustness around the run-5 HF/power optimum by fine-retuning the existing collector and post-buffer HF poles while testing whether OPAMP_FT can drop below 200 kHz without losing relaxed hard-gate margin.
- Change: Updated `maxrun/run_bjt2_autotopo_ppa_sweep.mjs` from run 5 broad HF/power retune to family `hf_margin_robustness_retune`; kept the accepted single-output-coupling and unsplit-emitter topology, narrowed the passive HF grid around run 5, added `OPAMP_FT=175k`, and advanced the run index to `run_006`. Updated `maxrun/test_bjt2_runner_structure.mjs` to require the run-6 family and fine-retune grid.
- Candidates: 54 variants in family `hf_margin_robustness_retune`, sweeping `CH={25p,26p,27p}`, `RBUF={8.2k,10k,11k}`, `CBUF={180p,200p,220p}`, and `OPAMP_FT={175k,200k}` at fixed `RC=120k`, `RE=3.9k`, `RB_TOP=4.7Meg`, `RB_BOT=1Meg`, `CIN=C12=68n`, and `COUT=10n`.
- Best: `bjt2_autotopo_hfr_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch27p_r11k_c180p_ft175k`, score `3.89510249`, `midgain=39.760428 dB`, `fL=12.570858 Hz`, `fH=20390.722606 Hz`, `10 Hz relative=-4.391898 dB`, `20 kHz relative=-2.901213 dB`, `100k-1Meg=-83.3752 dB/dec`, `AC nRMSE=0.126792707835`, `tran nRMSE=0.024766941619`, `power=62.547433 uW`, `area=1.819972e8 p`.
- Compared against:
  - accepted 2BJT: score improves versus the accepted-baseline reference; AC nRMSE improves by `0.009526726666`, far HF slope gains about `2.8158 dB/dec` of margin, power drops by `2.625000 uW`, and area drops by `8.524600e4 p`; upper cutoff drops by about `18.658 Hz`, transient nRMSE worsens by `0.001033263810`, and low-frequency shape remains essentially unchanged.
  - prior autotopo best: score improves by `0.02737363`, AC nRMSE improves by `0.003139738181`, far HF slope gains about `1.0382 dB/dec` of margin, power drops by `0.875000 uW`, and area drops by `4.624600e4 p`; upper cutoff drops by about `176.354 Hz`, transient nRMSE worsens by `0.000444555522`, and low-frequency shape remains essentially unchanged.
  - 3BJT fallback: keeps practical PPA advantage with about `173.315 uW` lower power and `8.317266e7 p` lower area, but remains worse on AC nRMSE by `0.020892315791` and has about `3.7990 dB/dec` less far-rolloff margin.
- Decision: promote; the family passes relaxed hard gates, lowers power by using `OPAMP_FT=175k`, keeps area slightly below both the accepted 2BJT and run-5 autotopo best, and produces the best transparent relaxed-PPA score so far without adding passive topology complexity.
- Next: Stop and promote run 6 as the relaxed-PPA 2BJT candidate unless a new non-HF passive family is explicitly justified.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 5

- Hypothesis: Retune the run-1 collector and post-buffer high-frequency poles while sweeping OPAMP_FT downward, to test whether the 2BJT can spend just enough HF margin for a lower relaxed PPA score without adding passive area.
- Change: Updated `maxrun/run_bjt2_autotopo_ppa_sweep.mjs` from run 4 emitter-bypass shaping to family `hf_margin_power_retune`; restored the accepted unsplit emitter degeneration path, removed the run-4 bypass capacitor from the active netlist, swept `CH/RBUF/CBUF/OPAMP_FT`, and advanced the run index to `run_005`. Updated `maxrun/test_bjt2_runner_structure.mjs` to require the run-5 family and plain emitter path.
- Candidates: 54 variants in family `hf_margin_power_retune`, sweeping `CH={22p,24p,26p}`, `RBUF={10k,12k,15k}`, `CBUF={150p,180p,200p}`, and `OPAMP_FT={200k,250k}` at fixed `RC=120k`, `RE=3.9k`, `RB_TOP=4.7Meg`, `RB_BOT=1Meg`, `CIN=C12=68n`, and `COUT=10n`.
- Best: `bjt2_autotopo_hfm_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch26p_r10k_c200p_ft200k`, score `3.92247612`, `midgain=39.760520 dB`, `fL=12.571051 Hz`, `fH=20567.076208 Hz`, `10 Hz relative=-4.391979 dB`, `20 kHz relative=-2.859580 dB`, `100k-1Meg=-82.3370 dB/dec`, `AC nRMSE=0.129932446016`, `tran nRMSE=0.024322386097`, `power=63.422433 uW`, `area=1.820434e8 p`.
- Compared against:
  - accepted 2BJT: score improves versus the accepted-baseline reference, AC nRMSE improves by `0.006386988485`, upper cutoff rises by about `157.696 Hz`, far HF slope gains about `1.7776 dB/dec` of margin, power drops by `1.750000 uW`, and area drops by `3.904821e4 p`; transient nRMSE worsens by `0.000588708288`, and low-frequency shape remains essentially unchanged.
  - prior autotopo best: score improves by `0.07804946`, AC nRMSE improves by `0.003350381085`, upper cutoff rises by about `312.234 Hz`, far HF slope gains about `1.2921 dB/dec` of margin, and power drops by `1.750000 uW`; transient nRMSE worsens by `0.000139349836`, and area worsens by `5.335179e4 p`.
  - 3BJT fallback: keeps practical PPA advantage with about `172.440 uW` lower power and `8.312646e7 p` lower area, but remains worse on AC nRMSE by `0.024032053972` and has less far-rolloff margin than the 3BJT fallback.
- Decision: promote; the family uses only existing HF/power knobs, passes the relaxed hard gates, beats the prior autotopo score, and improves both power and AC fit versus the accepted 2BJT while retaining a small area advantage.
- Next: Validate robustness around the selected `OPAMP_FT=200k`, `CH=26p`, `RBUF=10k`, `CBUF=200p` point, or stop and hand off run 5 as the relaxed-PPA 2BJT candidate.

## 2026-05-23 - 2BJT autotopo relaxed PPA run 4

- Hypothesis: Split only the second-stage emitter degeneration and bypass the lower segment with one capacitor, then retune the collector HF pole, to see whether limited emitter bypass shaping can improve relaxed PPA without changing the 2BJT active path.
- Change: Updated `maxrun/run_bjt2_autotopo_ppa_sweep.mjs` from run 3 output splitting to family `limited_emitter_bypass_shaping`; restored the accepted single `COUT` output coupling path, added `RE2_TOP/RE2_BOT/CEBYP2` second-stage emitter shaping, included bypass capacitor area accounting, and advanced the run index to `run_004`. Updated `maxrun/test_bjt2_runner_structure.mjs` to require the run-4 family and emitter-bypass netlist structure.
- Candidates: 36 variants in family `limited_emitter_bypass_shaping`, sweeping `RE2_TOP={3.3k,3.6k,3.75k,3.8k}` with `RE2_TOP+RE2_BOT=3.9k`, `CEBYP2={4.7n,6.8n,10n}`, and `CH={24p,26p,28p}` at fixed `CIN=C12=68n`, `COUT=10n`, `RBUF=12k`, `CBUF=180p`, and `OPAMP_FT=250k`.
- Best: `bjt2_autotopo_leb_rc120k_re1_3p9k_re2top3p8k_re2bot0p1k_rb4p7m_c68n_cout10n_cebyp24p7n_ch24p_r12k_c180p_ft250k`, score `4.07259449`, `midgain=39.760084 dB`, `fL=12.569959 Hz`, `fH=20254.762457 Hz`, `10 Hz relative=-4.391525 dB`, `20 kHz relative=-2.941315 dB`, `100k-1Meg=-80.9684 dB/dec`, `AC nRMSE=0.133378499634`, `tran nRMSE=0.024175836794`, `power=65.172433 uW`, `area=1.877291e8 p`.
- Compared against:
  - accepted 2BJT: AC nRMSE improves by `0.002940934867` and far HF slope gains about `0.4090 dB/dec` of margin, but transient nRMSE worsens by `0.000442158985`, upper cutoff drops by about `154.618 Hz`, area worsens by `5.646665e6 p`, power is effectively unchanged, and low-frequency shape remains unchanged.
  - prior autotopo best: score worsens by `0.07206891`, AC nRMSE worsens by `0.000095672533`, transient nRMSE improves only `0.000007199467`, area worsens by `5.739065e6 p`, and power is effectively unchanged.
  - 3BJT fallback: keeps practical PPA advantage with about `170.690 uW` lower power and `7.744075e7 p` lower area, but remains worse on AC nRMSE by `0.027478107590` and has less far-rolloff margin.
- Decision: keep searching; the family is valid under relaxed hard gates but the bypass capacitor area cost is not justified by the small AC nRMSE and HF slope changes, and run 1 remains the best relaxed-PPA 2BJT autotopo candidate.
- Next: Try a narrow HF-margin retune around the run-1 candidate, or stop and promote run 1 if no further passive-only family is worth the area trade.

## Notes

- The middle PPA maxrun reruns in the archived log were reproducibility and
  source-of-truth checks for the same accepted 2BJT candidate, not new autotopo
  policy updates.
- The active autotopo loop is reward/score-based sequential search: each run
  generates a topology family, ranks candidates by relaxed PPA score, compares
  against the prior best, and records the next action.
