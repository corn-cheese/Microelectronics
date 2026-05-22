# Windows Native SKY130 PDK + ngspice 실행계획

이 문서는 `전자회로프로젝트.md`의 single-ended neural signal amplifier 과제를 Windows native 환경에서 SKY130 PDK와 ngspice로 실행하기 위한 workflow이다. 목표는 ngspice 다운로드부터 PDK 모델 연결, BJT 기반 증폭기 검증, PPA 계산, 최종 결과 도출까지 재현 가능한 순서를 고정하는 것이다.

`전자회로프로젝트.md`가 과제 요구사항의 source of truth이다. 이 계획 문서와 `전자회로프로젝트.md`가 충돌하면 `전자회로프로젝트.md`를 따른다. 특히 2026-05-19 변경사항의 저항 cell 변경 지시를 우선하여 resistor는 `res_high_po_5p73`로 둔다.

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

### 1.2 현재 확정 상태

2026-05-22 현재 `progress.md`, `netlists/`, `results/`에 기록된 실제 상태는 다음과 같다.

- 작업 루트는 `D:\Codex\Support`이다.
- `C:\eda\downloads`, `C:\eda\ngspice`, `C:\eda\sky130` 폴더가 생성되었다.
- 7-Zip은 `C:\Program Files\7-Zip\7z.exe`에 설치되어 있다.
- ngspice 46은 `C:\eda\ngspice\Spice64\bin`에 설치되어 있다.
- batch/console 실행 기준은 `C:\eda\ngspice\Spice64\bin\ngspice_con.exe`이다. `ngspice.exe`는 GUI 실행 파일이므로 PowerShell 검증과 batch 실행에는 `ngspice_con.exe`를 우선 사용한다.
- 현재 사용자 PATH에는 ngspice 경로가 추가되었지만, 이미 열린 Codex PowerShell 세션에서는 반영되지 않을 수 있으므로 절대 경로 실행을 허용한다.
- SKY130 primitive PDK는 `C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr`에 준비되어 있고, `models\sky130.lib.spice` 존재를 확인했다.
- `sky130.lib.spice`의 `tt` corner 전체 include는 현재 ngspice 실행에서 MOS/ESD model include 중 `Not enough parameters for i source` fatal error로 실패했다.
- BJT 검증 netlist는 전체 `.lib` 대신 BJT에 필요한 파일만 직접 include하는 방식을 기준으로 둔다.
- `netlists\smoke_sky130.spice`는 exit code `0`으로 통과했고 `results\ngspice\raw\smoke_sky130.raw`가 생성되었다.
- `netlists\bjt1_op.spice`는 exit code `0`으로 통과했고 `results\ngspice\raw\bjt1_op.raw`와 `results\ngspice\tables\bjt1_op_summary.csv`가 생성되었다.
- `netlists\bjt1_ac.spice`와 `netlists\bjt1_tran.spice`는 exit code `0`으로 통과했고 `results\ngspice\csv\`, `results\ngspice\raw\`, `results\ngspice\tables\`에 각각 결과가 생성되었다.
- `netlists\bjt2_op.spice` 작성 및 실행은 완료되었고, 다음 실행 단계는 `netlists\bjt2_ac.spice`와 `netlists\bjt2_tran.spice` 작성/실행이다.

### 1.3 실행 환경 기준

- Windows native PowerShell을 사용한다.
- WSL은 사용하지 않는다.
- 한글/공백 경로 문제를 피하기 위해 EDA tool과 PDK는 `C:\eda\...` 아래에 둔다.
- 재현 가능한 setup은 Git clone이 아니라 ZIP 다운로드를 기본 경로로 둔다.
- batch 실행 명령은 새 PowerShell에서 PATH가 반영된 경우 `ngspice_con.exe`, 반영되지 않은 경우 `C:\eda\ngspice\Spice64\bin\ngspice_con.exe` 절대 경로를 사용한다.

### 1.4 설계 방향

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
- `curl.exe -L`용 직접 파일 URL: <https://downloads.sourceforge.net/project/ngspice/ng-spice-rework/46/ngspice-46_64.7z>

수동 다운로드 후 파일을 다음 위치에 둔다.

```text
C:\eda\downloads\ngspice-46_64.7z
```

PowerShell 다운로드를 사용할 경우 SourceForge `/download` URL이 HTML landing page를 저장할 수 있으므로 `curl.exe -L`과 `downloads.sourceforge.net` 직접 파일 URL을 우선 사용한다.

```powershell
$url = "https://downloads.sourceforge.net/project/ngspice/ng-spice-rework/46/ngspice-46_64.7z"
$out = "C:\eda\downloads\ngspice-46_64.7z"
curl.exe -L $url -o $out
Get-Item $out | Select-Object FullName,Length
[System.BitConverter]::ToString([System.IO.File]::ReadAllBytes($out)[0..5])
```

통과 기준은 파일 크기가 약 `10,675,950 bytes`이고 magic bytes가 `37 7A BC AF 27 1C`로 시작하는 것이다. 크기가 약 `137 KB`이고 HTML처럼 보이면 SourceForge landing page가 저장된 것이므로 다시 다운로드한다.

### 3.3 압축 해제와 PATH 등록

압축 해제:

```powershell
& "C:\Program Files\7-Zip\7z.exe" x C:\eda\downloads\ngspice-46_64.7z -oC:\eda\ngspice
```

ngspice 실행 파일 후보를 찾는다.

```powershell
Get-ChildItem C:\eda\ngspice -Recurse -Filter ngspice.exe
Get-ChildItem C:\eda\ngspice -Recurse -Filter ngspice_con.exe
```

일반적으로 다음 형태의 경로가 나온다.

```text
C:\eda\ngspice\Spice64\bin\ngspice.exe
C:\eda\ngspice\Spice64\bin\ngspice_con.exe
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
where.exe ngspice_con
ngspice_con.exe -v
```

통과 기준:

- `where.exe ngspice_con`이 `C:\eda\ngspice\Spice64\bin\ngspice_con.exe`를 가리킨다.
- `ngspice_con.exe -v`가 `ngspice-46` version banner를 출력한다.
- 현재 Codex PowerShell처럼 PATH 갱신이 아직 반영되지 않은 세션에서는 `& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -v`로 확인한다.

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

현재 검증된 BJT smoke/BJT 1-stage OP netlist에서는 전체 `sky130.lib.spice` include를 사용하지 않는다. 아래 전체 library include는 MOS/ESD model까지 함께 읽으면서 현재 Windows ngspice 환경에서 fatal error를 발생시켰으므로, BJT 검증의 기본 template으로 쓰지 않는다.

```spice
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt
```

BJT 검증 기준 include는 다음과 같다.

```spice
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"
```

확인된 NPN subckt와 instance 형식은 다음과 같다.

```spice
.subckt sky130_fd_pr__npn_05v5_W1p00L1p00 c b e s
XQ1 collector base emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
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
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "res_high"
Select-String -Path C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\*.spice -Pattern "cap_vpp"
```

기록해야 할 항목:

| Logical use | Project allowed cell | ngspice model/subckt record |
| --- | --- | --- |
| NPN BJT | `sky130_fd_pr_main / npn_05v5` | `sky130_fd_pr__npn_05v5_W1p00L1p00`; 4-pin subckt `c b e s` |
| PNP BJT | `sky130_fd_pr_main / pnp_05v5` | PDK 파일에서 확인 |
| Resistor | `sky130_fd_pr_main / res_high_po_5p73` | `sky130_fd_pr__res_high_po_5p73`; 초기 sizing에는 ideal R 사용 가능 |
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
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"

.option savecurrents
.option klu

VDD vdd 0 5
VB  b   0 0.75
VE  e   0 0
RC  vdd c 10k

* SKY130 npn_05v5 is exposed as a 4-pin subckt: c b e s.
XSMOKE c b e 0 sky130_fd_pr__npn_05v5_W1p00L1p00 M=1

.control
set noaskquit
op
print v(vdd) v(c) v(b) v(e)
write D:/Codex/Support/results/ngspice/raw/smoke_sky130.raw
quit
.endc

.end
```

