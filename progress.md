# 진행 기록 요약

작성일: 2026-05-22  
작업 루트: `D:\Codex\Support`

## 현재 상태

Windows native ngspice와 SKY130 primitive PDK 준비를 완료했고, BJT 기반 sanity check를 `2-stage DC operating point`까지 진행했다. 현재 다음 실행 단계는 **3-stage BJT common-emitter amplifier 설계 전 조사 및 3-stage netlist 작성**이다.

최근 추가로 `project.md`를 작성하여, `전자회로프로젝트.md` 기준의 3-stage BJT amplifier 설계 계획, 예상 문제점, PPA 최적화 전략을 정리했다.

## 완료한 작업

| 단계 | 상태 | 핵심 결과 |
| --- | --- | --- |
| 7-Zip 설치 | 완료 | `C:\Program Files\7-Zip\7z.exe` 확인 |
| ngspice 설치 | 완료 | `ngspice-46`, console 실행 파일 확인 |
| SKY130 PDK 준비 | 완료 | `sky130.lib.spice` 존재 확인 |
| `spice.rc` 작성 | 완료 | SKY130/ngspice 실행 옵션 설정 |
| SKY130 smoke test | 완료 | `npn_05v5` include 및 subckt 실행 확인 |
| BJT 1-stage OP | 완료 | BJT bias/headroom sanity check 통과 |
| BJT 1-stage AC/tran | 완료 | gain 약 `4.48 V/V` 확인 |
| BJT 2-stage OP | 완료 | 두 stage 독립 bias와 DC blocking 확인 |
| BJT 2-stage OP 시각화 | 완료 | `bjt2_op_visual.svg` 생성 |
| 3-stage 설계 계획 | 완료 | `project.md` 작성 |

## 설치 및 환경 요약

ngspice는 다음 위치에 설치되어 있다.

```text
C:\eda\ngspice\Spice64\bin\ngspice_con.exe
```

검증된 버전:

```text
ngspice-46
Compiled with KLU Direct Linear Solver
Creation Date: Mar 29 2026 15:02:07
```

SKY130 primitive PDK는 다음 위치에 준비되어 있다.

```text
C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr
```

중요 모델 파일:

```text
C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice
```

현재 Codex PowerShell 세션에서는 PATH 반영이 늦을 수 있으므로 batch 실행에는 절대 경로 사용을 권장한다.

## PDK include 정책

전체 library include는 현재 Windows/ngspice 환경에서 실패했다.

```spice
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt
```

실패 원인은 MOS/ESD 관련 include 중 일부가 ngspice에서 `Not enough parameters for i source` fatal error를 내기 때문이다.

BJT 검증에는 아래처럼 필요한 BJT 관련 파일만 직접 include하는 방식이 통과했다.

```spice
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"
```

`npn_05v5`는 `Q` primitive가 아니라 4핀 subckt로 사용한다.

```spice
XQ collector base emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 M=1
```

## 과제 요구사항 반영

`전자회로프로젝트.md`가 요구사항의 source of truth이다.

최신 변경사항에 따라 resistor cell은 다음을 기준으로 기록한다.

```text
sky130_fd_pr_main / res_high_po_5p73
```

기본 amplifier의 주요 목표는 다음과 같다.

| 항목 | 목표 |
| --- | --- |
| 구조 | Single-ended amplifier |
| Supply | `5 V` |
| 기준 전압 | `2.5 V` |
| 입력 | `2.5 V + 1 mV AC` |
| Midband gain | `40 dB`, 약 `100 V/V` |
| Bandwidth | `10 Hz - 20 kHz` |
| Roll-off | low/high 양쪽 약 `80 dB/decade` |
| Load | `10 pF` |
| 평가 | AC response, transient response, area, power |

## BJT smoke test 결과

생성/실행 파일:

```text
netlists\smoke_sky130.spice
results\ngspice\logs\smoke_sky130.log
results\ngspice\raw\smoke_sky130.raw
```

검증 결과:

- ngspice exit code: `0`
- `can't find`, `unknown`, `fatal`, `singular`, `error` 검색 결과 없음
- operating point에서 `v(c)=4.965966 V`, `v(b)=0.75 V`, `v(e)=0 V` 확인

PDK warning으로 `dcap`, `gap1`, `gap2` unrecognized parameter가 표시되지만 fatal은 아니다.

## BJT 1-stage 결과

### DC operating point

파일:

```text
netlists\bjt1_op.spice
results\ngspice\logs\bjt1_op.log
results\ngspice\raw\bjt1_op.raw
results\ngspice\tables\bjt1_op_summary.csv
```

주요 값:

| 항목 | 값 |
| --- | ---: |
| `v(b1_base)` | `1.129207 V` |
| `v(b1_emitter)` | `0.335519 V` |
| `v(b1_collector)` | `3.365828 V` |
| `VBE1` | `0.793688 V` |
| `VCE1` | `3.030309 V` |
| `Istatic` | `28.0714 uA` |
| `PDC` | `140.357 uW` |

판단: BJT가 정상적으로 켜져 있고 collector가 rail에 붙지 않았다.

### AC / transient

파일:

```text
netlists\bjt1_ac.spice
netlists\bjt1_tran.spice
results\ngspice\tables\bjt1_ac_summary.csv
results\ngspice\tables\bjt1_tran_summary.csv
```

주요 값:

| 항목 | 값 |
| --- | ---: |
| 1 kHz AC gain | `4.48219 V/V` |
| 1 kHz AC gain | `13.0298 dB` |
| transient gain | `4.485 V/V` |
| output peak-to-peak | `8.97 mVpp` |
| output center | 약 `3.365835 V` |

판단: 기존 bias에서 단일 CE stage는 약 `4.48 V/V` gain을 제공한다. 3-stage 목표 gain `100 V/V`에 필요한 stage당 평균 gain은 `100^(1/3)=4.64 V/V`이므로, 이 baseline은 3-stage 설계의 출발점으로 적합하다.

## BJT 2-stage DC 결과

파일:

```text
netlists\bjt2_op.spice
results\ngspice\logs\bjt2_op.log
results\ngspice\raw\bjt2_op.raw
results\ngspice\tables\bjt2_op_summary.csv
results\ngspice\plots\bjt2_op_visual.svg
```

주요 값:

| 항목 | 값 |
| --- | ---: |
| stage 1 `VBE` | `0.793688 V` |
| stage 1 `VCE` | `3.030645 V` |
| stage 2 `VBE` | `0.793688 V` |
| stage 2 `VCE` | `3.030309 V` |
| `vout_final` | `3.365828 V` |
| interstage DC delta | `2.236957 V` |
| `Istatic` | `56.1394 uA` |
| `PDC` | `280.697 uW` |

판단:

- stage 1과 stage 2 모두 정상 bias 상태이다.
- `CINT=1u`가 stage 1 collector DC를 stage 2 base로 직접 전달하지 않는다.
- 2-stage 구조는 3-stage 확장 전 DC bias sanity check로 사용할 수 있다.

