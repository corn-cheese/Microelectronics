# Codex Max Run Master Workflow: 3-Stage BJT Amplifier

이 문서는 `D:\Codex\Support`에서 `codex.cmd exec`에 그대로 넘겨 반복 실행할 수 있는 master workflow prompt이다. 한 번의 run은 현재 파일과 결과 산출물만 읽고, 다음으로 필요한 **하나의 구현-검증-개선 단위**만 수행한다.

실행 예:

```powershell
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
Get-Content -Raw -Encoding UTF8 .\workflow.md | codex.cmd exec --cd D:\Codex\Support -
```

권장 실행 예:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Runs 1
```

반복 실행 예:

```powershell
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
1..7 | ForEach-Object {
  Write-Host "=== workflow run $_ ===" -ForegroundColor Cyan
  Get-Content -Raw -Encoding UTF8 .\workflow.md | codex.cmd exec --cd D:\Codex\Support -
}
```

권장 반복 실행 예:

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_workflow_maxrun.ps1 -Runs 7
```

`codex maxrun`이라는 별도 subcommand를 가정하지 않는다. 이 프로젝트의 검증된 자동화 방식은 `codex.cmd exec --cd <root> -`에 prompt를 stdin으로 넘기는 형식이다. `codex.cmd exec --cd D:\Codex\Support (Get-Content -Raw .\workflow.md)`처럼 파일 전체를 명령 인자로 펼치면 Windows에서 "명령줄이 너무 깁니다" 오류가 날 수 있으므로 사용하지 않는다.

## 0. 역할과 목표

너는 `D:\Codex\Support`에서 실행되는 Codex run이다. 목표는 `3stage-bjt.md` 기반의 SKY130 3-stage NPN BJT common-emitter neural signal amplifier를 구현, 검증, 개선하는 것이다.

매 run의 기본 원칙:

- 이전 대화 기억을 source of truth로 쓰지 않는다.
- 반드시 파일, netlist, log, CSV, plot 같은 로컬 산출물을 읽고 판단한다.
- 한 run에서는 하나의 문제군만 다룬다.
- 구현, 검증, 개선을 같은 문단에서 섞지 않는다.
- 통과한 결과만 `progress.md`에 완료로 기록한다.
- 실패한 결과는 실패 사실, 실패 파일, 다음 수정 후보를 기록한다.
- 기존 `netlists/`와 `results/` 파일을 삭제하지 않는다.
- 기존 사용자 변경을 되돌리지 않는다.

## 1. Source of Truth

run 시작 직후 아래 파일과 목록을 읽는다.

```powershell
Get-Content -Raw -Encoding UTF8 .\전자회로프로젝트.md
Get-Content -Raw -Encoding UTF8 .\progress.md
Get-Content -Raw -Encoding UTF8 .\3stage-bjt.md
rg --files .\netlists .\results\ngspice
```

현재 cycle에 직접 관련된 netlist, log, table만 추가로 읽는다. 전체 결과 CSV나 raw 파일을 무리하게 모두 열지 않는다.

충돌 시 우선순위:

1. `전자회로프로젝트.md`의 과제 요구사항
2. `results/ngspice/`와 `netlists/`의 실제 검증 결과
3. `progress.md`의 최신 진행 기록
4. `3stage-bjt.md`의 설계 가정
5. `project.md`, `plan.md`, `maxrun/` 문서의 보조 설명

최신 확정 기준:

- Supply는 `5 V`.
- 기준 전압과 입력 common-mode는 `2.5 V`.
- 입력 small-signal은 `1 mV`.
- 목표 midband gain은 약 `40 dB`, 즉 `100 V/V`.
- 목표 bandwidth는 `10 Hz` to `20 kHz`.
- 저주파와 고주파 roll-off 목표는 양쪽 약 `80 dB/decade`.
- 최종 load는 `10 pF`.
- resistor cell 기록 기준은 `sky130_fd_pr_main / res_high_po_5p73`.
- BJT 검증 netlist는 전체 `.lib sky130.lib.spice tt`가 아니라 direct include 방식을 기본으로 쓴다.

검증된 BJT include:

```spice
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"
```

검증된 NPN instance 형식:

```spice
XQ1 collector base emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
```

공통 ngspice 실행 형식:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\<name>.log .\netlists\<name>.spice
```

공통 로그 검증:

```powershell
Select-String .\results\ngspice\logs\<name>.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

