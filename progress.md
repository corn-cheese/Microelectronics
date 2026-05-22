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