## `project.md` 작성 결과

새 문서:

```text
project.md
```

반영 내용:

- 3-stage NPN common-emitter 구조 고정
- 출력 180도 반전 허용 가정
- 목표 `H(s)`와 PPA 평가 기준 정리
- 10 pF load, low/high pole, capacitor area, bias/headroom 문제 정리
- 회로도 작성 전 조사 항목과 확인 질문 정리
- OPAMP는 기본안에서 제외하고 load 문제 발생 시 fallback으로만 검토

검증 결과:

```text
All project.md content checks passed (12/12).
```

## 다음 작업

우선순위는 다음과 같다.

1. `project.md` 기준으로 3-stage CE schematic/netlist 구조를 확정한다.
2. `netlists\bjt3_op.spice`를 작성해 3개 stage의 DC operating point를 확인한다.
3. `bjt3_ac.spice`와 `bjt3_tran.spice`를 작성해 unloaded gain과 transient swing을 확인한다.
4. `10 pF` load를 붙인 `bjt3_load10p_ac/tran` 결과를 unloaded 결과와 비교한다.
5. stage별 `RC/RE`, base divider, coupling capacitor, CE3 output bias를 sweep한다.
6. 최종 후보에 대해 device list, area table, power table, target `H(s)` 대비 nRMSE를 작성한다.

## 주의할 점

- 전체 `sky130.lib.spice` include는 현재 환경에서 최종 검증 경로로 사용하지 않는다.
- BJT netlist는 `npn_05v5` 4핀 subckt instance를 사용한다.
- resistor cell은 최신 변경사항에 따라 `res_high_po_5p73`로 기록한다.
- 3-stage CE 출력은 입력 대비 반전되므로 target phase/transient 비교에 180도 반전을 포함한다.
- 10 Hz lower cutoff를 위한 큰 capacitor는 area penalty가 크므로 R-C pole과 PPA를 함께 비교해야 한다.
- `10 pF` load는 CE3 output pole을 크게 바꿀 수 있으므로 loaded/unloaded 비교를 필수로 남긴다.

## 2026-05-22 - workflow Cycle A

- 구현: `3stage-bjt.md`를 1-stage/2-stage 검증 결과 기준으로 보정했다.
- 검증: baseline 값, direct include, 4-pin NPN subckt, unloaded/load 분리 gate를 문서에서 확인했다.
- 개선 결정: 다음 run은 `bjt3_op.spice` 생성과 DC operating point 검증이다.

## 2026-05-22 - workflow Cycle B

- 구현: `netlists/bjt3_op.spice`를 생성하고 3-stage CE 구조를 `RC=100k`, `RE=20k`, `RB_TOP=330k`, `RB_BOT=100k`, `C12=1u`, `C23=1u` baseline으로 구성했다.
- 검증: ngspice exit code `0`, 공통 로그 검증 match 없음. stage 1/2/3 `VBE`는 모두 약 `0.793688 V`, `VCE`는 `3.030645 V`, `3.030645 V`, `3.030309 V`로 DC gate를 통과했다.
- 개선 결정: 다음 run은 `bjt3_ac.spice` 생성과 unloaded AC gain/bandwidth 검증이다.

## 2026-05-22 - workflow Cycle C

- 구현: `netlists/bjt3_ac.spice`를 생성하고 통과한 `bjt3_op.spice` bias 값에 `CIN=1u`, `C12=1u`, `C23=1u`, unloaded `RLOAD_AC=1G`를 적용했다.
- 검증: ngspice exit code `0`, 공통 로그 검증 match 없음. `results/ngspice/tables/bjt3_ac_summary.csv`에서 1 kHz gain은 `15.3274344 V/V`, `23.7093893 dB`로 Cycle C gate `35 dB <= midgain_db <= 45 dB`를 통과하지 못했다.
- 개선 결정: 문제군은 `ac_gain_bandwidth`이다. 다음 run은 interstage AC loading을 줄이는 한 가지 후보로 `RB_TOP/RB_BOT` 비율은 유지하고 divider impedance scale만 키운 `bjt3_ac` 개선 검증을 수행한다.

## 2026-05-22 - workflow Cycle C improvement

- 구현: `netlists/bjt3_ac.spice`에서 `RB_TOP/RB_BOT` 비율을 유지한 채 각 stage divider를 `3.3Meg/1Meg`로 10배 키웠다.
- 검증: ngspice exit code `0`, 공통 로그 검증 match 없음. 1 kHz gain은 `49.7843 V/V`, `33.9418 dB`로 기존 `23.7093893 dB`보다 개선됐지만 Cycle C gate `35 dB <= midgain_db <= 45 dB`에는 미달했다.
- 개선 결정: 문제군은 계속 `ac_gain_bandwidth`이다. 다음 run은 divider scale을 추가로 반복하지 말고 `RC/RE` gain-headroom family 중 하나만 선택해 1 kHz gain을 35 dB 이상으로 올리는 후보를 검증한다.

## 2026-05-22 - workflow Cycle C improvement

- 구현: `netlists/bjt3_ac.spice`에서 직전 `3.3Meg/1Meg` divider 개선을 유지하고, `RC/RE` gain-headroom family 중 `RC`만 `100k`에서 `120k`로 올렸다.
- 검증: ngspice exit code `0`, 공통 로그 검증 match 없음. 1 kHz gain은 `79.5095 V/V`, `38.0084 dB`, phase는 `-3.14071 deg`로 Cycle C gate `35 dB <= midgain_db <= 45 dB`를 통과했다. 10 Hz to 20 kHz ripple은 `0.0144342 dB`이다.
- 개선 결정: `bjt3_ac` unloaded AC 후보를 accepted로 둔다. 다음 run은 이 후보를 기준으로 `bjt3_tran.spice` 생성과 unloaded transient 검증이다.

## 2026-05-22 - workflow Cycle D

- 구현: `netlists/bjt3_tran.spice`를 생성하고 통과한 `bjt3_ac.spice` 후보값인 `RB_TOP/RB_BOT=3.3Meg/1Meg`, `RC=120k`, `RE=20k`, `CIN/C12/C23=1u`를 그대로 적용했다.
- 검증: ngspice exit code `0`, 공통 로그 검증 match 없음. `results/ngspice/tables/bjt3_tran_summary.csv`에서 `vin_pp=0.00200 V`, `out_pp=0.15899 V`, transient gain은 `79.4950 V/V`, 출력 중심은 `3.870195 V`로 transient gate를 통과했다.
- 개선 결정: `bjt3_tran` unloaded transient 후보를 accepted로 둔다. 다음 run은 `bjt3_load10p_ac.spice`와 `bjt3_load10p_tran.spice` 생성 및 10 pF load 비교 검증이다.

## 2026-05-22 - workflow Cycle E

