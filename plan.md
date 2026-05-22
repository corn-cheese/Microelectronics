# Windows Native SKY130 PDK + ngspice 실행계획

이 문서는 `전자회로프로젝트.md`의 single-ended neural signal amplifier 과제를 Windows native 환경에서 SKY130 PDK와 ngspice로 실행하기 위한 workflow이다. 목표는 ngspice 다운로드부터 PDK 모델 연결, BJT 기반 증폭기 검증, PPA 계산, 최종 결과 도출까지 재현 가능한 순서를 고정하는 것이다.

## 1. 목표와 현재 상태

### 1.1 목표 사양

| 항목 | 목표 |
| --- | --- |
| 구조 | Single-ended amplifier |
| Supply | `VDD = 5 V`, `GND = 0 V` |
| 기준 전압 | `VCM = 2.5 V` |
| 입력 | `2.5 V + 1 mV` small-signal |
| Midband gain | `40 dB`, 약 `100 V/V` |
| 목표 대역 | `10 Hz` - `20 kHz` |
| Roll-off | 저주파/고주파 양쪽에서 약 `80 dB/decade` |
| Load | 최종 출력에 `10 pF` |
| 평가 | AC response 유사도, transient 유사도, area, power |

### 1.2 실행 환경 가정

- Windows native PowerShell을 사용한다.
- WSL은 사용하지 않는다.
- 한글/공백 경로 문제를 피하기 위해 EDA tool과 PDK는 `C:\eda\...` 아래에 둔다.
- 현재 PowerShell 기준으로 `ngspice`와 `git`은 설치되어 있지 않다. 따라서 PDK는 Git clone이 아니라 ZIP 다운로드를 기본 경로로 둔다.

### 1.3 설계 방향

기준 후보는 기존 프로젝트 문서와 맞춰 BJT 중심으로 둔다.

```text
Vin
-> input coupling / high-pass network
-> BJT common-emitter stage 1
-> interstage coupling capacitor + independent stage 2 bias
-> BJT common-emitter stage 2
-> output low-pass network
-> optional OPAMP voltage follower buffer
-> Vout
-> 10 pF load
```

- Candidate A: BJT 2-stage only
- Candidate B: BJT 2-stage + OPAMP voltage follower buffer
- 기본 선택은 Candidate A이다.
- Candidate B는 10 pF load에서 Candidate A가 명확히 실패하거나 심하게 열화될 때만 평가한다.
- OPAMP를 쓰더라도 main gain source가 아니라 final load-driving buffer로만 사용한다.

## 2. 폴더 구조

권장 작업 폴더는 다음과 같다.

```text
C:\eda\
  downloads\
  ngspice\
  sky130\

<project root>\
  plan.md
  netlists\
    smoke_sky130.spice
    bjt1_op.spice
    bjt1_ac.spice
    bjt1_tran.spice
    bjt2_op.spice
    bjt2_ac.spice
    bjt2_tran.spice
    bjt2_load10p_ac.spice
    bjt2_load10p_tran.spice
    bjt2_buffer_ac.spice
    bjt2_buffer_tran.spice
  results\
    ngspice\
      logs\
      raw\
      csv\
      plots\
      tables\
```

생성 명령:

```powershell
New-Item -ItemType Directory -Force C:\eda\downloads
New-Item -ItemType Directory -Force C:\eda\ngspice
New-Item -ItemType Directory -Force C:\eda\sky130
New-Item -ItemType Directory -Force .\netlists
New-Item -ItemType Directory -Force .\results\ngspice\logs
New-Item -ItemType Directory -Force .\results\ngspice\raw
New-Item -ItemType Directory -Force .\results\ngspice\csv
New-Item -ItemType Directory -Force .\results\ngspice\plots
New-Item -ItemType Directory -Force .\results\ngspice\tables
```

## 3. ngspice 설치

### 3.1 7-Zip 설치

ngspice Windows package는 `.7z` 형식이므로 7-Zip이 필요하다.

1. 7-Zip을 설치한다.
2. `C:\Program Files\7-Zip\7z.exe`가 존재하는지 확인한다.

확인 명령:

```powershell
Test-Path "C:\Program Files\7-Zip\7z.exe"
```

예상 결과:

```text
True
```

### 3.2 ngspice 다운로드

2026-05-22 기준 재현성 기준 패키지는 공식 SourceForge의 stable Windows 64-bit archive인 `ngspice-46_64.7z`로 둔다.