참고로 전체 library include인 `.lib ".../models/sky130.lib.spice" tt`는 현재 환경에서 다음 fatal error로 실패했다.

```text
Error in line include "sky130_fd_pr__esd_nfet_05v0_nvt.pm3"
Not enough parameters for i source
ERROR: fatal error in ngspice
```

따라서 BJT 검증에서는 위처럼 `nonfet.spice`와 `npn_05v5` corner 파일만 직접 include한다.

### 6.2 실행

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\smoke_sky130.log .\netlists\smoke_sky130.spice
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
- 현재 `netlists\smoke_sky130.spice`는 이 기준을 통과했다.

## 7. 프로젝트 netlist 작성 순서

이 장의 1-stage/2-stage netlist 단계는 ngspice 실행 가능성, SKY130 BJT 동작, DC bias 가능성, 기본 AC/transient 흐름을 확인하기 위한 검증 절차이다. 상세한 회로 topology 확정, bias 값 선정, pole/zero 배치, 소자 sizing, PPA 최적화는 이 단계에서 임의로 확정하지 않는다.

디테일한 회로 설계는 smoke test와 기본 BJT 동작 검증이 끝난 뒤 사용자와 깊게 논의하여 목표 사양, 허용 소자, scoring 전략, area/power trade-off를 다시 정리하고 별도의 설계 계획을 새로 세운 다음 진행한다.

### 7.1 공통 netlist header

모든 프로젝트 netlist는 다음 header를 공유한다.

```spice
* Common header for SKY130 neural amplifier simulations
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"

.option savecurrents
.option klu
.option reltol=1e-4

.param VDD=5
.param VCM=2.5
.param VIN_AC=1m

VDD vdd 0 {VDD}
```

NPN instance는 `Q...` BJT primitive가 아니라 4-pin subckt `X... collector base emitter substrate sky130_fd_pr__npn_05v5_W1p00L1p00` 형식을 사용한다.

```spice
XQ1 b1_collector b1_base b1_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
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

이 단계는 최종 증폭기 회로 구현이 아니라, BJT 한 단이 ngspice/SKY130 모델에서 정상적으로 operating point를 잡는지 확인하는 sanity check이다. 임시 bias와 ideal R/C를 사용할 수 있지만, 그 값은 최종 설계 확정으로 간주하지 않는다.

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

현재 완료된 `bjt1_op.spice` 결과:

| 항목 | 값 |
| --- | ---: |
| `v(vdd)` | `5.000000 V` |
| `v(b1_base)` | `1.129207 V` |
| `v(b1_emitter)` | `0.335519 V` |
| `v(b1_collector)` / `v(b1_out)` | `3.365828 V` |
| `VBE1` | `0.793688 V` |
| `VCE1` | `3.030309 V` |
| `Istatic` | `28.0714 uA` |
| `PDC` | `140.357 uW` |

판단:

- BJT는 켜져 있고 collector가 `0 V` 또는 `5 V` rail에 붙지 않았다.
- `VCE1 = 3.030309 V`로 1-stage OP sanity check는 통과했다.
- 이 값들은 최종 sizing이 아니라 `bjt1_ac.spice`와 `bjt1_tran.spice`로 넘어가기 위한 모델/동작 검증 결과이다.
- `results\ngspice\logs\bjt1_op.log`에서 `can't find`, `unknown`, `fatal`, `singular`, `error` 검색 결과는 비어 있다.

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
XQ1: collector=b1_collector, base=b1_base, emitter=b1_emitter, substrate=0
b1_emitter -> RE1 -> 0

b1_collector -> CINT -> b2_base
vdd -> RB2_TOP -> b2_base
b2_base -> RB2_BOT -> 0
vdd -> RC2 -> b2_collector
XQ2: collector=b2_collector, base=b2_base, emitter=b2_emitter, substrate=0
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

### 7.6 파일별 목적, 입력 조건, 산출물