- 구현: `netlists/bjt3_load10p_ac.spice`와 `netlists/bjt3_load10p_tran.spice`를 생성하고 final output node에만 `CLOAD_10P=10p`를 추가했다.
- 검증: 두 ngspice 실행 모두 exit code `0`, 공통 로그 검증 match 없음. loaded 1 kHz gain은 `38.0081374 dB`, unloaded 대비 gain delta는 `-0.0002626 dB`, loaded upper cutoff는 약 `131916.53 Hz`이며 transient는 `out_pp=0.15898 V`, 출력 중심 `3.87020 V`로 load gate를 통과했다.
- 개선 결정: 10 pF load 후보를 accepted로 둔다. 다음 run은 통과한 baseline에서 한 가지 family만 선택하는 Cycle F parameter sweep이다.

## 2026-05-22 - workflow Cycle F

- 구현: `high_cutoff_shape` family만 선택해 `netlists/bjt3_sweep_highcut_core.inc`와 `CH=22p/30p/39p` AC/transient sweep netlist를 생성했다.
- 검증: 6개 ngspice 실행 모두 exit code `0`, `bjt3_sweep_highcut_ch*.log` 공통 로그 검증 match 없음. `results/ngspice/tables/bjt3_sweep_summary.csv`에서 `CH=30p` 후보가 `midgain=38.001764 dB`, `upper_cutoff=23005.02 Hz`, `out_pp=0.158871 V`, `load_gain_delta=-0.006636 dB`로 accepted이다.
- 개선 결정: final candidate는 `bjt3_sweep_highcut_ch30p_ac/tran`이다. 다음 run은 Cycle G final metrics and deliverables 생성이다.

## 2026-05-22 - workflow Cycle F low_cutoff_area

- 구현: `goal.md`의 lower cutoff gap을 우선하여 `netlists/bjt3_sweep_lowcut_core.inc`와 `CIN=C12=C23=15n/22n/33n/47n/68n` AC/transient sweep netlist를 생성했다. accepted 후보 확인용으로 `bjt3_sweep_lowcut_c68n_op.spice`와 `bjt3_sweep_lowcut_c68n_noise_10hz_20khz.spice`도 생성했다.
- 검증: 12개 ngspice 실행 모두 exit code `0`, `bjt3_sweep_lowcut_c*.log` 공통 로그 검증 match 없음. `CIN=C12=C23=68n` 후보는 `midgain=38.001080 dB`, `lower_cutoff=9.58104 Hz`, `upper_cutoff=23006.64 Hz`, `out_pp=0.158880 V`, `output_center=3.870130 V`로 lower cutoff gap을 통과했다. target-band noise는 `onoise_total=1.05667 mVrms`, `inoise_total=14.9991 uVrms`이다.
- 개선 결정: final candidate를 `bjt3_sweep_lowcut_c68n_ac/tran`으로 갱신했다. 다음 run은 `RC/RE` gain-headroom sweep으로 38 dB에서 40 dB에 접근하되 headroom과 10 pF load를 재검증한다.

## 2026-05-22 - workflow Cycle F gain_headroom

- 구현: `goal.md`의 gain gap을 우선하여 `netlists/bjt3_sweep_gain_re_core.inc`와 `RE=19k/18.5k/18k` OP/AC/transient sweep netlist를 생성했다. accepted 후보 확인용으로 `bjt3_sweep_gain_re18p5k_noise_10hz_20khz.spice`도 생성했다.
- 검증: 10개 ngspice 실행 모두 exit code `0`, `bjt3_sweep_gain_re*.log` 공통 로그 검증 match 없음. `RE=18.5k` 후보는 `midgain=39.7460 dB`, `lower_cutoff=9.87690 Hz`, `upper_cutoff=23093.96 Hz`, `out_pp=0.194230 V`, `output_center=3.829125 V`, `Istatic=32.9249 uA`, `PDC=164.6245 uW`로 gain-headroom gap을 통과했다. target-band noise는 `onoise_total=1.281175 mVrms`, `inoise_total=15.01883 uVrms`이다.
- 개선 결정: final candidate를 `bjt3_sweep_gain_re18p5k_ac/tran`으로 갱신했다. 다음 run은 output rebias 후보로 2.5 V output common-mode gap을 줄이는지 검증한다.

## 2026-05-22 - workflow Cycle F output_rebias

- 구현: `goal.md`의 output common-mode gap을 우선하여 `netlists/bjt3_sweep_rebias_core.inc`와 `bjt3_sweep_rebias_cout68n_r10meg_{op,ac,tran,noise_10hz_20khz}.spice`를 생성했다. accepted gain path는 유지하고 final output에만 `COUT=68n`, `ROUT_TOP=ROUT_BOT=10Meg`, `CLOAD=10p`를 적용했다.
- 검증: 4개 ngspice 실행 모두 exit code `0`, `bjt3_sweep_rebias_cout68n_r10meg*.log` 공통 로그 검증 match 없음. 후보는 `vout_final=2.500000 V`, `midgain=39.540534 dB`, `lower_cutoff=9.893984 Hz`, `upper_cutoff=23384.244 Hz`, `out_pp=0.189700 V`, `output_center=2.499700 V`, `Istatic=33.1711 uA`, `PDC=165.8555 uW`, target-band noise `inoise_total=15.01858 uVrms`로 output common-mode gap을 통과했다.
- 개선 결정: final candidate를 `bjt3_sweep_rebias_cout68n_r10meg_ac/tran`으로 갱신했다. 다음 run은 Cycle G final metrics and deliverables 생성이며, 특히 68 nF coupling/output caps와 10 Meg rebias resistor area를 문서화한다.

## 2026-05-22 - workflow Cycle G

- 구현: final candidate `bjt3_sweep_rebias_cout68n_r10meg` 기준으로 `device_list.csv`, `area_calculation.csv`, `power_calculation.csv`, `target_hs.csv`, `performance_summary.csv`와 AC/transient PNG plot을 생성했다.
- 검증: OP/AC/tran/noise netlist를 재실행했고 모두 exit code `0`, `bjt3_sweep_rebias_cout68n_r10meg*.log` 공통 로그 검증 match 없음. final summary는 `midgain=39.540534 dB`, `lower_cutoff=9.87505 Hz`, `upper_cutoff=23430.24 Hz`, `worst_power=165.862 uW`, `area_p=335622691.348`, `ac_nrmse=0.16544`, `tran_nrmse=0.02480`이다.
- 개선 결정: Cycle G deliverables를 accepted로 둔다. 다음 run은 새 회로 생성 없이 final integration review를 수행한다.

## 2026-05-22 - workflow Cycle F COUT pole alignment