- 공식 다운로드 페이지: <https://ngspice.sourceforge.io/download.html>
- ngspice 46 files: <https://sourceforge.net/projects/ngspice/files/ng-spice-rework/46/>
- 직접 다운로드 후보: <https://sourceforge.net/projects/ngspice/files/ng-spice-rework/46/ngspice-46_64.7z/download>

수동 다운로드 후 파일을 다음 위치에 둔다.

```text
C:\eda\downloads\ngspice-46_64.7z
```

PowerShell 다운로드를 사용할 경우:

```powershell
$url = "https://sourceforge.net/projects/ngspice/files/ng-spice-rework/46/ngspice-46_64.7z/download"
$out = "C:\eda\downloads\ngspice-46_64.7z"
Invoke-WebRequest -Uri $url -OutFile $out
```

### 3.3 압축 해제와 PATH 등록

압축 해제:

```powershell
& "C:\Program Files\7-Zip\7z.exe" x C:\eda\downloads\ngspice-46_64.7z -oC:\eda\ngspice
```

ngspice 실행 파일 후보를 찾는다.

```powershell
Get-ChildItem C:\eda\ngspice -Recurse -Filter ngspice.exe
```

일반적으로 다음 형태의 경로가 나온다.

```text
C:\eda\ngspice\Spice64\bin\ngspice.exe
```

현재 세션 PATH 등록:

```powershell
$env:Path = "C:\eda\ngspice\Spice64\bin;$env:Path"
```

사용자 PATH 영구 등록:

```powershell
setx PATH "C:\eda\ngspice\Spice64\bin;%PATH%"
```

새 PowerShell을 열고 설치 확인:

```powershell
where.exe ngspice
ngspice -v
```

통과 기준:

- `where.exe ngspice`가 `C:\eda\ngspice\Spice64\bin\ngspice.exe`를 가리킨다.
- `ngspice -v`가 ngspice version을 출력한다.

## 4. SKY130 PDK 모델 준비

### 4.1 PDK ZIP 다운로드

Git이 없는 Windows 환경을 기본으로 하므로 ZIP 다운로드를 사용한다.

- SKY130 primitive library repo: <https://github.com/google/skywater-pdk-libs-sky130_fd_pr>
- ZIP 다운로드: <https://github.com/google/skywater-pdk-libs-sky130_fd_pr/archive/refs/heads/main.zip>

다운로드 위치:

```text
C:\eda\downloads\skywater-pdk-libs-sky130_fd_pr-main.zip
```

PowerShell 다운로드:

```powershell
$url = "https://github.com/google/skywater-pdk-libs-sky130_fd_pr/archive/refs/heads/main.zip"
$out = "C:\eda\downloads\skywater-pdk-libs-sky130_fd_pr-main.zip"
Invoke-WebRequest -Uri $url -OutFile $out
```

압축 해제:

```powershell
Expand-Archive -Path C:\eda\downloads\skywater-pdk-libs-sky130_fd_pr-main.zip -DestinationPath C:\eda\sky130 -Force
```

폴더명을 고정한다.

```powershell
Rename-Item C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr-main skywater-pdk-libs-sky130_fd_pr
```

모델 파일 확인:

```powershell
Test-Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice
```

통과 기준:

```text
True
```

### 4.2 사용할 model corner

기본 corner는 `tt`로 둔다.

```spice
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt
```

corner sweep은 최종 후보가 nominal에서 통과한 뒤에만 수행한다.

권장 corner 순서:

1. `tt`: nominal verification
2. `ff`: fast-side bandwidth/load sensitivity 확인
3. `ss`: slow-side gain/bandwidth/headroom 확인

### 4.3 model/device name 확인

netlist를 작성하기 전에 PDK 내부의 정확한 model/subckt 이름을 확인한다.

```powershell
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "npn_05v5"
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "pnp_05v5"
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "res_xhigh"
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "cap_vpp"
```

기록해야 할 항목:

| Logical use | Project allowed cell | ngspice model/subckt record |
| --- | --- | --- |
| NPN BJT | `sky130_fd_pr_main / npn_05v5` | `sky130_fd_pr__npn_05v5` 또는 PDK 파일에서 확인한 정확한 이름 |
| PNP BJT | `sky130_fd_pr_main / pnp_05v5` | PDK 파일에서 확인 |
| Resistor | `sky130_fd_pr_main / res_xhigh_po_5p73` | PDK 파일에서 확인, 초기 sizing에는 ideal R 사용 가능 |
| Capacitor | `sky130_fd_pr_main / cap_vpp_11p5x11p7_m1m4_noshield` | PDK 파일에서 확인, 초기 sizing에는 ideal C 사용 가능 |