`Warning: Model issue` 형태의 PDK parameter warning은 기존 통과 log에도 존재하므로 단독 실패 사유로 보지 않는다. 위 공통 로그 검증에서 match가 있으면 실패로 기록한다.

## 2. Context Isolation Rules

각 run은 다음 세부 단계를 순서대로 수행한다.

### 2.1 구현 단계

목표:

- 이번 run의 대상 파일만 생성하거나 수정한다.
- 이전 검증 결과에서 이미 확정된 값만 사용한다.
- 새 설계 후보를 여러 개 동시에 만들지 않는다.

읽을 파일:

- 이번 cycle의 source 문서
- 직전 cycle의 summary CSV
- 직전 cycle의 log scan 결과

하지 않을 일:

- 이번 cycle 대상이 아닌 netlist를 고치지 않는다.
- failed log를 길게 해석하며 설계를 바꾸지 않는다.
- area, power, plot, report 산출물을 앞당겨 만들지 않는다.

전달 산출물:

- 생성 또는 수정한 netlist/document
- 실행 명령
- 다음 검증 단계가 읽을 파일명

### 2.2 검증 단계

목표:

- 방금 만든 산출물만 실행하거나 검사한다.
- pass/fail을 숫자, log, CSV로 판단한다.
- 검증 도중 새 회로값을 즉석에서 바꾸지 않는다.

읽을 파일:

- 이번 cycle에서 생성한 netlist
- 이번 cycle에서 생성한 log/raw/csv/table
- 비교가 필요한 직전 baseline summary

하지 않을 일:

- 검증 실패를 숨기지 않는다.
- 실패한 netlist를 같은 검증 단계에서 여러 번 무리하게 고치지 않는다.
- 통과하지 않은 결과를 `progress.md`에 완료로 쓰지 않는다.

전달 산출물:

- log scan 결과
- summary CSV
- pass/fail 판단 문장

### 2.3 개선 단계

목표:

- 실패 원인을 하나의 문제군으로 분류한다.
- 다음 run에서 수행할 수정 후보를 하나만 정한다.
- 통과한 결과가 있으면 `3stage-bjt.md`와 `progress.md`에 짧게 반영한다.

문제군:

- `environment_model`: include path, subckt, ngspice 실행 문제
- `dc_bias`: VBE, VCE, rail 고착, stage bias 분리 문제
- `ac_gain_bandwidth`: gain, cutoff, roll-off, phase 문제
- `transient_waveform`: clipping, swing, center, settling 문제
- `load_10pf`: 10 pF load gain loss, upper cutoff shift, ringing 문제
- `ppa_documentation`: area, power, device list, report table 문제

전달 산출물:

- `progress.md`의 짧은 cycle 기록
- `3stage-bjt.md`의 보정된 설계 가정
- 다음 run 대상 cycle 이름

## 3. Current-State Detection

run마다 아래 순서로 현재 상태를 판정하고, 가장 먼저 걸리는 cycle 하나만 수행한다.

1. `3stage-bjt.md`가 기존 검증 결과와 충돌하면 Cycle A를 수행한다.
2. `netlists/bjt3_op.spice` 또는 `results/ngspice/tables/bjt3_op_summary.csv`가 없으면 Cycle B를 수행한다.
3. `bjt3_op` log scan이 실패했거나 summary에서 DC gate를 통과하지 못하면 Cycle B 개선 run을 수행한다.
4. `netlists/bjt3_ac.spice` 또는 `results/ngspice/tables/bjt3_ac_summary.csv`가 없으면 Cycle C를 수행한다.
5. `bjt3_ac` log scan이 실패했거나 gain/bandwidth gate를 통과하지 못하면 Cycle C 개선 run을 수행한다.
6. `netlists/bjt3_tran.spice` 또는 `results/ngspice/tables/bjt3_tran_summary.csv`가 없으면 Cycle D를 수행한다.
7. `bjt3_tran` log scan이 실패했거나 transient gate를 통과하지 못하면 Cycle D 개선 run을 수행한다.
8. `netlists/bjt3_load10p_ac.spice`, `netlists/bjt3_load10p_tran.spice`, 또는 해당 summary CSV가 없으면 Cycle E를 수행한다.
9. `bjt3_load10p` 결과가 unloaded baseline 대비 허용 범위를 벗어나면 Cycle E 개선 run을 수행한다.
10. final candidate가 아직 정해지지 않았고 sweep 기록이 부족하면 Cycle F를 수행한다.
11. final candidate가 정해졌지만 device/area/power/performance 산출물이 없으면 Cycle G를 수행한다.
12. 모든 산출물이 있으면 final integration review를 수행하고 종료한다.