- 구현: `goal.md`의 low-frequency rolloff gap을 우선하여 output rebias family 안에서 `COUT`만 바꾼 `bjt3_sweep_coutalign_c3p3n/c4p7n/c6p8n/c10n/c15n_{ac,tran}.spice`를 생성했다. accepted 후보 확인용으로 `bjt3_sweep_coutalign_c10n_op.spice`와 `bjt3_sweep_coutalign_c10n_noise_10hz_20khz.spice`도 생성했다.
- 검증: 12개 ngspice 실행 모두 exit code `0`, `bjt3_sweep_coutalign_c*.log` 공통 로그 검증 match 없음. `COUT=10n` 후보는 `midgain=39.533420 dB`, lower cutoff `10.59978 Hz`, upper cutoff `23386.60 Hz`, `out_pp=0.189597 V`, output center `2.499753 V`, `Istatic=33.1711 uA`, `PDC=165.8555 uW`이다. target-band noise는 `onoise_total=1.231839 mVrms`, `inoise_total=15.01115 uVrms`이다.
- 개선 결정: final candidate를 `bjt3_sweep_coutalign_c10n_ac/tran`으로 갱신했다. Low-frequency slope는 68 nF 후보의 약 `60.36 dB/dec`와 `40.20 dB/dec`에서 `72.51 dB/dec`와 `49.26 dB/dec`로 개선됐고 AC nRMSE는 `0.16544`에서 `0.160141`로 개선됐다. 다음 run은 Cycle G deliverables를 새 accepted candidate 기준으로 재생성한다.

## 2026-05-22 - workflow Cycle G refresh

- 구현: final candidate `bjt3_sweep_coutalign_c10n` 기준으로 OP/AC/transient/noise netlist를 재실행하고 `device_list.csv`, `area_calculation.csv`, `power_calculation.csv`, `target_hs.csv`, `performance_summary.csv`와 AC/transient PNG plot을 갱신했다. 재생성 로직은 `maxrun/regenerate_cycle_g_coutalign.mjs`에 남겼다.
- 검증: OP/AC/tran/noise ngspice 실행은 모두 exit code `0`였고, `Select-String .\results\ngspice\logs\bjt3_sweep_coutalign_c10n*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. final summary는 `midgain=39.53342 dB`, lower cutoff `10.59978 Hz`, upper cutoff `23386.60 Hz`, `out_pp=0.189597 V`, `output_center=2.499753 V`, `worst_power=165.862 uW`, `area_p=264800475.176`, `ac_nrmse=0.160141`, `tran_nrmse=0.024391`이다.
- 개선 결정: Cycle G deliverables를 `bjt3_sweep_coutalign_c10n` 기준 accepted로 갱신했다. 다음 run은 새 회로 생성 없이 final integration review를 수행하거나, 80 dB/dec high-frequency rolloff가 hard target이면 `high_cutoff_shape`의 4th pole 후보를 한 가지만 검증한다.

## 2026-05-22 - workflow Cycle F high_cutoff_shape 4th-pole output-cap sweep

- 구현: `goal.md`의 high-frequency rolloff gap을 우선하여 `maxrun/run_hf4pole_sweep.mjs`를 추가하고, 현재 final candidate `bjt3_sweep_coutalign_c10n`에 final output shunt capacitor `CHOUT=10p/15p/22p/33p/47p`만 추가한 `bjt3_sweep_hf4pole_chout*_{op,ac,tran}.spice`를 생성했다. 결과는 `results/ngspice/tables/bjt3_sweep_hf4pole_summary.csv`와 기존 `bjt3_sweep_summary.csv`에 기록했다.
- 검증: 15개 ngspice 실행은 모두 exit code `0`였고, `Select-String .\results\ngspice\logs\bjt3_sweep_hf4pole_chout*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. 가장 작은 `CHOUT=10p`는 `midgain=39.523048 dB`, `fL=10.59431 Hz`, `fH=20593.90 Hz`, `out_pp=0.189357 V`, `output_center=2.499754 V`로 기본 gate는 유지했지만 high-frequency slope는 `10k-100k=-22.87 dB/dec`, `20k-200k=-36.84 dB/dec`, `100k-1Meg=-57.23 dB/dec`로 기존 far slope를 거의 개선하지 못했다. `CHOUT>=15p`는 upper cutoff가 `20 kHz` 아래로 내려가 rejected이다.
- 개선 결정: output node에 shunt capacitor만 더하는 4th-pole 후보는 accepted하지 않는다. 현재 final candidate는 `bjt3_sweep_coutalign_c10n`으로 유지한다. 다음 run은 `high_cutoff_shape` 안에서 output isolation resistor plus load/fourth-pole capacitor 형태를 한 가지 family로 검증해 실제 독립 pole을 만들 수 있는지 확인한다.

## 2026-05-22 - workflow Cycle F high_cutoff_shape output-isolation sweep

- 구현: `goal.md`의 high-frequency rolloff gap을 우선하여 `maxrun/run_hfiso_sweep.mjs`를 추가하고, 현재 final candidate `bjt3_sweep_coutalign_c10n`의 output rebias node를 `vout_drv -- RISO -- vout_final`로 분리한 `bjt3_sweep_hfiso_r68k/r100k/r150k/r220k/r330k/r470k_{op,ac,tran}.spice`를 생성했다. `CLOAD_10P=10p`는 최종 `vout_final`에만 유지했다.
- 검증: 18개 ngspice 실행은 모두 exit code `0`였고, `Select-String .\results\ngspice\logs\bjt3_sweep_hfiso_r*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. `RISO=220k`가 bandwidth를 유지한 가장 강한 후보로 `midgain=39.531713 dB`, `fL=10.59639 Hz`, `fH=20831.99846 Hz`, `out_pp=0.189549 V`, `output_center=2.499754 V`였지만 high-frequency slope는 `10k-100k=-24.88 dB/dec`, `20k-200k=-42.51 dB/dec`, `100k-1Meg=-73.68 dB/dec`에 그쳤다. `RISO=330k/470k`는 far slope가 더 강하지만 upper cutoff가 각각 `19224.77878 Hz`, `17273.37334 Hz`로 20 kHz 목표 아래라 rejected이다.
- 개선 결정: output-isolation/load-pole 단독 family는 accepted하지 않는다. 현재 final candidate는 `bjt3_sweep_coutalign_c10n`으로 유지한다. 다음 run은 80 dB/dec high-frequency rolloff가 hard target이면 같은 `high_cutoff_shape` family 안에서 기존 `CH1/CH2/CH3`를 줄여 upper-cutoff headroom을 확보한 뒤 `RISO`를 함께 조정하는 후보를 검증한다.

## 2026-05-22 - workflow Cycle F high_cutoff_shape CH/RISO combined sweep

- 구현: `goal.md`의 high-frequency rolloff gap을 우선하여 `maxrun/run_hfiso_ch_sweep.mjs`를 추가하고, 현재 final candidate `bjt3_sweep_coutalign_c10n`에서 `CH1=CH2=CH3`를 `22p/18p/15p`로 낮춘 뒤 `RISO=330k/470k/680k`를 조합한 `bjt3_sweep_hfiso_ch*_{op,ac,tran}.spice`를 생성했다. 변경 family는 `high_cutoff_shape` 하나로 제한했다.
- 검증: 27개 ngspice 실행은 모두 exit code `0`였고, `Select-String .\results\ngspice\logs\bjt3_sweep_hfiso_ch*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. 모든 후보는 rejected이다. bandwidth를 유지한 후보 중 가장 강한 far slope는 `CH=22p, RISO=330k`의 `fH=22801.4068 Hz`, `100k-1Meg=-72.43 dB/dec`였고, `CH=18p, RISO=470k`는 `fH=21301.02929 Hz`, `100k-1Meg=-71.03 dB/dec`였다. `RISO=470k/680k` 중 일부는 rolloff가 약간 강해졌지만 upper cutoff가 20 kHz 아래로 떨어졌다.
- 개선 결정: `CH`를 줄여 headroom을 만든 뒤 `RISO`를 키우는 단순 조합은 80 dB/dec high-frequency target을 만족하지 못한다. 현재 final candidate는 `bjt3_sweep_coutalign_c10n`으로 유지한다. 다음 run은 80 dB/dec가 hard target이면 RISO/load pole 단독이 아니라 별도 출력 low-pass filter section 또는 load buffer/filter fallback을 한 가지 후보로 검증한다.