초기 ngspice 설계 탐색에서는 ideal R/C를 사용해 pole과 bias를 빠르게 잡을 수 있다. 단, 최종 제출용 schematic/device list에는 프로젝트에서 허용한 SKY130 resistor/capacitor cell과 geometry를 반드시 기록한다.

## 5. ngspice 초기화

Windows ngspice는 사용자 홈의 `spice.rc`를 읽는다. 다음 파일을 만든다.

```text
%USERPROFILE%\spice.rc
```

권장 내용:

```spice
set ngbehavior=hsa
set skywaterpdk
set ng_nomodcheck
set num_threads=4
option klu
```

설명:

| 설정 | 목적 |
| --- | --- |
| `set ngbehavior=hsa` | HSPICE/Spectre 계열 syntax 호환성 향상 |
| `set skywaterpdk` | SKY130 PDK용 ngspice 동작 옵션 활성화 |
| `set ng_nomodcheck` | 일부 PDK model parameter warning 완화 |
| `set num_threads=4` | multi-thread 계산 사용 |
| `option klu` | large sparse matrix solver 사용 |

주의:

- DC operating point를 숨기지 않는다.
- 각 netlist의 `.control` block에서 `op`, `ac`, `tran`, `wrdata`, `hardcopy`를 명시해 결과 파일을 남긴다.
- convergence가 나쁠 때만 netlist별로 `option gmin`, `option reltol`, `option method=gear`를 추가한다.

## 6. SKY130 PDK smoke test

목적은 최종 회로를 만들기 전에 include path, model corner, ngspice 옵션, device syntax 문제를 분리해서 제거하는 것이다.

### 6.1 파일 생성

파일:

```text
netlists\smoke_sky130.spice
```

기본 template:

```spice
* SKY130 + ngspice smoke test
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt

.option savecurrents
.option klu

VDD vdd 0 5
VB  b   0 0.75
VE  e   0 0
RC  vdd c 10k

* If PDK exposes npn_05v5 as a BJT model, this form should work.
QSMOKE c b e sky130_fd_pr__npn_05v5

.control
set noaskquit
op
print v(vdd) v(c) v(b) v(e)
write ../results/ngspice/raw/smoke_sky130.raw
quit
.endc

.end
```

만약 `unknown model sky130_fd_pr__npn_05v5`가 나오면 4.3의 검색 결과로 model/subckt 이름과 instance syntax를 고친다. PDK가 subckt 형태를 요구하면 `QSMOKE` 대신 `XSMOKE` instance로 바꾸고 pin order는 PDK 파일의 `.subckt` 선언을 따른다.

### 6.2 실행

```powershell
ngspice -b -o .\results\ngspice\logs\smoke_sky130.log .\netlists\smoke_sky130.spice
```

### 6.3 통과 기준

`results\ngspice\logs\smoke_sky130.log`에서 다음이 없어야 한다.

- `can't find include file`
- `unknown model`
- `unknown subckt`
- `fatal error`
- `singular matrix`

확인 명령:

```powershell
Select-String .\results\ngspice\logs\smoke_sky130.log -Pattern "can't find|unknown|fatal|singular|error"
```

통과 기준:

- 위 명령이 빈 결과를 출력한다.
- `smoke_sky130.raw`가 생성된다.

## 7. 프로젝트 netlist 작성 순서

### 7.1 공통 netlist header

모든 프로젝트 netlist는 다음 header를 공유한다.

```spice
* Common header for SKY130 neural amplifier simulations
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt

.option savecurrents
.option klu
.option reltol=1e-4

.param VDD=5
.param VCM=2.5
.param VIN_AC=1m

VDD vdd 0 {VDD}
```

AC gain extraction을 쉽게 하기 위해 AC simulation에서는 입력 source의 AC magnitude를 `1`로 두고, plot이나 계산에서 절대 gain을 바로 읽는다.

```spice
VIN vin 0 DC {VCM} AC 1
```

Transient에서는 실제 사양인 `1 mV` 입력을 사용한다.

```spice
VIN vin 0 SIN({VCM} 1m 1k)
```