`3stage-bjt.md` 충돌 판정 기준:

- `RC 105k`가 시작값으로 남아 있고 실제 검증 baseline `RC=100k`가 반영되지 않았다.
- coupling cap 시작값이 `470 nF`만으로 남아 있고 실제 1-stage/2-stage 검증의 `1u` 시작점이 반영되지 않았다.
- 출력이 검증 없이 `2.5 V centered`라고 단정되어 있다.
- 전체 `.lib sky130.lib.spice tt`를 기본 검증 경로처럼 말한다.
- `npn_05v5` 4-pin subckt 형식이 명시되어 있지 않다.
- `10 pF` load가 unloaded baseline 이후 비교 gate로 분리되어 있지 않다.

## 4. Cycle A: `3stage-bjt.md` 검증 반영 보정

목표:

- 기존 1-stage/2-stage 구현-검증 중 발생한 문제와 확인된 baseline을 `3stage-bjt.md`에 반영한다.
- 회로 netlist는 생성하지 않는다.

수정 대상:

- `3stage-bjt.md`
- `progress.md`

반영할 확정 내용:

- 시작값은 `RC=100k`, `RE=20k`, `RB_TOP=330k`, `RB_BOT=100k`.
- coupling capacitor 시작점은 `CIN=1u`, `C12=1u`, `C23=1u`.
- output coupling/rebias는 검증 대상이며, CE3 collector가 자동으로 `2.5 V centered`가 아니다.
- 1-stage 검증 수치:
  - `1 kHz AC gain = 4.48219 V/V`
  - `1 kHz AC gain = 13.0298 dB`
  - transient gain `4.485 V/V`
  - output center 약 `3.365835 V`
- 2-stage OP 검증 수치:
  - stage 1 `VBE=0.793688 V`, `VCE=3.030645 V`
  - stage 2 `VBE=0.793688 V`, `VCE=3.030309 V`
  - `vout_final=3.365828 V`
  - `Istatic=56.1394 uA`
  - `PDC=280.697 uW`
- 전체 `.lib sky130.lib.spice tt`는 known failing path로 기록하고, direct include를 기본으로 둔다.
- `CH1/CH2/CH3`는 고정 초기값이 아니라 high-frequency pole sweep 후보로 둔다.
- 10 pF load는 unloaded `bjt3_ac/tran` 통과 뒤 `bjt3_load10p_ac/tran`에서 비교한다.

검증 명령:

```powershell
rg "RC.*100k|RE.*20k|330k|100k|1u|nonfet.spice|npn_05v5_W1p00L1p00|bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|10 pF" .\3stage-bjt.md
$ambiguous = @("TO"+"DO", "TB"+"D", "나"+"중", "적"+"절히", "미"+"정")
rg ($ambiguous -join "|") .\3stage-bjt.md .\progress.md
```

통과 기준:

- 위 첫 번째 검색이 핵심 항목을 모두 찾는다.
- 두 번째 검색 결과가 비어 있다.
- `3stage-bjt.md`가 검증된 baseline과 충돌하지 않는다.

progress 기록 형식:

```markdown
## 2026-05-22 - workflow Cycle A

- 구현: `3stage-bjt.md`를 1-stage/2-stage 검증 결과 기준으로 보정했다.
- 검증: baseline 값, direct include, 4-pin NPN subckt, unloaded/load 분리 gate를 문서에서 확인했다.
- 개선 결정: 다음 run은 `bjt3_op.spice` 생성과 DC operating point 검증이다.
```

## 5. Cycle B: `bjt3_op.spice` 구현 및 DC 검증

목표:

- 3-stage NPN CE amplifier의 DC operating point netlist를 생성하고 실행한다.
- 각 stage가 독립 bias를 가지며 coupling capacitor가 DC를 차단하는지 확인한다.

수정 대상:

- Create or modify: `netlists/bjt3_op.spice`
- Create or modify: `results/ngspice/tables/bjt3_op_summary.csv`
- Append only: `progress.md`
- Pass result only: `3stage-bjt.md`