아래 netlist는 모두 같은 batch 실행 형식을 사용한다.

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\<name>.log .\netlists\<name>.spice
```

모든 실행 뒤에는 공통 log scan을 수행한다.

```powershell
Select-String .\results\ngspice\logs\<name>.log -Pattern "can't find|unknown|fatal|singular|error"
```

통과 기준은 위 scan이 비어 있고, 지정한 raw/csv/plot/table 산출물이 생성되며, 각 단계별 gate를 만족하는 것이다.

| Netlist | 목적과 입력 조건 | 저장할 산출물 | 단계별 gate |
| --- | --- | --- | --- |
| `bjt1_ac.spice` | 1-stage AC sanity check. `VIN`은 `DC {VCM} AC 1`, load는 high-Z 기준으로 둔다. | `logs\bjt1_ac.log`, `raw\bjt1_ac.raw`, `csv\bjt1_ac.csv`, `plots\bjt1_ac.ps` 또는 `plots\bjt1_ac.png`, `tables\bjt1_ac_summary.csv` | gain이 유한하고 1-stage pole/zero 추정에 쓸 수 있어야 한다. CSV는 최소 `frequency`, `gain_vv`, `gain_db`, `phase_deg`를 포함한다. |
| `bjt1_tran.spice` | 1-stage transient sanity check. `VIN`은 `SIN({VCM} 1m 1k)`를 사용한다. | `logs\bjt1_tran.log`, `raw\bjt1_tran.raw`, `csv\bjt1_tran.csv`, `plots\bjt1_tran.ps` 또는 `plots\bjt1_tran.png` | collector/output waveform이 rail에 붙지 않고, `1 mV`, `1 kHz` small-signal에서 clipping/headroom을 설명할 수 있어야 한다. |
| `bjt2_op.spice` | 2-stage DC operating point 확인. stage 1 collector DC가 stage 2 base에 직접 전달되지 않도록 coupling capacitor와 stage 2 독립 bias를 확인한다. | `logs\bjt2_op.log`, `raw\bjt2_op.raw`, `tables\bjt2_op_summary.csv` | 두 stage의 base/emitter/collector가 cutoff/saturation을 피하고, `vout_final` DC가 설명 가능한 범위에 있어야 한다. |
| `bjt2_ac.spice` | 2-stage unloaded AC 기준 응답. `VIN`은 `DC {VCM} AC 1`을 사용한다. | `logs\bjt2_ac.log`, `raw\bjt2_ac.raw`, `csv\bjt2_ac.csv`, `plots\bjt2_ac.ps` 또는 `plots\bjt2_ac.png`, `tables\bjt2_ac_summary.csv` | midband gain, lower cutoff, upper cutoff, phase 방향을 기록한다. CSV는 최소 `frequency`, `gain_vv`, `gain_db`, `phase_deg`를 포함한다. |
| `bjt2_tran.spice` | 2-stage unloaded transient 기준 응답. `VIN`은 `SIN({VCM} 1m 1k)`를 사용한다. | `logs\bjt2_tran.log`, `raw\bjt2_tran.raw`, `csv\bjt2_tran.csv`, `plots\bjt2_tran.ps` 또는 `plots\bjt2_tran.png` | 출력이 목표 gain과 일관되고 sine shape을 유지하며 clipping이 없어야 한다. |
| `bjt2_load10p_ac.spice` | 최종 평가 load 조건 AC. `CLOAD_10P vout_final 0 10p`를 포함한다. | `logs\bjt2_load10p_ac.log`, `raw\bjt2_load10p_ac.raw`, `csv\bjt2_load10p_ac.csv`, `plots\bjt2_load10p_ac.ps` 또는 `plots\bjt2_load10p_ac.png`, `tables\bjt2_load10p_ac_summary.csv` | unloaded 대비 midband gain 변화, upper cutoff shift, peaking을 기록한다. load 때문에 목표 대역이 무너지면 Candidate B 검토 조건이 된다. |
| `bjt2_load10p_tran.spice` | 최종 평가 load 조건 transient. `1 mV`, `1 kHz`, `10 pF` load를 함께 본다. | `logs\bjt2_load10p_tran.log`, `raw\bjt2_load10p_tran.raw`, `csv\bjt2_load10p_tran.csv`, `plots\bjt2_load10p_tran.ps` 또는 `plots\bjt2_load10p_tran.png` | load 조건에서 ringing, clipping, output DC shift가 허용 가능한지 판단한다. |
| `bjt2_buffer_ac.spice` | optional Candidate B AC. Candidate A가 load 조건에서 실패할 때만 OPAMP voltage follower buffer를 추가한다. | `logs\bjt2_buffer_ac.log`, `raw\bjt2_buffer_ac.raw`, `csv\bjt2_buffer_ac.csv`, `plots\bjt2_buffer_ac.ps` 또는 `plots\bjt2_buffer_ac.png`, `tables\bjt2_buffer_ac_summary.csv` | 10 pF load 응답 개선이 `1000p` OPAMP area penalty를 설명할 만큼 명확해야 한다. |
| `bjt2_buffer_tran.spice` | optional Candidate B transient. buffer output이 `vout_final`과 `10 pF` load를 구동한다. | `logs\bjt2_buffer_tran.log`, `raw\bjt2_buffer_tran.raw`, `csv\bjt2_buffer_tran.csv`, `plots\bjt2_buffer_tran.ps` 또는 `plots\bjt2_buffer_tran.png` | transient ringing/clipping 개선이 Candidate A보다 명확해야 하며, OPAMP가 main gain source가 아니라 buffer임을 설명할 수 있어야 한다. |

### 7.7 상세 설계 전 결정해야 할 설계 공간

이 절은 최종 resistor/capacitor geometry나 BJT bias 값을 확정하지 않는다. 목적은 상세 설계에 들어가기 전에 어떤 topology와 sweep으로 값을 고를지 고정하는 것이다. 실제 최종 값은 아래 순서의 DC, AC, transient, area, power gate를 통과한 후보에서만 선택한다.

#### 7.7.1 topology 후보

| 후보 | 구조 | 사용 기준 | OPAMP 역할 |
| --- | --- | --- | --- |
| Candidate A | `BJT common-emitter stage 1 -> coupling/high-pass -> BJT common-emitter stage 2 -> output low-pass/network -> 10 pF load` | 기본 후보. OPAMP area와 current penalty 없이 목표 gain, bandwidth, transient를 만족할 수 있는지 먼저 본다. | 사용하지 않음 |
| Candidate B | `BJT gain core -> OPAMP voltage follower buffer -> 10 pF load` | Candidate A가 10 pF load에서 upper cutoff, gain, ringing, clipping 중 하나 이상을 방어하기 어려울 때만 평가한다. | main gain source가 아니라 load-driving unity buffer |

Candidate B에서도 gain은 BJT 2-stage core가 만든다. OPAMP는 10 pF load와 BJT output node를 분리하는 voltage follower로만 쓰며, `1000p` area penalty와 `Istatic = ft x 7 x 10^-12` power penalty를 함께 계산한다.

#### 7.7.2 stage별 gain 배분

전체 midband gain 목표는 `40 dB`, 약 `100 V/V`이다. 2-stage CE 구조에서는 각 CE stage가 대략 `10 V/V` 전후를 담당하면 전체 gain이 `100 V/V` 근처에 접근한다.

```text
Av_total ≈ Av_stage1 x Av_stage2
100 V/V ≈ 10 V/V x 10 V/V
```

이 `10 V/V`는 시작점일 뿐이다. 실제 stage별 gain은 bias current, collector resistor, emitter degeneration, interstage loading, coupling capacitor, 10 pF load interaction sweep 후 결정한다. 한 stage에 gain을 몰아 clipping/headroom을 잃는 후보는 버리고, 두 stage의 collector DC가 rail에서 충분히 떨어지고 transient에서 `1 mV` 입력을 선형 증폭하는 후보를 우선한다.

CE stage의 rough estimate는 다음 식을 사용해 sweep 범위를 정한다.

```text
re ≈ 25.8 mV / IE
Av_stage ≈ -RC / (re + RE_unbypassed + reflected_loading)
PDC ≈ VDD x Istatic
```

예를 들어 `IE`를 키우면 `re`가 작아져 gain/headroom tuning 여지는 늘지만 `PDC`가 증가한다. `RC`를 키우면 gain은 늘 수 있지만 collector DC headroom과 upper cutoff가 나빠질 수 있다. `RE_unbypassed`를 키우면 gain은 줄어도 bias 안정성과 distortion margin이 좋아질 수 있다.

#### 7.7.3 cutoff와 roll-off 계획

high-pass와 low-pass의 1차 시작점은 다음 식으로 산정한다.

```text
fc ≈ 1 / (2πRC)
```

입력 coupling, interstage coupling, output/load network는 각각 target `10 Hz` lower cutoff와 `20 kHz` upper cutoff에 영향을 준다. 한 capacitor만 크게 바꾸면 passband flatness, stage loading, area가 동시에 변하므로, cutoff 관련 sweep은 `CIN`, `CINT`, output low-pass capacitor/network를 분리해서 실행한다.

`80 dB/decade` roll-off 목표는 1st-order pole 하나로 달성할 수 없다.

| Pole 수 | 이상적인 asymptotic roll-off | 계획상 의미 |
| ---: | ---: | --- |
| 1 pole | `20 dB/decade` | 단일 RC pole만으로는 목표 미달 |
| 2 poles | `40 dB/decade` | 두 stage 또는 두 RC network가 기여할 때 가능한 중간 목표 |
| 4 poles | `80 dB/decade` | 목표 slope에 가까우나 passband flatness, phase, area, power와 충돌 가능 |

따라서 상세 설계에서는 `80 dB/decade`를 달성했다고 단정하지 않는다. 목표 `H(s)` 대비 normalized RMSE, passband ripple, transient ringing, 그리고 발표에서 설명 가능한 trade-off를 함께 보고 최종 후보를 고른다. Roll-off를 강하게 만들기 위해 pole을 늘렸지만 passband가 찌그러지거나 transient ringing이 커지는 후보는 performance 점수에서 불리하다고 판단한다.

#### 7.7.4 sweep family 순서

한 번에 하나의 family만 바꾼다. 각 sweep은 nominal candidate를 복사해 version을 붙이고, 통과한 후보 하나만 다음 family의 기준점으로 넘긴다.

| 순서 | Sweep family | 직접 바꿀 값 | 고정해야 할 값 | 목적 |
| ---: | --- | --- | --- | --- |
| 1 | Stage 1 bias divider | `RB1_TOP/RB1_BOT` | `RE1`, `RC1`, stage 2 값 | `b1_base`, `b1_emitter`, `b1_collector`, `VBE1`, `VCE1` rail margin 확보 |
| 2 | Stage 1 emitter/collector | `RE1`, `RC1` | stage 1 divider, stage 2 값 | stage 1 gain, current, headroom 균형 |
| 3 | Stage 2 bias divider | `RB2_TOP/RB2_BOT` | stage 1 통과값, `RE2`, `RC2` | `b2_base`, `b2_emitter`, `b2_collector`, `vout_final` DC 기준 확보 |
| 4 | Stage 2 emitter/collector | `RE2`, `RC2` | stage 1 통과값, stage 2 divider | total gain, output swing, load sensitivity 균형 |
| 5 | High-pass capacitors | `CIN`, `CINT` | 통과한 bias/resistor 값 | lower cutoff, interstage interaction, area 균형 |
| 6 | Output low-pass network | output low-pass capacitor/network | 통과한 bias/resistor/high-pass 값 | upper cutoff, high-frequency roll-off, peaking 조정 |
| 7 | Optional emitter bypass | emitter bypass capacitor | DC bias와 기본 R/C 값 | gain 회복과 distortion/ringing trade-off 평가 |
| 8 | Optional buffer | OPAMP `ft/current` | BJT gain core 값 | Candidate B일 때만 10 pF load drive 개선과 area/power penalty 비교 |

Stage 1/2의 bias sweep은 반드시 DC operating point를 먼저 통과해야 한다. AC 또는 transient 결과가 좋아 보여도 base/emitter/collector가 cutoff, saturation, rail 고착에 가까우면 다음 sweep으로 넘기지 않는다.

#### 7.7.5 sweep 관찰 지표

각 sweep 결과는 같은 표 형식으로 기록한다. 실행하지 않은 sweep 결과는 숫자를 채우지 않는다.

| 지표 | 측정 위치/방법 | 통과 판단 |
| --- | --- | --- |
| DC rail margin | 각 BJT의 base, emitter, collector, `VCE`; `vout_final` DC | collector와 output이 `0 V` 또는 `5 V` rail에 붙지 않고 `VCE`가 saturation을 피함 |
| Midband gain at 1 kHz | `gain_db` 또는 `gain_vv` at `1 kHz` | 2-stage/load 조건에서 `40 dB` 또는 `100 V/V` 근처 |
| Lower cutoff | AC CSV에서 midband 대비 `-3 dB` 또는 target `H(s)` 비교 | `10 Hz` 근처이며 passband 시작이 설명 가능 |
| Upper cutoff | AC CSV에서 midband 대비 `-3 dB` 또는 target `H(s)` 비교 | `20 kHz` 근처이며 10 pF load 후에도 방어 가능 |
| Passband ripple | `10 Hz` to `20 kHz` gain flatness | target `H(s)` 대비 normalized RMSE를 키울 만큼 크지 않음 |
| 10 pF load sensitivity | unloaded vs `CLOAD_10P` AC/transient 비교 | gain collapse, upper cutoff collapse, ringing이 작음 |
| Transient amplitude | `1 mV`, `1 kHz` 입력에서 `vout_final` swing | 2.5 V common-mode 주변에서 약 `100 mV` 수준 목표와 일관 |
| Clipping/ringing | transient waveform shape | rail clipping, 과도한 overshoot, 지속 ringing 없음 |
| Static current/power | `i(vdd)`, `PDC = VDD x Istatic` | performance 개선 대비 power 증가가 설명 가능 |
| Estimated area | BJT count, OPAMP count, resistor/capacitor 산술 면적 | performance 개선 대비 area 증가가 설명 가능 |

#### 7.7.6 Candidate A/B gate

Candidate A는 다음 정량/정성 gate를 모두 통과하면 우선 최종 후보로 둔다.

- 2-stage DC operating point에서 양 stage가 cutoff/saturation을 피한다.
- 10 pF load 포함 AC에서 `1 kHz` midband gain이 `40 dB` 근처이고, lower/upper cutoff가 `10 Hz`/`20 kHz` 목표와 크게 어긋나지 않는다.
- 10 pF load 포함 transient에서 `1 mV`, `1 kHz` 입력이 clipping 없이 약 `100 mV` 수준의 출력으로 증폭된다.
- OPAMP 없이 area `1000p` penalty와 OPAMP static current penalty를 피할 수 있다.

Candidate B는 Candidate A가 load gate에서 실패한 뒤에만 평가한다. Candidate B를 최종 선택하려면 아래 조건을 모두 만족해야 한다.

- OPAMP는 unity voltage follower이고 BJT gain core의 midband gain을 대체하지 않는다.
- 10 pF load에서 upper cutoff, passband ripple, transient ringing/clipping 중 최소 하나가 Candidate A보다 명확히 개선된다.
- 개선 폭이 OPAMP area `1000p`와 `ft`에 따른 current/power penalty를 발표에서 방어할 만큼 크다.
- target `H(s)` normalized RMSE 또는 transient 유사도 개선이 단순한 plot 모양 개선에 그치지 않는다.

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
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt2_op.log .\netlists\bjt2_op.spice
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
let phase_deg = ph(v(vout_final)/v(vin))
wrdata ../results/ngspice/csv/bjt2_ac.csv frequency gain_vv gain_db phase_deg
hardcopy ../results/ngspice/plots/bjt2_ac.ps gain_db
write ../results/ngspice/raw/bjt2_ac.raw
quit
.endc
```