### 7.2 BJT 1-stage 먼저 검증

파일 세트:

```text
netlists\bjt1_op.spice
netlists\bjt1_ac.spice
netlists\bjt1_tran.spice
```

목표:

- Q1 DC operating point가 정상인지 확인한다.
- 1-stage midband gain, lower cutoff 기여, upper cutoff 기여를 기록한다.
- transient에서 collector waveform이 rail에 붙지 않는지 확인한다.

기록할 node:

```text
b1_base
b1_emitter
b1_collector
b1_out
```

1-stage DC gate:

| 항목 | 통과 기준 |
| --- | --- |
| `v(b1_base)` | emitter보다 약 `0.6-0.8 V` 높음 |
| `v(b1_emitter)` | 0 V보다 높고 bias current가 형성됨 |
| `v(b1_collector)` | `0 V` 또는 `5 V` rail에 붙지 않음 |
| `VCE1` | signal swing을 위한 headroom 확보 |
| `IC1` | gain, power, headroom 관점에서 설명 가능 |

### 7.3 BJT 2-stage로 확장

파일 세트:

```text
netlists\bjt2_op.spice
netlists\bjt2_ac.spice
netlists\bjt2_tran.spice
```

구성:

```text
vin -> CIN1 -> b1_base
vdd -> RB1_TOP -> b1_base
b1_base -> RB1_BOT -> 0
vdd -> RC1 -> b1_collector
Q1: collector=b1_collector, base=b1_base, emitter=b1_emitter
b1_emitter -> RE1 -> 0

b1_collector -> CINT -> b2_base
vdd -> RB2_TOP -> b2_base
b2_base -> RB2_BOT -> 0
vdd -> RC2 -> b2_collector
Q2: collector=b2_collector, base=b2_base, emitter=b2_emitter
b2_emitter -> RE2 -> 0

b2_collector -> output LPF -> vout_final
```

2-stage gate:

- 각 stage의 base/emitter/collector DC point를 따로 기록한다.
- interstage coupling capacitor가 stage 1 collector DC를 stage 2 base에 직접 전달하지 않아야 한다.
- total midband gain이 40 dB 근처인지 확인한다.
- 두 common-emitter stage 때문에 total phase는 입력과 같은 방향이어야 한다.

### 7.4 10 pF load 추가

파일 세트:

```text
netlists\bjt2_load10p_ac.spice
netlists\bjt2_load10p_tran.spice
```

load 위치:

```spice
CLOAD_10P vout_final 0 10p
```

검증:

- unloaded 결과와 loaded 결과를 같은 plot scale로 비교한다.
- midband gain 변화량을 기록한다.
- upper cutoff shift를 기록한다.
- peaking, ringing, clipping을 확인한다.

실패 판단:

- 10 pF 연결 후 midband gain이 크게 붕괴한다.
- upper cutoff가 `20 kHz` 아래로 크게 내려온다.
- transient에서 ringing 또는 clipping이 뚜렷하다.
- output DC가 rail 근처로 이동한다.

### 7.5 Optional OPAMP buffer 평가

Candidate A가 load 조건에서 실패할 때만 Candidate B를 만든다.

파일 세트:

```text
netlists\bjt2_buffer_ac.spice
netlists\bjt2_buffer_tran.spice
```

buffer 역할:

```text
BJT 2-stage output LPF node -> OPAMP + input
OPAMP output -> OPAMP - input
OPAMP output -> vout_final -> 10 pF load
```

판단:

- Candidate B는 BJT gain core를 대체하지 않는다.
- OPAMP는 거의 unity gain voltage follower로만 쓴다.
- OPAMP 1개는 area `1000p`로 계산한다.
- load driving 개선이 `1000p` area penalty를 정당화할 때만 최종 후보가 될 수 있다.

## 8. 시뮬레이션 실행 workflow

### 8.1 DC operating point

목적:

- AC plot보다 먼저 bias가 정상인지 확인한다.
- BJT가 cutoff/saturation에 빠진 상태의 가짜 AC 결과를 방지한다.

예시 `.control` block:

```spice
.control
set noaskquit
op
print v(b1_base) v(b1_emitter) v(b1_collector)
print v(b2_base) v(b2_emitter) v(b2_collector)
print v(vout_final)
write ../results/ngspice/raw/bjt2_op.raw
quit
.endc
```

실행:

```powershell
ngspice -b -o .\results\ngspice\logs\bjt2_op.log .\netlists\bjt2_op.spice
```

결과 파일:

```text
results\ngspice\logs\bjt2_op.log
results\ngspice\raw\bjt2_op.raw
```

### 8.2 AC response

목적:

- midband gain이 `40 dB` 근처인지 확인한다.
- lower cutoff가 `10 Hz` 근처인지 확인한다.
- upper cutoff가 `20 kHz` 근처인지 확인한다.
- out-of-band roll-off가 목표 H(s)에 가까운지 확인한다.

예시 `.control` block:

```spice
.control
set noaskquit
ac dec 100 0.1 10Meg
let gain_vv = mag(v(vout_final)/v(vin))
let gain_db = db(v(vout_final)/v(vin))
wrdata ../results/ngspice/csv/bjt2_ac.csv frequency gain_vv gain_db
hardcopy ../results/ngspice/plots/bjt2_ac.ps gain_db
write ../results/ngspice/raw/bjt2_ac.raw
quit
.endc
```

실행:

```powershell
ngspice -b -o .\results\ngspice\logs\bjt2_ac.log .\netlists\bjt2_ac.spice
```

PowerShell에서 PostScript를 PNG로 변환하려면 ImageMagick이나 Ghostscript를 별도로 사용한다. 변환 도구가 없다면 ngspice plot window screenshot 또는 Python/Excel plot으로 PNG를 생성한다.

### 8.3 transient small-signal

목적:

- 실제 `1 mV`, `1 kHz` 입력에서 출력이 약 `100 mV` 수준인지 확인한다.
- 출력 waveform이 `2.5 V` common-mode 기준에서 clipping 없이 움직이는지 확인한다.

예시 `.control` block:

```spice
.control
set noaskquit
tran 1u 10m
wrdata ../results/ngspice/csv/bjt2_tran.csv time v(vin) v(vout_final) v(b1_collector) v(b2_collector)
hardcopy ../results/ngspice/plots/bjt2_tran.ps v(vin) v(vout_final)
write ../results/ngspice/raw/bjt2_tran.raw
quit
.endc
```

실행:

```powershell
ngspice -b -o .\results\ngspice\logs\bjt2_tran.log .\netlists\bjt2_tran.spice
```

통과 기준:

- output amplitude가 target gain과 일관된다.
- waveform이 sine shape을 유지한다.
- clipping, flat top/bottom, 심한 distortion이 없다.
- collector waveform이 DC operating point를 중심으로 swing한다.

### 8.4 clipping margin check

목적:

- 보고서에서 transient headroom을 설명할 수 있게 한다.
- `1 mV`에서는 안전하지만 더 큰 입력에서 어디서 clipping이 시작되는지 기록한다.

권장 sweep:

| Input amplitude | 목적 |
| ---: | --- |
| `0.5 mV` | 충분히 linear한 baseline |
| `1 mV` | 프로젝트 사양 |
| `2 mV` | margin 확인 |
| `5 mV` | clipping 시작 여부 확인 |
| `10 mV` | failure shape 확인 |

판단:

- 최종 제출 판단은 `1 mV` 조건을 기준으로 한다.
- 더 큰 입력은 robustness 설명용으로만 사용한다.

### 8.5 parameter sweep

한 번에 하나의 family만 sweep한다.

| Sweep 대상 | 관찰 지표 | 조정 목적 |
| --- | --- | --- |
| `RC1`, `RC2` | collector DC, gain, power, load sensitivity | gain과 headroom 균형 |
| `RE1`, `RE2` | current, gain, distortion | emitter degeneration 조정 |
| `RB_TOP`, `RB_BOT` | base voltage, current, VCE | DC bias 안정화 |
| `CIN1` | lower cutoff | input high-pass tuning |
| `CINT` | lower cutoff, stage interaction | interstage high-pass tuning |
| `COUT_LP` | upper cutoff, peaking | high-frequency roll-off tuning |
| optional emitter bypass C | AC gain, distortion | gain 증가와 distortion trade-off |

ngspice 예시:

```spice
.control
set noaskquit
foreach rcval 10k 22k 33k 47k 68k
  alter RC1 = $rcval
  op
  ac dec 50 1 1Meg
  meas ac midgain_db find db(v(vout_final)/v(vin)) at=1000
end
quit
.endc
```

각 sweep 결과는 다음 표에 기록한다.