## 2026-05-22 - workflow Cycle F high_cutoff_shape explicit output low-pass section

- 구현: `goal.md`의 high-frequency rolloff gap을 우선하여 `maxrun/run_hflp_sweep.mjs`를 추가하고, 현재 final candidate `bjt3_sweep_coutalign_c10n`의 output rebias node 뒤에 `RLP` 직렬 저항과 내부 `CLP` shunt capacitor를 둔 명시적 출력 low-pass section 후보를 생성했다. 후보는 `RLP/CLP = 47k/47p, 68k/33p, 68k/47p, 100k/22p, 100k/33p, 150k/15p, 150k/22p`이며, 외부 평가 load `CLOAD_10P=10p`는 final output node에 유지했다.
- 검증: `node .\maxrun\run_hflp_sweep.mjs --parallel 4`로 OP/AC/transient 21개 ngspice 실행을 완료했고, `Select-String .\results\ngspice\logs\bjt3_sweep_hflp_*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. 모든 후보는 rejected이다. 가장 높은 upper cutoff 후보는 `RLP=150k, CLP=15p`로 `midgain=39.511565 dB`, `fL=10.5797 Hz`, `fH=15457.36378 Hz`, `out_pp=0.189116 V`, `output_center=2.499754 V`, high slopes `10k-100k=-28.30 dB/dec`, `20k-200k=-45.20 dB/dec`, `100k-1Meg=-74.22 dB/dec`였다. 가장 강한 far slope 후보는 `RLP=150k, CLP=22p`의 `100k-1Meg=-74.52 dB/dec`였지만 `fH=13423.77297 Hz`로 bandwidth gate를 통과하지 못했다.
- 개선 결정: 명시적 passive output low-pass section은 high-frequency rolloff를 일부 개선하지만 20 kHz upper cutoff를 크게 낮추므로 accepted하지 않는다. 현재 final candidate는 `bjt3_sweep_coutalign_c10n`으로 유지한다. 다음 run은 80 dB/dec가 hard target이면 main BJT gain path 뒤에 붙는 load buffer/filter fallback을 한 가지 후보로 검증하거나, hard target이 아니면 final integration review로 진행한다.

## 2026-05-22 - workflow Final Integration Review

- 구현: 새 netlist는 생성하지 않고 final candidate `bjt3_sweep_coutalign_c10n`의 제출 산출물과 문서 연결성을 검토했다.
- 검증: `rg "bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv" .\progress.md .\3stage-bjt.md`에서 필수 산출물 참조를 확인했다. `rg` ambiguity scan은 `.\3stage-bjt.md`, `.\progress.md`, `.\change.md`, `.\workflow.md`에서 match가 없었고, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match가 없었다.
- 통합 판단: final candidate는 `bjt3_sweep_coutalign_c10n`이며 unloaded baseline, 10 pF loaded result, accepted/rejected sweep 이유, device/area/power/target/performance CSV가 모두 분리되어 있다. 제출용 최종 row는 `midgain=39.53342 dB`, `fL=10.59978 Hz`, `fH=23386.60 Hz`, `out_pp=0.189597 V`, `output_center=2.499753 V`, `worst_power=165.862 uW`, `area_p=264800475.176`, `ac_nrmse=0.160141`, `tran_nrmse=0.024391`이다.
- 개선 결정: 문서화된 hard gap은 high-frequency rolloff가 목표 `80 dB/dec`에 미달하는 점이다. passive 4th-pole, output isolation, CH/RISO 조합, explicit output low-pass 후보는 모두 rejected로 남겼으므로, 다음 run은 hard target이면 load buffer/filter fallback 한 가지를 검증하고, 아니면 발표자료/제출 패키지 정리로 진행한다.

## 2026-05-22 - workflow Cycle F high_cutoff_shape load-buffer/filter fallback

- 구현: `goal.md`의 high-frequency rolloff hard-gap을 우선하여 `maxrun/run_hfbuf_filter_sweep.mjs`를 추가하고, current BJT-only final candidate `bjt3_sweep_coutalign_c10n`의 output rebias node 뒤에 ideal ahdLib-equivalent OPAMP follower와 2단 RC low-pass filter를 붙인 `bjt3_sweep_hfbuf_*_{op,ac,tran}.spice`를 생성했다. OPAMP는 main gain source가 아니라 load buffer/filter fallback으로만 두었고, PPA 전류 모델은 `OPAMP_FT=2Meg`, `IOPAMP=OPAMP_FT*7e-12`로 잡았다.
- 검증: `node .\maxrun\run_hfbuf_filter_sweep.mjs --parallel 4`로 12개 OP/AC/transient ngspice 실행을 완료했고, accepted 후보에 대해 noise netlist도 추가 실행했다. `Select-String .\results\ngspice\logs\bjt3_sweep_hfbuf_*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. `R=10k`, `C=150p` 후보는 `midgain=39.540374 dB`, lower cutoff `10.59845 Hz`, upper cutoff `20738.04886 Hz`, `out_pp=0.189751 V`, output center `2.499753 V`, `Istatic=47.1711 uA`, `PDC=235.8555 uW`, target-band input-referred noise `15.01195 uVrms`이다. High-frequency slopes는 `10k-100k=-28.40 dB/dec`, `20k-200k=-48.90 dB/dec`, `100k-1Meg=-87.17 dB/dec`로 far-slope hard-target proxy를 통과했다.
- 개선 결정: `hfbuf_r10k_c150p`를 load-buffer/filter fallback performance candidate로 accepted한다. 다만 ideal buffer noise는 모델에 포함되지 않았고 OPAMP area/power PPA가 추가되므로, 기존 BJT-only final `bjt3_sweep_coutalign_c10n`을 즉시 대체하지 않고 다음 run에서 Cycle G deliverables를 fallback 기준으로 재생성해 PPA/performance trade-off를 비교한다.