실행:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt2_ac.log .\netlists\bjt2_ac.spice
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
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt2_tran.log .\netlists\bjt2_tran.spice
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

상세 설계 sweep은 7.7절의 design-space 순서를 따른다. 한 번에 하나의 family만 바꾸고, DC operating point gate를 통과한 후보에 대해서만 AC/transient를 실행한다.

| Sweep 대상 | 관찰 지표 | 조정 목적 |
| --- | --- | --- |
| `RB1_TOP/RB1_BOT` | stage 1 base/emitter/collector DC, `VBE1`, `VCE1`, rail margin | stage 1 DC bias 안정화 |
| `RE1`, `RC1` | stage 1 current, gain, collector DC, power | stage 1 gain과 headroom 균형 |
| `RB2_TOP/RB2_BOT` | stage 2 base/emitter/collector DC, `VBE2`, `VCE2`, `vout_final` DC | stage 2 DC bias 안정화 |
| `RE2`, `RC2` | total gain, output swing, static current, 10 pF load sensitivity | stage 2 gain과 output headroom 균형 |
| `CIN`, `CINT` | lower cutoff, passband ripple, interstage interaction | 10 Hz high-pass target 조정 |
| output low-pass capacitor/network | upper cutoff, `20 dB/decade`/`40 dB/decade`/`80 dB/decade` slope 접근성, peaking | 20 kHz upper cutoff와 out-of-band roll-off 조정 |
| optional emitter bypass capacitor | AC gain, distortion, clipping/ringing | gain 회복과 transient 품질 trade-off 평가 |
| optional OPAMP `ft/current` | 10 pF load sensitivity, transient ringing, OPAMP static current, `1000p` area penalty | Candidate B 평가 때만 load-driving buffer 효과 확인 |

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