| Version | 변경값 | DC 통과 | Midband gain | Lower cutoff | Upper cutoff | 10 pF load | Power | Area | 판단 |
| --- | --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| A0 | initial |  |  |  |  |  |  |  |  |
| A1 |  |  |  |  |  |  |  |  |  |

## 9. 결과 계산 workflow

### 9.1 Area 계산

프로젝트 기준:

```text
A_NPN = NPN count x 1p
A_PNP = PNP count x 0.4624p
A_OPAMP = OPAMP count x 1000p
A_res = segment length x segment width x segments
A_cap = width x length x multiplier
A_total = A_NPN + A_PNP + A_OPAMP + A_res_total + A_cap_total
```

결과 파일:

```text
results\ngspice\tables\area_calculation.csv
```

CSV columns:

```text
component,logical_role,library_cell,value,geometry,area_formula,area_p,ppa_included,notes
```

주의:

- bonus block의 area/power는 amplifier PPA에 포함하지 않는다.
- OPAMP buffer를 쓰면 `1000p` penalty를 반드시 넣는다.

### 9.2 Power 계산

두 기준 중 불리한 값을 기록한다.

DC static power:

```text
PDC = VDD x Istatic
```

Transient average power:

```text
Pavg = (1 / T) * integral( VDD * IDD(t) dt )
```

ngspice transient에서 supply current 저장:

```spice
wrdata ../results/ngspice/csv/bjt2_power.csv time i(vdd)
```

후처리 계산:

```text
Pavg = average(5 V * abs(I(VDD)))
```

결과 파일:

```text
results\ngspice\tables\power_calculation.csv
```

CSV columns:

```text
version,vdd_v,static_current_a,pdc_w,transient_avg_current_a,pavg_w,worst_power_w,notes
```

### 9.3 AC target H(s) 비교

목표 H(s)는 `40 dB` midband gain, `10 Hz` lower cutoff, `20 kHz` upper cutoff, 양쪽 roll-off 약 `80 dB/decade`를 갖는 band-pass target으로 둔다.

비교 절차:

1. `bjt2_ac.csv`에서 frequency와 gain_db를 읽는다.
2. 같은 frequency grid에서 target gain_db를 계산한다.
3. passband, low-frequency stopband, high-frequency stopband를 분리해 오차를 본다.
4. normalized RMSE를 계산한다.
5. plot에는 simulated curve와 target curve를 함께 표시한다.

기록 항목:

| Metric | 기록값 |
| --- | --- |
| Midband gain at 1 kHz |  |
| Lower cutoff |  |
| Upper cutoff |  |
| Passband ripple |  |
| Low-frequency roll-off |  |
| High-frequency roll-off |  |
| Normalized RMSE |  |

### 9.4 transient response 비교

기록 항목:

| 항목 | 판단 |
| --- | --- |
| Input amplitude | `1 mV` |
| Output amplitude | 약 `100 mV` target |
| DC center | `2.5 V` 기준 또는 설계상 설명 가능한 output bias |
| Delay/settling | 과도하게 크지 않음 |
| Overshoot/ringing | 없어야 함 |
| Distortion/clipping | 없어야 함 |
| 10 pF load 영향 | unloaded 대비 비교 |

## 10. Candidate 선택 gate

### 10.1 Candidate A 선택 조건

Candidate A, 즉 BJT 2-stage only를 선택한다.

- DC operating point가 양 stage 모두 정상이다.
- 10 pF load 포함 상태에서 midband gain이 40 dB 근처이다.
- lower cutoff가 10 Hz 근처이고 upper cutoff가 20 kHz 근처이다.
- transient에서 `1 mV` 입력이 clipping 없이 증폭된다.
- 10 pF load로 인한 upper cutoff 저하나 ringing이 허용 가능하다.
- OPAMP 없이 area penalty를 피할 수 있다.

### 10.2 Candidate B 평가 조건

다음 중 하나 이상이면 OPAMP buffer candidate를 평가한다.

- 10 pF load 때문에 upper cutoff가 목표보다 크게 낮아진다.
- output impedance 때문에 transient ringing이 발생한다.
- load 연결 후 gain이 크게 줄어든다.
- BJT-only output이 report에서 안정 동작이라고 방어하기 어렵다.

### 10.3 Candidate B 선택 조건

Candidate B는 다음을 모두 만족할 때만 최종 선택한다.