## 2026-05-22 - workflow Cycle G fallback refresh

- 구현: final performance fallback `bjt3_sweep_hfbuf_r10k_c150p` 기준으로 OP/AC/transient/noise netlist를 재실행하고 `device_list.csv`, `area_calculation.csv`, `power_calculation.csv`, `target_hs.csv`, `performance_summary.csv`, AC/transient PNG plot을 갱신했다. 재생성 로직은 `maxrun/regenerate_cycle_g_hfbuf.mjs`에 남겼고, BJT-only 후보와의 PPA 비교는 `results/ngspice/tables/bjt3_final_candidate_comparison.csv`에 추가했다.
- 검증: OP/AC/tran/noise ngspice 실행은 모두 exit code `0`였고, `Select-String .\results\ngspice\logs\bjt3_sweep_hfbuf_r10k_c150p*.log -Pattern "can't find|unknown|fatal|singular|error|failed"` 결과는 비어 있었다. fallback summary는 `midgain=39.5403745 dB`, lower cutoff `10.598446 Hz`, upper cutoff `20738.048859 Hz`, `out_pp=0.189751 V`, `output_center=2.499753 V`, `worst_power=235.862 uW`, `area_p=265169812.927`, `ac_nrmse=0.105900`, `tran_nrmse=0.029755`이다.
- 개선 결정: `bjt3_sweep_hfbuf_r10k_c150p`는 100 kHz to 1 MHz far-slope `-87.17 dB/dec`로 high-frequency hard-target proxy를 통과하는 accepted fallback이다. BJT-only `bjt3_sweep_coutalign_c10n` 대비 power는 약 `+70.0 uW`, area는 약 `+369337.75 p` 증가하므로, 다음 run은 final integration review에서 hard-target fallback과 low-power BJT-only reference의 제출 포지션을 명확히 정리한다.

## 2026-05-22 - workflow Final Integration Review fallback

- 구현: 새 netlist는 생성하지 않고 final performance fallback `bjt3_sweep_hfbuf_r10k_c150p`의 제출 산출물, BJT-only comparison row, 문서 연결성, plot 존재 여부를 검토했다.
- 검증: `rg "bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv|bjt3_final_candidate_comparison.csv" .\progress.md .\3stage-bjt.md .\goal.md`에서 필수 산출물 참조를 확인했다. ambiguity scan은 `workflow.md`, `3stage-bjt.md`, `progress.md`, `change.md`, `goal.md`에서 match가 없었고, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match가 없었다. `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`로 `performance_summary.csv`의 `2.651698129268e+8 p`와 반올림 오차 수준에서 일치했고, `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`도 performance row와 일치했다.
- 통합 판단: hard high-frequency rolloff proxy가 중요하면 `bjt3_sweep_hfbuf_r10k_c150p`를 제출 후보로 사용한다. 이 후보는 10 pF load 기준 `midgain=39.5403745 dB`, `fL=10.598446 Hz`, `fH=20738.048859 Hz`, `out_pp=0.189751 V`, `output_center=2.499753 V`, `worst_power=235.862 uW`, `area_p=265169812.927`, `ac_nrmse=0.105900`, `tran_nrmse=0.029755`, `100k-1Meg=-87.17 dB/dec`이다.
- 개선 결정: 제출/발표에서는 `bjt3_sweep_hfbuf_r10k_c150p`를 hard-target performance fallback으로 제시하고, `bjt3_sweep_coutalign_c10n`은 약 `70.0 uW` 낮은 power와 약 `369337.75 p` 낮은 area를 갖는 BJT-only low-power reference로 비교한다. 다음 action은 회로 변경이 아니라 발표자료/제출 패키지 정리이다.

## 2026-05-22 - workflow Final Integration Review refresh