시작 netlist 구조:

```spice
* SKY130 BJT 3-stage DC operating point sanity check
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"

.option savecurrents
.option klu
.option reltol=1e-4

.param VDD=5

VDD vdd 0 {VDD}

RB1_TOP vdd b1_base 330k
RB1_BOT b1_base 0 100k
RC1 vdd b1_collector 100k
RE1 b1_emitter 0 20k
XQ1 b1_collector b1_base b1_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1

C12 b1_collector b2_base 1u

RB2_TOP vdd b2_base 330k
RB2_BOT b2_base 0 100k
RC2 vdd b2_collector 100k
RE2 b2_emitter 0 20k
XQ2 b2_collector b2_base b2_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1

C23 b2_collector b3_base 1u

RB3_TOP vdd b3_base 330k
RB3_BOT b3_base 0 100k
RC3 vdd b3_collector 100k
RE3 b3_emitter 0 20k
XQ3 b3_collector b3_base b3_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1

VOUT_ALIAS vout_final b3_collector 0
RLOAD_OP vout_final 0 1G

.control
set noaskquit
op
print v(vdd)
print v(b1_base) v(b1_emitter) v(b1_collector)
print v(b2_base) v(b2_emitter) v(b2_collector)
print v(b3_base) v(b3_emitter) v(b3_collector) v(vout_final)
print v(b1_base)-v(b1_emitter) v(b1_collector)-v(b1_emitter)
print v(b2_base)-v(b2_emitter) v(b2_collector)-v(b2_emitter)
print v(b3_base)-v(b3_emitter) v(b3_collector)-v(b3_emitter)
print v(b1_collector)-v(b2_base)
print v(b2_collector)-v(b3_base)
print i(vdd)
write D:/Codex/Support/results/ngspice/raw/bjt3_op.raw
quit
.endc

.end
```

실행:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt3_op.log .\netlists\bjt3_op.spice
Select-String .\results\ngspice\logs\bjt3_op.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

summary CSV columns:

```text
metric,value,unit,notes
```

필수 metric:

```text
vdd
b1_base,b1_emitter,b1_collector
b2_base,b2_emitter,b2_collector
b3_base,b3_emitter,b3_collector
vout_final
vbe1,vce1
vbe2,vce2
vbe3,vce3
interstage12_dc_delta
interstage23_dc_delta
ivdd
istatic
pdc
log_scan
decision
```

DC pass 기준:

- ngspice exit code가 `0`.
- 공통 로그 검증 결과가 비어 있다.
- 각 stage의 `VBE`가 약 `0.6 V` to `0.9 V`.
- 각 stage의 collector가 `0 V` 또는 `5 V` rail에 붙지 않는다.
- 각 stage의 `VCE`가 transient swing을 설명할 만큼 남아 있다. 시작 gate는 `VCE > 1.0 V`.
- `interstage12_dc_delta`와 `interstage23_dc_delta`가 0에 가까운 short처럼 보이지 않는다.
- `istatic`과 `pdc`를 기록한다.

실패 개선 후보:

- `environment_model`: include path, subckt 이름, `mult` 표기 확인.
- `dc_bias`: base divider, `RC`, `RE` 중 하나의 family만 다음 run 후보로 선정.
- floating node: coupling capacitor 양쪽 DC path와 `RLOAD_OP` 확인.

## 6. Cycle C: `bjt3_ac.spice` 구현 및 unloaded AC 검증

목표:

- unloaded 3-stage AC response를 확인한다.
- 1 kHz midband gain, phase, cutoff 후보, passband shape를 기록한다.

수정 대상:

- Create or modify: `netlists/bjt3_ac.spice`
- Create or modify: `results/ngspice/csv/bjt3_ac.csv`
- Create or modify: `results/ngspice/tables/bjt3_ac_summary.csv`
- Append only: `progress.md`
- Pass result only: `3stage-bjt.md`

시작 netlist 차이점:

- `VIN vin 0 DC {VCM} AC 1`을 사용한다.
- `CIN vin b1_base 1u`를 추가한다.
- Stage 1, 2, 3 bias와 coupling은 통과한 `bjt3_op.spice`와 같은 값을 사용한다.
- `RLOAD_AC vout_final 0 1G`를 사용한다.
- `10 pF` load는 넣지 않는다.