- OPAMP가 voltage follower로 동작한다.
- BJT stages가 여전히 main gain을 제공한다.
- 10 pF load response가 Candidate A보다 명확히 좋아진다.
- 개선 폭이 `1000p` OPAMP area penalty를 설명할 만큼 크다.
- 발표에서 "OPAMP가 main amplifier가 아니라 load buffer"라고 명확히 설명할 수 있다.

## 11. 제출 산출물 checklist

| 제출물 | 생성/기록 위치 | 확인 |
| --- | --- | --- |
| 회로 schematic 및 testbench netlist | `netlists\*.spice`, Cadence screenshot |  |
| 사용 소자 목록 | `results\ngspice\tables\device_list.csv` |  |
| 면적 계산표 | `results\ngspice\tables\area_calculation.csv` |  |
| static current 및 power | `results\ngspice\tables\power_calculation.csv` |  |
| AC response plot PNG | `results\ngspice\plots\*_ac.png` |  |
| transient response plot PNG | `results\ngspice\plots\*_tran.png` |  |
| 목표 H(s) | 발표자료와 `results\ngspice\tables\target_hs.csv` |  |
| H(s) 대비 분석 | 발표자료, `results\ngspice\tables\performance_summary.csv` |  |
| PPA trade-off 설명 | 발표자료, final comparison table |  |
| 최종 발표 PDF | `조번호_발표자료.pdf` |  |

## 12. 최종 실행 순서

다음 순서대로만 진행한다.

1. `ngspice -v`로 설치 확인.
2. `sky130.lib.spice` 존재 확인.
3. `spice.rc` 작성.
4. `smoke_sky130.spice` 실행.
5. BJT 1-stage DC operating point 실행.
6. BJT 1-stage AC 실행.
7. BJT 1-stage transient 실행.
8. BJT 2-stage DC operating point 실행.
9. BJT 2-stage AC 실행.
10. BJT 2-stage transient 실행.
11. BJT 2-stage + 10 pF load AC 실행.
12. BJT 2-stage + 10 pF load transient 실행.
13. 필요한 경우 parameter sweep.
14. Candidate A가 load 조건에서 실패할 때만 Candidate B buffer 실행.
15. Candidate A/B 비교표 작성.
16. area CSV 작성.
17. power CSV 작성.
18. H(s) target 대비 normalized RMSE와 정성 분석 작성.
19. 최종 plot PNG 정리.
20. 발표자료에 구조 선택 이유, gain/bandwidth/power/area trade-off, 10 pF load 결과를 넣는다.

## 13. 실패 시 진단표

| 증상 | 가능 원인 | 조치 |
| --- | --- | --- |
| `can't find include file` | PDK 경로 오류 | `.lib` 경로를 `/` slash 절대경로로 수정 |
| `unknown model` | model 이름 불일치 | PDK model 파일에서 실제 이름 검색 |
| `unknown subckt` | subckt instance syntax 불일치 | `.subckt` 선언과 pin order 확인 |
| `singular matrix` | floating node, bias path 없음 | base bias divider, DC path, gigaohm leak 추가 검토 |
| collector가 VDD 근처 | BJT cutoff, base bias 낮음 | base divider 조정, emitter/collector resistor 재조정 |
| collector가 GND 근처 | saturation, current 과다 | base bias 낮추기, RC 줄이기, RE 늘리기 |
| AC gain은 좋은데 transient clipping | headroom 부족 | gain 분산, emitter degeneration, bias center 조정 |
| 10 pF load 후 upper cutoff 저하 | output impedance 과다 | output LPF 재조정, buffer 후보 평가 |
| high-frequency peaking | pole/zero 상호작용, load interaction | COUT_LP/RC 조정, stage loading 확인 |
| power 과다 | current bias 과다, OPAMP ft 과다 | bias current 축소, OPAMP 사용 회피 |

## 14. Reference links

- ngspice downloads: <https://ngspice.sourceforge.io/download.html>
- ngspice 46 SourceForge files: <https://sourceforge.net/projects/ngspice/files/ng-spice-rework/46/>
- ngspice SkyWater notes: <https://ngspice.sourceforge.io/applic.html>
- SkyWater simulation docs: <https://skywater-pdk.readthedocs.io/en/main/sim.html>
- SKY130 primitive repo: <https://github.com/google/skywater-pdk-libs-sky130_fd_pr>
- SKY130 device details: <https://skywater-pdk.readthedocs.io/en/main/rules/device-details.html>

