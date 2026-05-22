# Codex Maxrun Reference: `plan.md` 완성 기준

이 파일은 `codex maxrun`을 여러 번 돌릴 때 모든 run이 공통으로 참고할 기준 문서이다. 목표는 상세 회로 설계와 파라미터 튜닝에 들어가기 전에 `plan.md`를 실제 진행 상태와 과제 요구사항에 맞게 완성하는 것이다.

## Source of Truth

반드시 아래 파일을 먼저 읽는다.

- `전자회로프로젝트.md`: 과제 요구사항의 최종 기준
- `plan.md`: 완성해야 하는 실행 계획
- `progress.md`: 이미 수행된 작업과 검증 결과
- `netlists/smoke_sky130.spice`: 통과한 SKY130 smoke test netlist
- `netlists/bjt1_op.spice`: 통과한 BJT 1-stage DC operating point netlist
- `results/ngspice/tables/bjt1_op_summary.csv`: BJT 1-stage OP 수치 요약

`전자회로프로젝트.md`와 `plan.md`가 충돌하면 `전자회로프로젝트.md`를 따른다. 단, 저항 cell은 최신 변경사항인 `res_high_po_5p73`를 우선한다. 과제 문서 본문 표에 남아 있는 `res_xhigh_po_5p73` 표기는 이전 지시로 보고, 최종 계획에는 `res_high_po_5p73`를 기준으로 둔다.

## 현재 확인된 상태

- 작업 루트: `D:\Codex\Support`
- Windows native PowerShell 환경을 기준으로 한다.
- WSL은 사용하지 않는다.
- EDA tool과 PDK는 한글/공백 경로를 피하기 위해 `C:\eda\...` 아래에 둔다.
- 7-Zip 설치 확인 경로: `C:\Program Files\7-Zip\7z.exe`
- ngspice 설치 경로: `C:\eda\ngspice\Spice64\bin`
- batch/console 실행은 `ngspice_con.exe`를 우선 사용한다.
- PDK 경로: `C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr`
- SKY130 모델 파일 존재 확인: `C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice`

## 이미 통과한 검증

### ngspice

`ngspice_con -v` 결과 요약:

```text
ngspice-46
Compiled with KLU Direct Linear Solver
Creation Date: Mar 29 2026 15:02:07
```

### SKY130 smoke test

전체 `sky130.lib.spice`의 `tt` corner include는 현재 ngspice 환경에서 실패했다. 실패 요지는 다음과 같다.

```text
Error in line include "sky130_fd_pr__esd_nfet_05v0_nvt.pm3"
Not enough parameters for i source
ERROR: fatal error in ngspice
```

따라서 BJT 검증 계획에서는 전체 library include 대신 필요한 BJT 관련 파일만 직접 include한다.

```spice
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"
```

확인된 NPN subckt:

```spice
.subckt sky130_fd_pr__npn_05v5_W1p00L1p00 c b e s
```

인스턴스 예:

```spice
XQ1 collector base emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
```

`netlists/smoke_sky130.spice`는 exit code `0`으로 통과했고, `results/ngspice/raw/smoke_sky130.raw`가 생성되었다.

### BJT 1-stage DC operating point

`netlists/bjt1_op.spice`는 exit code `0`으로 통과했고, `results/ngspice/raw/bjt1_op.raw`와 `results/ngspice/tables/bjt1_op_summary.csv`가 생성되었다.

요약 수치:

```text
VDD          = 5.000000 V
base         = 1.129207 V
emitter      = 0.335519 V
collector    = 3.365828 V
VBE1         = 0.793688 V
VCE1         = 3.030309 V
Istatic      = 28.0714 uA
PDC          = 140.357 uW
```

해석:

- BJT는 켜져 있다.
- collector가 rail에 붙지 않았다.
- `VCE1` headroom이 있다.
- 이 값은 sanity check 결과이지 최종 설계 sizing이 아니다.

## `plan.md` 완성 정의

`plan.md`는 상세 설계 전에 다음을 만족해야 한다.