control block:

```spice
.control
set noaskquit
set wr_singlescale
set wr_vecnames
op
ac dec 50 1 1Meg
let gain = v(vout_final)/v(vin)
let gain_vv = mag(gain)
let gain_db = db(gain)
let phase_deg = ph(gain)
meas ac midgain_vv find gain_vv at=1000
meas ac midgain_db find gain_db at=1000
meas ac phase_1k_deg find phase_deg at=1000
wrdata D:/Codex/Support/results/ngspice/csv/bjt3_ac.csv gain_vv gain_db phase_deg
write D:/Codex/Support/results/ngspice/raw/bjt3_ac.raw frequency v(vin) v(b1_base) v(b1_collector) v(b2_collector) v(b3_collector) v(vout_final) gain gain_vv gain_db phase_deg
quit
.endc
```

실행:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt3_ac.log .\netlists\bjt3_ac.spice
Select-String .\results\ngspice\logs\bjt3_ac.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

summary CSV 필수 metric:

```text
midgain_vv
midgain_db
phase_1k_deg
frequency_points
estimated_lower_cutoff_hz
estimated_upper_cutoff_hz
passband_ripple_db
log_scan
decision
```

AC pass 기준:

- ngspice exit code가 `0`.
- 공통 로그 검증 결과가 비어 있다.
- 1 kHz gain이 목표 `40 dB` 근처이다. 시작 gate는 `35 dB <= midgain_db <= 45 dB`.
- phase는 3-stage CE 반전을 설명할 수 있도록 기록한다.
- cutoff와 ripple은 아직 최종 값이 아니어도 CSV에 기록한다.

실패 개선 후보:

- gain 부족 또는 과다: `RC/RE` family 중 하나만 다음 run 후보로 선정.
- low-frequency droop: `CIN/C12/C23` family만 다음 run 후보로 선정.
- high-frequency 문제: parasitic/load 없는 unloaded baseline인지 먼저 확인한다.

## 7. Cycle D: `bjt3_tran.spice` 구현 및 unloaded transient 검증

목표:

- unloaded 상태에서 `1 mV`, `1 kHz` 입력에 대한 출력 swing과 clipping을 확인한다.
- AC gain과 transient gain이 서로 설명 가능한지 비교한다.

수정 대상:

- Create or modify: `netlists/bjt3_tran.spice`
- Create or modify: `results/ngspice/csv/bjt3_tran.csv`
- Create or modify: `results/ngspice/tables/bjt3_tran_summary.csv`
- Append only: `progress.md`
- Pass result only: `3stage-bjt.md`

시작 netlist 차이점:

```spice
.param VDD=5
.param VCM=2.5
.param VIN_AMP=1m
.param FIN=1k

VDD vdd 0 {VDD}
VIN vin 0 SIN({VCM} {VIN_AMP} {FIN})
CIN vin b1_base 1u
```

control block:

```spice
.control
set noaskquit
set wr_singlescale
set wr_vecnames
op
tran 1u 10m 0 1u
meas tran out_max max v(vout_final) from=5m to=10m
meas tran out_min min v(vout_final) from=5m to=10m
meas tran vin_max max v(vin) from=5m to=10m
meas tran vin_min min v(vin) from=5m to=10m
wrdata D:/Codex/Support/results/ngspice/csv/bjt3_tran.csv v(vin) v(b1_base) v(b1_collector) v(b2_collector) v(b3_collector) v(vout_final) i(vdd)
write D:/Codex/Support/results/ngspice/raw/bjt3_tran.raw
quit
.endc
```

실행:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt3_tran.log .\netlists\bjt3_tran.spice
Select-String .\results\ngspice\logs\bjt3_tran.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

summary CSV 필수 metric:

```text
out_max
out_min
out_pp
vin_max
vin_min
vin_pp
tran_gain_vv
output_center
clipping_margin_low
clipping_margin_high
log_scan
decision
```

transient pass 기준:

- ngspice exit code가 `0`.
- 공통 로그 검증 결과가 비어 있다.
- `vin_pp`는 약 `0.002 V`.
- `out_pp`는 목표 `100 V/V` 기준 약 `0.2 Vpp`에 가깝다. 시작 gate는 `0.10 Vpp <= out_pp <= 0.30 Vpp`.
- `out_min > 0.2 V`, `out_max < 4.8 V`.
- waveform이 rail에 붙는 clipping 형태가 아니다.
- 3-stage CE 반전에 따른 signed waveform 관계를 기록한다.