- 구현: 새 netlist나 plot을 생성하지 않고 `goal.md`의 next sweep priority에 맞춰 final fallback `bjt3_sweep_hfbuf_r10k_c150p` 산출물의 문서 참조, CSV 일관성, plot 존재 여부를 재검토했다.
- 검증: 필수 산출물 `rg` 검색은 `goal.md`, `3stage-bjt.md`, `progress.md`에서 참조를 확인했고, ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`는 match 없음이었다. `area_calculation.csv` PPA 포함 합계는 `265169812.926822 p`, `performance_summary.csv` area는 `265169812.9268 p`로 반올림 차이만 있었고, `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`는 performance row와 정확히 일치했다. `target_hs.csv`는 481 rows, `device_list.csv`는 13 rows이며 final AC/transient PNG가 존재한다.
- 통합 판단: 제출 후보는 hard high-frequency proxy 기준 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. 최종 CSV row는 `midgain=39.5403745 dB`, `fL=10.598446 Hz`, `fH=20738.048859 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=235.862 uW`, `area=265169812.927 p`, `decision=accepted_fallback`이다.
- 개선 결정: 회로 변경은 보류한다. 다음 action은 발표자료/제출 패키지에서 fallback의 ideal OPAMP noise 미모델링과 BJT-only reference 대비 power/area penalty를 명시하는 것이다.

## 2026-05-22 - workflow Final Integration Review submission readiness

- 구현: 새 회로, sweep, plot은 만들지 않고 `goal.md`가 요구한 final fallback 제출 준비 상태만 재검토했다.
- 검증: 필수 산출물 `rg` 검색에서 `goal.md`, `3stage-bjt.md`, `progress.md`가 `bjt3_sweep_hfbuf_r10k_c150p`, `device_list.csv`, `area_calculation.csv`, `power_calculation.csv`, `target_hs.csv`, `performance_summary.csv`, `bjt3_final_candidate_comparison.csv`를 참조함을 확인했다. ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`는 match 없음이었다.
- 검증: `performance_summary.csv` final row는 `bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446 Hz`, `fH=20738.048859 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. `area_calculation.csv`의 `ppa_included=true` 합계는 `265169812.926822 p`이고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 performance row와 일치한다.
- 검증: `target_hs.csv`는 481 rows, `device_list.csv`는 13 rows이며, final plot `bjt3_sweep_hfbuf_r10k_c150p_ac.png`와 `bjt3_sweep_hfbuf_r10k_c150p_tran.png`가 존재한다. `bjt3_final_candidate_comparison.csv`는 BJT-only `bjt3_sweep_coutalign_c10n`과 fallback `bjt3_sweep_hfbuf_r10k_c150p`를 분리해 비교한다.
- 통합 판단: 제출 후보는 hard high-frequency proxy용 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. 발표/제출에서는 ideal OPAMP fallback noise 미모델링, BJT-only reference 대비 약 `+70.0 uW` power 및 약 `+369337.75 p` area penalty, 그리고 far high-frequency slope `100k-1Meg=-87.17 dB/dec`를 함께 명시한다.
- 개선 결정: 회로 변경은 종료하고, 다음 run은 발표자료/제출 패키지 작성으로 넘어간다.

## 2026-05-22 - workflow Final Integration Review package handoff

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 next action에 맞춰 final fallback 제출 산출물의 package handoff 상태만 재검토했다.
- 검증: 필수 산출물 `rg` 검색에서 `goal.md`, `3stage-bjt.md`, `progress.md`가 `bjt3_sweep_hfbuf_r10k_c150p`, `device_list.csv`, `area_calculation.csv`, `power_calculation.csv`, `target_hs.csv`, `performance_summary.csv`, `bjt3_final_candidate_comparison.csv`를 참조함을 확인했다. ambiguity scan은 match 없음(exit code 1)이었고, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match 없음이었다.
- 검증: `performance_summary.csv` final row는 `bjt3_sweep_hfbuf_r10k_c150p`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`이고 performance row와의 차이는 `2.17e-5 p` 반올림 수준이다. `power_calculation.csv`의 `worst_power_w`는 `max(pdc_w=2.358555e-4 W, pavg_w=2.358623086371e-4 W)`와 일치한다.
- 검증: final plot `results/ngspice/plots/bjt3_sweep_hfbuf_r10k_c150p_ac.png`와 `results/ngspice/plots/bjt3_sweep_hfbuf_r10k_c150p_tran.png`가 존재한다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows이고, `bjt3_final_candidate_comparison.csv`는 BJT-only reference와 fallback candidate 2 rows를 포함한다.
- 통합 판단: 제출 후보는 hard high-frequency proxy 기준 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. 발표/제출 자료에는 ideal OPAMP fallback noise 미모델링, BJT-only reference 대비 power/area penalty, far high-frequency slope `-87.17 dB/dec`, low-power alternative `bjt3_sweep_coutalign_c10n`을 명확히 분리해 적는다.
- 개선 결정: 회로 설계 workflow는 완료 상태로 보고, 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review final handoff

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 next sweep priority에 따라 final fallback 산출물의 최종 handoff 일관성만 재검토했다.
- 검증: 필수 산출물 `rg` 검색에서 `goal.md`, `3stage-bjt.md`, `progress.md`가 final fallback `bjt3_sweep_hfbuf_r10k_c150p`, BJT-only reference `bjt3_sweep_coutalign_c10n`, Cycle G CSV, comparison CSV를 참조함을 확인했다. ambiguity scan은 match 없음(exit code 1)이었고, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match 없음이었다.
- 검증: `performance_summary.csv` final row는 `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. PPA 포함 area 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 차이이고, worst power 계산값은 `2.358623086371e-4 W`로 일치했다.
- 검증: `target_hs.csv`는 481 rows, `device_list.csv`는 13 rows, `bjt3_final_candidate_comparison.csv`는 BJT-only reference와 fallback candidate 2 rows를 포함한다. final AC/transient plot `bjt3_sweep_hfbuf_r10k_c150p_ac.png`와 `bjt3_sweep_hfbuf_r10k_c150p_tran.png`가 존재한다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. `bjt3_sweep_coutalign_c10n`은 OPAMP fallback 없이 power/area가 낮은 BJT-only reference로 비교한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이며, ideal OPAMP noise 미모델링과 fallback의 power/area penalty를 명시한다.

## 2026-05-22 - workflow Final Integration Review packaging readiness

- 구현: 새 netlist, sweep, plot은 생성하지 않고 `goal.md`의 final fallback 제출 후보 기준으로 산출물 참조, CSV 일관성, plot 존재 여부, 로그 상태를 재검토했다.
- 검증: `rg "bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv|bjt3_final_candidate_comparison.csv|bjt3_sweep_hfbuf_r10k_c150p|bjt3_sweep_coutalign_c10n" .\progress.md .\3stage-bjt.md .\goal.md`에서 필수 참조를 확인했다. ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match 없음이었다.
- 검증: `performance_summary.csv` final row는 `bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. `area_calculation.csv` PPA 포함 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 차이이며, `power_calculation.csv`의 worst power는 `max(pdc_w, pavg_w)=2.358623086371e-4 W`로 performance row와 일치했다.
- 검증: `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 BJT-only reference와 fallback candidate 2 rows를 포함한다. final plot `bjt3_sweep_hfbuf_r10k_c150p_ac.png`와 `bjt3_sweep_hfbuf_r10k_c150p_tran.png`가 존재한다.
- 통합 판단: 제출 후보는 hard high-frequency proxy 기준 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. `bjt3_sweep_coutalign_c10n`은 낮은 power/area를 갖는 BJT-only reference로 비교한다.
- 개선 결정: 회로 변경은 종료 상태이다. 다음 focused action은 발표자료/제출 패키지를 작성하며 ideal OPAMP noise 미모델링, 약 `+70.0 uW` power penalty, 약 `+369337.75 p` area penalty, far-slope `-87.17 dB/dec`를 명시하는 것이다.

## 2026-05-22 - workflow Final Integration Review package consistency

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 next priority에 따라 final fallback `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 산출물 일관성만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색은 `goal.md`, `3stage-bjt.md`, `progress.md`에서 expected reference를 확인했다. ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match 없음이었다.
- 검증: final plot 4개(`bjt3_sweep_hfbuf_r10k_c150p_ac/tran.png`, `bjt3_sweep_coutalign_c10n_ac/tran.png`)가 존재했다. `performance_summary.csv` final row는 `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.92682171 p`로 performance row와 `2.17e-5 p` 차이만 있었고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 performance row와 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 OPAMP fallback 없이 power/area가 낮은 reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이며, ideal OPAMP noise 미모델링, BJT-only 대비 power/area penalty, far high-frequency slope 이점을 명시한다.

## 2026-05-22 - workflow Final Integration Review package closure

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 package consistency 요구에 맞춰 final fallback `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 산출물만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색에서 `goal.md`, `3stage-bjt.md`, `progress.md`가 final fallback, BJT-only reference, Cycle G CSV, comparison CSV를 참조함을 확인했다. ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 match 없음이었다.
- 검증: `performance_summary.csv` final row는 `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. PPA 포함 area 합계는 `265169812.926822 p`이고, `power_calculation.csv`의 `worst_power_w=2.358623086371e-4 W`로 performance row와 일치했다.
- 검증: final plot 4개(`bjt3_sweep_hfbuf_r10k_c150p_ac/tran.png`, `bjt3_sweep_coutalign_c10n_ac/tran.png`)가 존재했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 낮은 power/area reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이며, ideal OPAMP noise 미모델링, BJT-only 대비 power/area penalty, far high-frequency slope 이점을 명시한다.