- 이미 완료된 설치, PDK 준비, smoke test, BJT 1-stage OP 결과가 반영되어 있다.
- 더 이상 "현재 ngspice/git이 설치되어 있지 않다" 같은 과거 상태를 현재 상태처럼 말하지 않는다.
- Windows batch 실행 명령은 `ngspice_con.exe` 기준으로 정리되어 있다.
- BJT용 PDK include 방식은 통과한 직접 include 방식을 기준으로 한다.
- `sky130.lib.spice` 전체 include 실패 이유와 우회 기준이 기록되어 있다.
- `bjt1_ac`, `bjt1_tran`, `bjt2_op`, `bjt2_ac`, `bjt2_tran`, `bjt2_load10p_ac`, `bjt2_load10p_tran`, optional buffer 평가 순서가 명확하다.
- 각 netlist가 생성해야 할 raw/csv/log/plot/table 파일 이름이 명시되어 있다.
- AC, transient, area, power, normalized RMSE 계산 기준이 과제 요구사항과 일치한다.
- Candidate A/B 선택 gate가 "왜 buffer를 쓰거나 쓰지 않는지" 설명 가능하게 정리되어 있다.
- 상세 회로 설계 값은 확정하지 않는다. 대신 어떤 sweep과 gate를 통해 확정할지 쓴다.
- 실제로 실행하지 않은 결과를 실행했다고 쓰지 않는다.

## Maxrun 공통 작업 규칙

- 각 run은 `maxrun/MAXRUN_REFERENCE.md`를 먼저 읽고 시작한다.
- 주 작업 대상은 `plan.md`이다.
- `progress.md`는 실제로 새 시뮬레이션이나 검증을 수행했을 때만 추가 기록한다.
- 임의로 `netlists/`나 `results/`의 기존 파일을 삭제하거나 덮어쓰지 않는다.
- 과제 요구사항, 진행 기록, 현재 netlist가 충돌하면 충돌을 명시하고 보수적으로 정리한다.
- 계획 문서 완성이 목적이므로 긴 시뮬레이션을 새로 실행하지 않는다.
- 짧은 확인 명령은 가능하지만, 새 결과를 만들었다면 `progress.md`에도 기록해야 한다.
- 한국어로 작성하고, 경로와 명령은 정확한 코드 블록으로 둔다.
- "TODO", "나중에", "적절히", "필요시"처럼 실행자가 다시 설계해야 하는 표현을 줄인다.

## 과제 요구사항 요약

- 구조: single-ended neural signal amplifier
- Supply: `5 V`
- 기준 전압: `2.5 V`
- 입력: `2.5 V + 1 mV`
- Midband gain: `40 dB`, 약 `100 V/V`
- Target bandwidth: `10 Hz` to `20 kHz`
- Roll-off: 저주파/고주파 양쪽에서 약 `80 dB/decade`
- Load: 최종 출력에 `10 pF`
- 평가: AC response 유사도, transient response 유사도, area, power, presentation
- Performance: target `H(s)` 대비 normalized RMSE가 낮을수록 유리
- 제출물: schematic/testbench netlist, device list, area CSV, power 계산, AC plot PNG, transient plot PNG, target `H(s)` 비교 분석, PPA trade-off 설명, 발표 PDF

## 사용 가능 소자와 area 기준

- OPAMP: `ahdLib` opamp, area `1000p`
- Capacitor: `sky130_fd_pr_main / cap_vpp_11p5x11p7_m1m4_noshield`, area `width x length x multiplier`
- Resistor: `sky130_fd_pr_main / res_high_po_5p73`, area `segment length x segment width x segments`
- Diode: `sky130_fd_pr_main / diode_pd2nw_05v5`, area `width x length x multiplier`
- NPN BJT: `sky130_fd_pr_main / npn_05v5`, area `1p`
- PNP BJT: `sky130_fd_pr_main / pnp_05v5`, area `0.4624p`

## Optional bonus는 별도 취급

가산점 블록은 최대 2점까지 가능하지만 amplifier PPA에는 포함하지 않는다.

- AC-DC converter: 5 Vp-p, 10 kHz ideal AC input에서 5 V DC 출력
- I/O protection: 입력 또는 출력 노드에 대해 0 V to 5 V clamp

`plan.md`의 기본 완성은 amplifier 본 설계 계획을 우선한다. bonus 계획은 시간이 남을 때 별도 appendix로만 둔다.