실패 개선 후보:

- clipping: gain 분산, CE3 collector bias, `RC/RE` family 중 하나만 선택.
- gain은 맞지만 center가 불리함: output coupling/rebias 후보를 다음 run으로 선정.
- transient gain과 AC gain이 크게 다름: coupling capacitor와 startup settling 구간을 확인한다.

## 8. Cycle E: 10 pF load 구현 및 검증

목표:

- 최종 평가 조건인 `10 pF` load를 붙인 AC/transient 결과를 unloaded baseline과 비교한다.

수정 대상:

- Create or modify: `netlists/bjt3_load10p_ac.spice`
- Create or modify: `netlists/bjt3_load10p_tran.spice`
- Create or modify: `results/ngspice/csv/bjt3_load10p_ac.csv`
- Create or modify: `results/ngspice/csv/bjt3_load10p_tran.csv`
- Create or modify: `results/ngspice/tables/bjt3_load10p_ac_summary.csv`
- Create or modify: `results/ngspice/tables/bjt3_load10p_tran_summary.csv`
- Append only: `progress.md`
- Pass result only: `3stage-bjt.md`

구현 원칙:

- `bjt3_ac.spice`와 `bjt3_tran.spice`에서 통과한 회로값을 복사한다.
- 최종 output node에만 아래 load를 추가한다.

```spice
CLOAD_10P vout_final 0 10p
```

실행:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt3_load10p_ac.log .\netlists\bjt3_load10p_ac.spice
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt3_load10p_tran.log .\netlists\bjt3_load10p_tran.spice
Select-String .\results\ngspice\logs\bjt3_load10p_ac.log -Pattern "can't find|unknown|fatal|singular|error|failed"
Select-String .\results\ngspice\logs\bjt3_load10p_tran.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

비교 summary 필수 metric:

```text
unloaded_midgain_db
loaded_midgain_db
load_gain_delta_db
unloaded_upper_cutoff_hz
loaded_upper_cutoff_hz
upper_cutoff_delta_hz
loaded_out_pp
loaded_output_center
ringing_or_clipping
decision
```

load pass 기준:

- AC와 transient 모두 ngspice exit code가 `0`.
- 두 log scan 결과가 비어 있다.
- loaded midband gain이 unloaded 대비 `3 dB` 이상 무너지지 않는다.
- upper cutoff가 목표 `20 kHz`를 설명할 수 없는 수준으로 낮아지지 않는다.
- transient에서 ringing, clipping, 과도한 settling delay가 뚜렷하지 않다.

실패 개선 후보:

- `load_10pf`: CE3 `RC/RE`, CE3 bias current, load-isolation resistor 중 하나만 다음 run 후보로 둔다.
- BJT-only 구조가 방어하기 어려울 때만 OPAMP follower fallback을 별도 후보로 기록한다.
- OPAMP fallback을 평가하더라도 main gain path가 아니라 final load buffer로만 둔다.

## 9. Cycle F: Parameter Sweep 및 후보 개선

목표:

- 통과한 baseline에서 한 가지 family만 sweep하여 PPA와 성능을 비교한다.
- accepted/rejected candidate를 같은 schema로 남긴다.

수정 대상:

- Create or modify: `results/ngspice/tables/bjt3_sweep_summary.csv`
- Create or modify: selected sweep netlists under `netlists/`
- Append only: `progress.md`
- Accepted result only: `3stage-bjt.md`

한 run에서 선택 가능한 sweep family는 하나이다.

1. `gain_headroom`: `RC`, `RE`
2. `bias_power`: base divider scale, BJT multiplier
3. `low_cutoff_area`: `CIN`, `C12`, `C23`
4. `load_drive`: CE3 `RC/RE`, output isolation
5. `high_cutoff_shape`: output pole capacitor, load interaction
6. `output_rebias`: CE3 collector direct output vs AC coupling + 2.5 V rebias

sweep summary CSV columns:

```text
version,changed_family,changed_values,midgain_db,lower_cutoff_hz,upper_cutoff_hz,passband_ripple_db,out_pp,output_center,load_gain_delta_db,istatic_a,pdc_w,estimated_area_note,decision,notes
```

decision 값:

```text
accepted
rejected_gain
rejected_headroom
rejected_load
rejected_transient
rejected_power
rejected_area
```

개선 pass 기준:

- accepted row가 있으면 해당 값만 `3stage-bjt.md`의 현재 후보로 반영한다.
- rejected row는 삭제하지 않고 실패 이유를 `notes`에 남긴다.
- 한 run에서 여러 family를 동시에 바꾸지 않는다.

## 10. Cycle G: Final Metrics and Deliverables

목표:

- final candidate의 제출용 device, area, power, target H(s), performance summary를 생성한다.

수정 대상:

- Create or modify: `results/ngspice/tables/device_list.csv`
- Create or modify: `results/ngspice/tables/area_calculation.csv`
- Create or modify: `results/ngspice/tables/power_calculation.csv`
- Create or modify: `results/ngspice/tables/target_hs.csv`
- Create or modify: `results/ngspice/tables/performance_summary.csv`
- Create or modify: final plot files under `results/ngspice/plots/`
- Append only: `progress.md`
- Pass result only: `3stage-bjt.md`

`device_list.csv` columns:

```text
version,component,logical_role,library_cell,value,geometry,count,source_netlist,ppa_included,notes
```

`area_calculation.csv` columns:

```text
component,logical_role,library_cell,value,geometry,area_formula,area_p,ppa_included,notes
```

`power_calculation.csv` columns:

```text
version,vdd_v,static_current_a,pdc_w,transient_avg_current_a,pavg_w,worst_power_w,notes
```

`target_hs.csv` columns:

```text
frequency_hz,target_gain_vv,target_gain_db,target_phase_deg,weight
```

Target H(s):

```text
Gmid = 100
fL = 10
fH = 20000
target_gain_vv(f) = Gmid / sqrt(1 + (fL / f)^8) / sqrt(1 + (f / fH)^8)
target_gain_db(f) = 20 * log10(target_gain_vv(f))
target_phase_deg(f) = 4 * atan(fL / f) * 180/pi - 4 * atan(f / fH) * 180/pi
```

3-stage CE output inversion is handled in phase/transient notes. AC nRMSE uses magnitude in dB as the primary comparison.

`performance_summary.csv` columns:

```text
version,load_pf,midband_gain_db,lower_cutoff_hz,upper_cutoff_hz,low_rolloff_db_dec,high_rolloff_db_dec,passband_ripple_db,ac_nrmse,tran_nrmse,power_w,area_p,decision,notes
```

final deliverable pass 기준:

- final candidate row exists in every required CSV.
- `worst_power_w = max(pdc_w, pavg_w)`.
- final AC and transient plots use the same data cited in CSV.
- OPAMP fallback row, if evaluated and rejected, has `ppa_included=false`.
- final selected candidate has `ppa_included=true` for all active amplifier components.

## 11. Final Integration Review

모든 cycle 산출물이 있으면 새 회로를 만들지 않고 통합 검토만 수행한다.

검증 명령:

```powershell
rg "bjt3_op|bjt3_ac|bjt3_tran|bjt3_load10p|device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv" .\progress.md .\3stage-bjt.md
$ambiguous = @("TO"+"DO", "TB"+"D", "나"+"중", "적"+"절히", "미"+"정")
rg ($ambiguous -join "|") .\workflow.md .\3stage-bjt.md .\progress.md
Select-String .\results\ngspice\logs\bjt3*.log -Pattern "can't find|unknown|fatal|singular|error|failed"
```

통합 검토 기준:

- 현재 final candidate가 어떤 netlist stem인지 명확하다.
- unloaded baseline과 10 pF loaded result가 분리되어 있다.
- accepted/rejected 후보의 이유가 남아 있다.
- area, power, performance metric이 제출 checklist와 연결된다.
- 발표자료에 옮길 수 있는 gain, bandwidth, transient, load, power, area, nRMSE 수치가 있다.

## 12. Final Response Format for Each Run

각 run의 마지막 응답은 한국어로 짧게 작성한다.

형식:

```text
이번 run: <Cycle 이름>
수정/생성: <파일 목록>
검증: <실행 명령과 pass/fail 근거>
결정: <accepted/rejected/next run>
다음 run: <다음 cycle과 입력 파일>
```

성공을 주장하기 전에 반드시 해당 run에서 실행한 검증 명령과 결과를 읽는다.