각 sweep 결과는 다음 표 형식으로 기록한다. 실행하지 않은 sweep은 결과값을 채우지 않는다.

| Version | 변경 family | 변경값 | DC rail margin | Midband gain at 1 kHz | Lower cutoff | Upper cutoff | Passband ripple | 10 pF load sensitivity | Transient amplitude | Clipping/ringing | Static power | Estimated area | 판단 |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | ---: | ---: | --- |

## 9. 결과 계산 workflow

이 장의 파일들은 실제 simulation/post-processing 결과가 생성되기 전까지 완료로 표시하지 않는다. `results\ngspice\tables\*.csv`와 `results\ngspice\plots\*.png`는 계획상 산출물 이름이며, 없는 파일을 제출 완료로 간주하지 않는다.

최종 후보 이름은 다음 둘 중 하나만 사용한다.

```text
Candidate A file stem: bjt2_load10p
Candidate B file stem: bjt2_buffer
```

Candidate A가 10 pF load 조건을 통과하면 final artifact는 `bjt2_load10p_*`를 사용한다. Candidate A가 load 조건에서 실패하고 OPAMP follower가 명확히 개선될 때만 Candidate B를 평가하고, 최종 선택 시 `bjt2_buffer_*`를 사용한다.

### 9.1 Device list와 Area 계산

프로젝트 기준:

```text
A_NPN = NPN count x 1p
A_PNP = PNP count x 0.4624p
A_OPAMP = OPAMP count x 1000p
A_res = segment length x segment width x segments x multiplier
A_cap = width x length x multiplier
A_diode = width x length x multiplier
A_total = sum(area_p where ppa_included = true)
```

device list 결과 파일:

```text
results\ngspice\tables\device_list.csv
```

`device_list.csv` columns:

```text
version,component,logical_role,library_cell,value,geometry,count,source_netlist,ppa_included,notes
```

area 결과 파일:

```text
results\ngspice\tables\area_calculation.csv
```

`area_calculation.csv` columns:

```text
component,logical_role,library_cell,value,geometry,area_formula,area_p,ppa_included,notes
```

허용 cell과 면적 기준:

| Device | `library_cell` | `area_formula` 기준 |
| --- | --- | --- |
| OPAMP buffer | `ahdLib / opamp` | `1000p x count` |
| Capacitor | `sky130_fd_pr_main / cap_vpp_11p5x11p7_m1m4_noshield` | `width x length x multiplier` |
| Resistor | `sky130_fd_pr_main / res_high_po_5p73` | `segment_length x segment_width x segments x multiplier` |
| Diode | `sky130_fd_pr_main / diode_pd2nw_05v5` | `width x length x multiplier` |
| NPN BJT | `sky130_fd_pr_main / npn_05v5` | `1p x count` |
| PNP BJT | `sky130_fd_pr_main / pnp_05v5` | `0.4624p x count` |

주의:

- `ppa_included=true`는 최종 amplifier 후보의 gain path, bias, load-driving buffer에만 사용한다.
- AC-DC converter나 I/O protection 같은 bonus block의 area/power는 amplifier PPA에 포함하지 않고 `ppa_included=false`로 둔다.
- OPAMP buffer를 최종 Candidate B에 쓰면 `1000p` area penalty를 반드시 포함한다.
- Candidate B를 평가만 하고 최종 선택하지 않으면 해당 OPAMP row는 `ppa_included=false`로 남기고 notes에 rejected reason을 쓴다.

### 9.2 Power 계산