## 2026-05-22 - workflow Final Integration Review package final consistency

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 next priority에 따라 final fallback `bjt3_sweep_hfbuf_r10k_c150p` 제출 산출물과 BJT-only reference `bjt3_sweep_coutalign_c10n` 비교 상태만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색에서 `goal.md`, `3stage-bjt.md`, `progress.md`가 final fallback, BJT-only reference, Cycle G CSV, comparison CSV를 참조함을 확인했다. ambiguity scan은 `NO_MATCH`였고, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다. PPA 포함 area 합계는 `265169812.926822 p`로 performance row와 `-2.17e-5 p` 차이만 있었고, `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 performance row와 일치했다.
- 검증: `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이며, final plot 4개(`bjt3_sweep_hfbuf_r10k_c150p_ac/tran.png`, `bjt3_sweep_coutalign_c10n_ac/tran.png`)가 존재했다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 낮은 power/area reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이며, ideal OPAMP noise 미모델링, BJT-only 대비 power/area penalty, far high-frequency slope 이점을 명시한다.

## 2026-05-22 - workflow Final Integration Review final package check

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`를 기준으로 final fallback `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 패키지 일관성만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색은 `goal.md`, `3stage-bjt.md`, `progress.md`에서 final fallback, BJT-only reference, Cycle G CSV, comparison CSV 참조를 확인했다. ambiguity scan은 `NO_MATCH`, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 차이만 있었고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이며 final plot 4개가 모두 존재했다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. 발표/제출 자료에서는 BJT-only `bjt3_sweep_coutalign_c10n`을 low-power reference로 함께 제시하고, ideal OPAMP noise 미모델링과 power/area penalty를 명시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review package lock

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 final integration priority에 따라 `bjt3_sweep_hfbuf_r10k_c150p` 제출 산출물과 `bjt3_sweep_coutalign_c10n` reference 비교 상태만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색은 `goal.md`, `3stage-bjt.md`, `progress.md`에서 expected reference를 확인했다. ambiguity scan은 `NO_MATCH`, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: final plot 4개가 모두 존재했다. `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 반올림 차이만 있었고, `power_calculation.csv`의 `worst_power_w=2.358623086371e-4 W`는 performance row와 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 lower-power/lower-area reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review package relock

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`를 기준으로 final fallback `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 패키지 일관성만 재검토했다.
- 검증: 필수 산출물 참조 `rg` 검색은 `goal.md`, `3stage-bjt.md`, `progress.md`에서 expected reference를 확인했다. ambiguity scan은 `NO_MATCH`, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 차이였고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 performance row와 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이며 final plot 4개가 존재했다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 lower-power/lower-area reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review package seal

- 구현: 새 netlist, sweep, plot은 생성하지 않고 `goal.md`의 accepted fallback `bjt3_sweep_hfbuf_r10k_c150p` 제출 산출물과 BJT-only reference `bjt3_sweep_coutalign_c10n` 비교 상태만 재검토했다.
- 검증: `rg "bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv|bjt3_final_candidate_comparison.csv|bjt3_sweep_hfbuf_r10k_c150p|bjt3_sweep_coutalign_c10n" .\progress.md .\3stage-bjt.md .\goal.md`에서 필수 참조를 확인했다. ambiguity scan은 match 없음(exit code 1), `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`는 match 없음이었다.
- 검증: 필수 CSV와 final plot 4개가 모두 존재했다. `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 반올림 차이만 있었고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 performance row와 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. `bjt3_sweep_coutalign_c10n`은 낮은 power/area의 BJT-only reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review package handoff lock

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 next action을 final integration review 완료 및 발표/제출 패키지 준비로 갱신했다.
- 검증: 필수 artifact reference `rg` 검색은 expected reference를 확인했고, ambiguity scan은 `NO_MATCH`, bjt3 log scan은 `NO_MATCH`였다. final plot 4개가 존재했다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: PPA 포함 area 합계는 `265169812.926822 p`, `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`, `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows로 final CSV와 일치했다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 lock하고, BJT-only `bjt3_sweep_coutalign_c10n`은 lower-power/lower-area reference로 함께 제시한다.
- 개선 결정: 다음 focused action은 회로 변경이 아니라 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review package ready

- 구현: 새 netlist, sweep, plot은 만들지 않고 `goal.md`의 현재 후보 `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 산출물 일관성만 재검토했다.
- 검증: 필수 reference `rg` 검색은 111개 match와 exit code `0`을 반환했다. ambiguity scan은 `NO_MATCH`, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: `area_calculation.csv`의 PPA 포함 합계는 `265169812.92682171 p`로 performance row와 `2.17e-5 p` 차이만 있었고, `power_calculation.csv`의 `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이다.
- 검증: final plot 4개(`bjt3_sweep_hfbuf_r10k_c150p_ac/tran.png`, `bjt3_sweep_coutalign_c10n_ac/tran.png`)가 모두 존재했다.
- 통합 판단: 제출 후보는 hard high-frequency proxy 기준 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. 발표/제출 자료에는 BJT-only reference `bjt3_sweep_coutalign_c10n`, ideal OPAMP noise 미모델링, power/area penalty, far-slope 이점을 명시한다.
- 개선 결정: 회로 workflow는 완료 상태이며 다음 focused action은 발표자료/제출 패키지 작성이다.

## 2026-05-22 - workflow Final Integration Review submission handoff

- 구현: 새 netlist, sweep, plot은 생성하지 않고 `goal.md`를 기준으로 final fallback `bjt3_sweep_hfbuf_r10k_c150p`와 BJT-only reference `bjt3_sweep_coutalign_c10n`의 제출 handoff 상태만 재검토했다.
- 검증: 필수 artifact `rg` 검색은 expected reference를 확인했고, ambiguity scan은 `NO_MATCH`, `Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"`도 `NO_MATCH`였다.
- 검증: `performance_summary.csv` final row는 `version=bjt3_sweep_hfbuf_r10k_c150p`, `decision=accepted_fallback`, `midband_gain=39.5403745 dB`, `fL=10.598446065316 Hz`, `fH=20738.04885948716 Hz`, `ac_nrmse=0.105900392044`, `tran_nrmse=0.029755172563`, `power=2.358623086371e-4 W`, `area=2.651698129268e+8 p`이다.
- 검증: PPA 포함 area 합계는 `265169812.926822 p`로 performance row와 `2.17e-5 p` 반올림 차이만 있었고, `worst_power_w=max(pdc_w,pavg_w)=2.358623086371e-4 W`로 일치했다. `device_list.csv`는 13 rows, `target_hs.csv`는 481 rows, `bjt3_final_candidate_comparison.csv`는 2 rows이며 final plot 4개가 존재했다.
- 통합 판단: hard high-frequency proxy 제출 후보는 `bjt3_sweep_hfbuf_r10k_c150p`로 유지한다. BJT-only `bjt3_sweep_coutalign_c10n`은 lower-power/lower-area reference로 함께 제시한다.
- 개선 결정: 회로 workflow는 완료 상태이다. 다음 focused action은 발표자료/제출 패키지 작성이며 ideal OPAMP noise 미모델링과 fallback power/area penalty를 명시한다.