정적 power와 transient 평균 power 중 불리한 값을 최종 power로 기록한다.

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
* Candidate A transient netlist
wrdata ../results/ngspice/csv/bjt2_load10p_power.csv time i(vdd)
* Candidate B transient netlist, only when Candidate B is evaluated
wrdata ../results/ngspice/csv/bjt2_buffer_power.csv time i(vdd)
```

Candidate A는 `bjt2_load10p_power.csv`를 사용한다. Candidate B는 실제 평가한 경우에만 `bjt2_buffer_power.csv`를 만든다.

후처리 계산:

```text
Pavg = average(5 V * abs(I(VDD)))
```

최종 power 기준:

```text
worst_power_w = max(pdc_w, pavg_w)
```

결과 파일:

```text
results\ngspice\tables\power_calculation.csv
```

CSV columns:

```text
version,vdd_v,static_current_a,pdc_w,transient_avg_current_a,pavg_w,worst_power_w,notes
```

기록 규칙:

- `version`은 `bjt2_load10p` 또는 `bjt2_buffer`를 사용한다.
- `static_current_a`는 operating point 또는 DC-equivalent log에서 `abs(i(vdd))`로 계산한다.
- `transient_avg_current_a`는 settled transient 구간에서 `average(abs(i(vdd)))`로 계산한다.
- transient current를 저장하지 않은 후보는 `pavg_w`를 비워 두지 말고 transient simulation을 다시 실행해 candidate별 power CSV를 만든다.

### 9.3 AC target H(s) 비교

목표 H(s)는 `40 dB` midband gain, `10 Hz` lower cutoff, `20 kHz` upper cutoff, 양쪽 roll-off 약 `80 dB/decade`를 갖는 band-pass target으로 둔다.

target magnitude 정의:

```text
fL = 10
fH = 20000
Gmid = 100
target_gain_vv(f) = Gmid / sqrt(1 + (fL / f)^8) / sqrt(1 + (f / fH)^8)
target_gain_db(f) = 20 * log10(target_gain_vv(f))
target_phase_deg(f) = 4 * atan(fL / f) * 180/pi - 4 * atan(f / fH) * 180/pi
```

`target_phase_deg`는 target curve reference로만 쓰고, phase wrapping 때문에 RMSE 계산에는 gain 기준을 우선한다. phase plot에는 simulated phase와 target phase를 함께 표시한다.

target 결과 파일:

```text
results\ngspice\tables\target_hs.csv
```

`target_hs.csv` columns:

```text
frequency_hz,target_gain_vv,target_gain_db,target_phase_deg,weight
```

`weight`는 passband `10 Hz <= f <= 20 kHz`에서 `1.0`, low/high stopband에서 `0.5`로 둔다. 발표에서 passband flatness를 더 강하게 강조해야 하면 passband weight만 키우고, 그 변경은 notes에 남긴다.

candidate AC plot 파일:

```text
results\ngspice\plots\bjt2_load10p_ac.png
results\ngspice\plots\bjt2_buffer_ac.png
```

Candidate B plot은 Candidate B를 평가한 경우에만 만든다.

비교 절차:

1. 최종 후보가 Candidate A이면 `bjt2_load10p_ac.csv`, Candidate B이면 `bjt2_buffer_ac.csv`에서 frequency, gain_db, phase_deg를 읽는다.
2. 같은 frequency grid에서 target gain_db와 target phase_deg를 계산한다.
3. passband, low-frequency stopband, high-frequency stopband를 분리해 오차를 본다.
4. normalized RMSE를 계산한다.
5. plot에는 simulated curve와 target curve를 함께 표시한다.

normalized RMSE 정의:

```text
nRMSE = sqrt(mean((sim - target)^2)) / (max(target) - min(target))
```

AC nRMSE는 `sim = simulated gain_db`, `target = target_gain_db`로 계산한다. transient nRMSE는 voltage waveform 비교이므로 별도 column인 `tran_nrmse`에 기록하고 AC nRMSE와 합치지 않는다.

performance summary 결과 파일:

```text
results\ngspice\tables\performance_summary.csv
```

`performance_summary.csv` columns:

```text
version,load_pf,midband_gain_db,lower_cutoff_hz,upper_cutoff_hz,low_rolloff_db_dec,high_rolloff_db_dec,passband_ripple_db,ac_nrmse,tran_nrmse,power_w,area_p,decision,notes
```

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

candidate transient CSV와 plot 파일:

```text
results\ngspice\csv\bjt2_load10p_tran.csv
results\ngspice\plots\bjt2_load10p_tran.png
results\ngspice\csv\bjt2_buffer_tran.csv
results\ngspice\plots\bjt2_buffer_tran.png
```

Candidate B transient 파일은 Candidate B를 평가한 경우에만 만든다.

권장 transient CSV columns:

```text
time_s,vin_v,vout_v,vout_ac_v,target_vout_ac_v,error_v
```

`tran_nrmse`는 settled 구간의 output voltage waveform으로 계산한다. DC center를 제거해 `vout_ac_v = vout_v - mean(vout_v)`를 만들고, target은 `1 kHz`, `100 mV` nominal output sine을 simulated waveform의 settled zero-crossing 또는 fitted delay에 맞춰 정렬한다. normalization 범위는 target voltage waveform의 `max(target_vout_ac_v) - min(target_vout_ac_v)`를 사용한다.

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

Transient plot에는 최소 `vin_v`, `vout_v`, 필요 시 `target_vout_ac_v + DC center`를 함께 표시한다. clipping/distortion은 plot과 amplitude/DC center 표가 서로 일치해야 한다.

## 10. Candidate 선택 gate

최종 gate는 7.7.6절의 정량/정성 기준을 따른다. 이 장은 결과 계산 후 최종 선택표에 그대로 옮길 판단 문장이다.

### 10.1 Candidate A 선택 조건

Candidate A, 즉 BJT 2-stage only를 선택한다.

- DC operating point가 양 stage 모두 정상이다.
- 10 pF load 포함 상태에서 `1 kHz` midband gain이 `40 dB` 근처이다.
- lower cutoff가 `10 Hz` 근처이고 upper cutoff가 `20 kHz` 근처이다.
- transient에서 `1 mV`, `1 kHz` 입력이 2.5 V common-mode 주변에서 clipping 없이 약 `100 mV` 수준으로 증폭된다.
- 10 pF load로 인한 upper cutoff 저하, passband ripple, ringing이 target `H(s)` 대비 RMSE와 발표 설명 관점에서 허용 가능하다.
- OPAMP 없이 area penalty를 피할 수 있다.

### 10.2 Candidate B 평가 조건

다음 중 하나 이상이면 OPAMP buffer candidate를 평가한다.

- 10 pF load 때문에 upper cutoff가 목표보다 크게 낮아진다.
- output impedance 때문에 transient ringing이 발생한다.
- load 연결 후 gain이 크게 줄어든다.
- BJT-only output이 report에서 안정 동작이라고 방어하기 어렵다.
- Candidate A의 normalized RMSE 또는 transient 유사도가 load 영향 때문에 명확히 나빠진다.

### 10.3 Candidate B 선택 조건

Candidate B는 다음을 모두 만족할 때만 최종 선택한다.

- OPAMP가 voltage follower로 동작한다.
- BJT stages가 여전히 main gain을 제공한다.
- 10 pF load response가 Candidate A보다 명확히 좋아진다.
- 개선 폭이 `1000p` OPAMP area penalty와 `ft` 기반 static current penalty를 설명할 만큼 크다.
- target `H(s)` normalized RMSE 또는 transient 유사도가 Candidate A보다 좋아진다.
- 발표에서 "OPAMP가 main amplifier가 아니라 load buffer"라고 명확히 설명할 수 있다.

## 11. 제출 산출물 checklist

이 checklist는 실제 파일명 중심으로 관리한다. `bjt2_load10p`와 `bjt2_buffer` 중 최종 선택하지 않은 candidate의 optional 파일은 제출 완료 조건에서 제외하지만, 평가했다면 notes에 decision을 남긴다.

| 제출물 | 실제 파일명 | 완료 기준 |
| --- | --- | --- |
| schematic/testbench netlist | Candidate A: `netlists\bjt2_load10p_ac.spice`, `netlists\bjt2_load10p_tran.spice`; Candidate B 선택 시: `netlists\bjt2_buffer_ac.spice`, `netlists\bjt2_buffer_tran.spice` | 최종 candidate의 AC/transient netlist가 있고 log가 fatal/error 없이 통과 |
| device list | `results\ngspice\tables\device_list.csv` | 9.1 schema column을 모두 포함하고 final candidate의 소자를 모두 기록 |
| area CSV | `results\ngspice\tables\area_calculation.csv` | area formula, `area_p`, `ppa_included`가 모두 채워짐 |
| static/transient power result | `results\ngspice\tables\power_calculation.csv` | `worst_power_w = max(pdc_w, pavg_w)` 기준으로 final candidate row 작성 |
| AC response plot PNG | Candidate A: `results\ngspice\plots\bjt2_load10p_ac.png`; Candidate B 선택 시: `results\ngspice\plots\bjt2_buffer_ac.png` | simulated gain/phase와 target H(s)가 함께 보임 |
| transient response plot PNG | Candidate A: `results\ngspice\plots\bjt2_load10p_tran.png`; Candidate B 선택 시: `results\ngspice\plots\bjt2_buffer_tran.png` | `vin`, `vout`, target/reference waveform이 구분되어 보임 |
| target `H(s)` table | `results\ngspice\tables\target_hs.csv` | `frequency_hz,target_gain_vv,target_gain_db,target_phase_deg,weight` columns 포함 |
| target `H(s)` 대비 분석 | `results\ngspice\tables\performance_summary.csv` | gain/cutoff/rolloff/ripple/AC nRMSE/transient nRMSE/power/area/decision 기록 |
| PPA trade-off 설명 | 발표자료 final comparison table | Candidate A/B의 gain, bandwidth, power, area, 10 pF load 영향이 같은 단위로 비교됨 |
| 최종 발표 PDF | `조번호_발표자료.pdf` | 최종 선택 이유, target H(s) 비교, transient 비교, PPA trade-off 포함 |

완료 전 자체 확인:

```powershell
rg "device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv|nRMSE|worst_power_w" plan.md
```

## 12. 최종 실행 순서

다음 순서대로만 진행한다.

단, 5번 이후의 BJT 회로 관련 단계는 상세 회로 설계 확정 절차가 아니다. 5-7번은 기본 모델/동작 검증으로 제한하고, 최종 topology와 sizing을 요구하는 단계로 넘어가기 전에 사용자와 심층 논의를 통해 설계 계획을 재작성한다.

1. 완료: `ngspice_con.exe -v`로 설치 확인.
2. 완료: `sky130.lib.spice` 존재 확인.
3. 완료: `spice.rc` 작성.
4. 완료: `smoke_sky130.spice` 실행.
5. 완료: BJT 1-stage DC operating point 실행.
6. 완료: BJT 1-stage AC netlist 작성 및 실행.
7. 완료: BJT 1-stage transient netlist 작성 및 실행.
8. 완료: BJT 2-stage DC operating point 실행.
9. 다음: BJT 2-stage AC 실행.
10. 미완료: BJT 2-stage transient 실행.
11. 미완료: BJT 2-stage + 10 pF load AC 실행.
12. 미완료: BJT 2-stage + 10 pF load transient 실행.
13. 미완료: 필요한 경우 parameter sweep.
14. 미완료: Candidate A가 load 조건에서 실패할 때만 Candidate B buffer 실행.
15. 미완료: Candidate A/B 비교표 작성.
16. 미완료: area CSV 작성.
17. 미완료: power CSV 작성.
18. 미완료: H(s) target 대비 normalized RMSE와 정성 분석 작성.
19. 미완료: 최종 plot PNG 정리.
20. 미완료: 발표자료에 구조 선택 이유, gain/bandwidth/power/area trade-off, 10 pF load 결과를 넣는다.

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

## 15. Detailed Design Entry Readiness Checklist

Before moving from this planning document into detailed circuit sizing, all items below must be true.

| Gate | Required state |
| --- | --- |
| Current-state split | Completed work includes ngspice install, SKY130 PDK prep, `spice.rc`, SKY130 smoke test, BJT 1-stage DC OP, BJT 1-stage AC, BJT 1-stage transient, and BJT 2-stage DC OP. The next executable step is `netlists\bjt2_ac.spice`. |
| Simulator command | Batch runs use `C:\eda\ngspice\Spice64\bin\ngspice_con.exe` or `ngspice_con.exe` when PATH is active. `ngspice.exe` is not used for automated verification. |
| PDK include policy | BJT verification netlists use direct BJT includes: `models/corners/tt/nonfet.spice` and `cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice`. Full `.lib ".../sky130.lib.spice" tt` is treated as a known failing path for this Windows/ngspice setup unless separately fixed. |
| Allowed resistor cell | Final device lists and area tables use `sky130_fd_pr_main / res_high_po_5p73`; older resistor-cell spelling from the source document is not used as the final basis. |
| `bjt1_ac.spice` start | The common include header is fixed, `VIN` uses `DC {VCM} AC 1`, and outputs are `bjt1_ac.log`, `bjt1_ac.raw`, `bjt1_ac.csv`, an AC plot, and `bjt1_ac_summary.csv`. |
| `bjt1_tran.spice` start | The transient input source is `SIN({VCM} 1m 1k)`, with collector/output waveform checks for clipping and headroom. |
| `bjt2_op.spice` complete | Stage 2 has an independent DC bias path; stage 1 collector DC does not directly bias stage 2 through a shorted interstage path. Results exist in `bjt2_op.log`, `bjt2_op.raw`, and `bjt2_op_summary.csv`. |
| `bjt2_ac/tran` start | Node names follow the plan: `b1_*`, `b2_*`, and final output `vout_final`; unloaded baseline results exist before adding `10 pF`. |
| 10 pF load decision | `bjt2_load10p_ac/tran` is compared against unloaded baseline for gain loss, upper-cutoff shift, peaking, ringing, clipping, and output DC shift. |
| Parameter sweep record | Every accepted sweep row has a version tag, changed family/value, DC rail margin, gain/cutoff metrics, load sensitivity, transient result, power, area, and decision notes. |
| Candidate B trigger | `bjt2_buffer_*` is evaluated only after a recorded Candidate A load-condition failure or unacceptable margin; the failure reason is written before the buffer run is promoted. |
| Candidate B selection | OPAMP is only a voltage follower/load buffer, not the main gain source; any final Candidate B selection includes the `1000p` area penalty and `ft`-derived current penalty. |
| Area outputs | `device_list.csv` and `area_calculation.csv` exist with the schemas in section 9.1 and include only final-candidate PPA rows as `ppa_included=true`. |
| Power outputs | `power_calculation.csv` includes `pdc_w`, transient average power when available, and `worst_power_w = max(pdc_w, pavg_w)`. |
| Performance outputs | `target_hs.csv` and `performance_summary.csv` exist, with AC nRMSE and transient nRMSE kept as separate metrics. |
| Plot outputs | Final AC and transient PNGs show simulated response together with the target/reference data used for the report. |
| Log scan | Passing final logs have empty scans for `can't find`, `unknown`, `fatal`, `singular`, and `error`. Historical known-failure logs such as `smoke_sky130_noinit.log` are not used as final pass/fail evidence. |
| Final report handoff | The presentation/report table can directly cite final candidate, gain, bandwidth, roll-off, transient behavior, load effect, power, area, nRMSE, and the Candidate A/B decision. |

## 16. Current BJT2 OP Baseline

The first 2-stage DC baseline is now recorded in `netlists\bjt2_op.spice` and `results\ngspice\tables\bjt2_op_summary.csv`.

Key values:

- Stage 1: `VB=1.129207 V`, `VE=0.335519 V`, `VC=3.366164 V`, `VBE=0.793688 V`, `VCE=3.030645 V`
- Stage 2: `VB=1.129207 V`, `VE=0.335519 V`, `VC=3.365828 V`, `VBE=0.793688 V`, `VCE=3.030309 V`
- Final output DC: `vout_final=3.365828 V`
- Interstage DC separation: `b1_collector - b2_base = 2.236957 V`, confirming that `CINT` blocks direct DC transfer.
- Static current/power: `56.1394 uA`, `280.697 uW`

This baseline is acceptable for the next unloaded `bjt2_ac.spice` and `bjt2_tran.spice` runs because both BJT stages are on, have collector headroom, and avoid cutoff/saturation in the DC operating point.
