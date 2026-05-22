# 진행 기록: Windows Native ngspice + SKY130 PDK 준비

작성일: 2026-05-22

## 실행 범위

`plan.md` 중 다음 단계만 실행했다.

- Windows native ngspice 설치 준비 및 설치
- SKY130 PDK primitive ZIP 다운로드 및 압축 해제

다음 단계는 이번 실행 범위에서 제외했다.

- `spice.rc` 작성
- SKY130 smoke test 실행
- netlist 생성
- BJT 회로 시뮬레이션
- 결과 CSV/plot/table 생성

## 사전 상태 확인

초기 확인 결과는 다음과 같았다.

- `C:\Program Files\7-Zip\7z.exe`: 없음
- `ngspice`: PATH에서 찾을 수 없음
- `C:\eda\ngspice\Spice64\bin\ngspice.exe`: 없음
- `C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice`: 없음
- `C:\eda`: 없음
- `winget`: 없음

ngspice Windows 배포 파일이 `.7z` 형식이므로, 7-Zip을 먼저 설치한 뒤 ngspice를 압축 해제하는 방식으로 진행했다.

## 수행한 작업

### 1. 작업 디렉터리 생성

다음 디렉터리를 생성했다.

```text
C:\eda\downloads
C:\eda\ngspice
C:\eda\sky130
```

### 2. 7-Zip 설치

`winget`이 없어서 공식 7-Zip x64 installer를 직접 다운로드하여 silent install로 설치했다.

- installer: `7z2601-x64.exe`
- 설치 확인 경로: `C:\Program Files\7-Zip\7z.exe`

설치 후 `Test-Path "C:\Program Files\7-Zip\7z.exe"`가 `True`를 반환하는 것을 확인했다.

### 3. ngspice 다운로드 및 압축 해제

처음에는 `plan.md`에 있는 SourceForge `/download` URL로 `Invoke-WebRequest`를 사용했지만, 실제 `.7z` 파일 대신 SourceForge HTML landing page가 저장되었다.

- 잘못 저장된 파일 크기: 약 `137 KB`
- 파일 내용: HTML 문서

이후 `downloads.sourceforge.net` 직접 다운로드 URL과 `curl.exe -L`을 사용해 다시 다운로드했다.

- archive: `C:\eda\downloads\ngspice-46_64.7z`
- 최종 파일 크기: `10,675,950 bytes`
- archive magic bytes: `377ABCAF271C`
- 압축 해제 위치: `C:\eda\ngspice`
- 실행 파일 위치: `C:\eda\ngspice\Spice64\bin\ngspice.exe`

`C:\eda\ngspice\Spice64\bin`을 Windows 사용자 `maize`의 User PATH에 추가했다.

### 4. SKY130 PDK ZIP 다운로드 및 압축 해제

GitHub의 SKY130 primitive library ZIP을 다운로드했다.

- ZIP: `C:\eda\downloads\skywater-pdk-libs-sky130_fd_pr-main.zip`
- 최종 파일 크기: `123,694,316 bytes`
- ZIP magic bytes: `504B`
- 압축 해제 위치: `C:\eda\sky130`
- 최종 폴더명: `C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr`

압축 해제 후 다음 모델 파일이 존재하는 것을 확인했다.

```text
C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice
```

## 최종 검증 결과

다음 검증을 완료했다.

```powershell
Test-Path "C:\Program Files\7-Zip\7z.exe"
```

결과:

```text
True
```

실제 Windows 사용자 환경에서 PATH를 확인했다.

```powershell
where.exe ngspice
```

결과:

```text
C:\eda\ngspice\Spice64\bin\ngspice.exe
```

콘솔용 실행 파일로 ngspice 버전을 확인했다.

```powershell
ngspice_con -v
```

결과 요약:

```text
ngspice-46
Compiled with KLU Direct Linear Solver
Creation Date: Mar 29 2026 15:02:07
```

SKY130 모델 파일 존재 여부를 확인했다.

```powershell
Test-Path "C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice"
```

결과:

```text
True
```

## 참고 사항

Windows ngspice 패키지에는 `ngspice.exe`와 `ngspice_con.exe`가 함께 들어 있다.

- `ngspice.exe`: GUI 실행 파일로 동작하며, `-v` 실행 시 콘솔에 버전 텍스트가 바로 출력되지 않을 수 있다.
- `ngspice_con.exe`: 콘솔용 실행 파일이며, `-v` 실행 시 버전 배너가 정상 출력된다.

따라서 PowerShell에서 버전 확인이나 batch 실행을 할 때는 `ngspice_con.exe` 사용이 더 명확하다.

## 추가 진행: spice.rc 및 SKY130 smoke test

작성일: 2026-05-22

### 1. 현재 세션 상태 확인

Codex PowerShell 세션에서는 사용자 PATH 갱신이 아직 반영되지 않아 `where.exe ngspice`와 `where.exe ngspice_con`이 실행 파일을 찾지 못했다.

따라서 검증은 다음 절대 경로로 진행했다.

```text
C:\eda\ngspice\Spice64\bin\ngspice_con.exe
```

버전 확인 결과:

```text
ngspice-46
Compiled with KLU Direct Linear Solver
Creation Date: Mar 29 2026 15:02:07
```

SKY130 모델 파일은 다음 위치에 존재함을 확인했다.

```text
C:\eda\sky130\skywater-pdk-libs-sky130_fd_pr\models\sky130.lib.spice
```

### 2. spice.rc 작성

다음 파일을 작성했다.

```text
%USERPROFILE%\spice.rc
```

내용:

```spice
set ngbehavior=hsa
set skywaterpdk
set ng_nomodcheck
set num_threads=4
option klu
```

### 3. smoke test netlist 작성

다음 파일을 작성했다.

```text
netlists\smoke_sky130.spice
```

PDK의 `npn_05v5`는 단일 BJT model card가 아니라 4핀 subckt로 제공된다.

확인한 subckt:

```spice
.subckt sky130_fd_pr__npn_05v5_W1p00L1p00 c b e s
```

따라서 smoke test는 `Q` instance가 아니라 다음 형태의 `X` instance를 사용한다.

```spice
XSMOKE c b e 0 sky130_fd_pr__npn_05v5_W1p00L1p00 M=1
```

### 4. sky130.lib.spice 전체 include 확인 결과

초기 smoke netlist에서 plan의 기본 template처럼 다음 include를 먼저 시도했다.

```spice
.lib "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/sky130.lib.spice" tt
```

결과는 실패했다.

로그 핵심:

```text
Error in line   include "sky130_fd_pr__esd_nfet_05v0_nvt.pm3"
    Not enough parameters for i source
    line no. 820 from file ...\cells\nfet_05v0_nvt\sky130_fd_pr__nfet_05v0_nvt.pm3.spice

ERROR: fatal error in ngspice, exit(1)
```

원인 분리 결과:

- `sky130.lib.spice`의 `tt` corner가 MOS/ESD 모델까지 전체 include한다.
- 그 중 `nfet_05v0_nvt.pm3.spice` 내부에 Spectre-style `include "..."` 카드가 있고, 현재 ngspice 실행에서는 이를 current source `i...`로 해석해 fatal error가 발생한다.
- `-n --no-spiceinit`으로 `spice.rc`를 건너뛰어도 동일하게 실패했으므로 `spice.rc` 설정 때문은 아니다.

### 5. 통과한 BJT용 include 방식

PDK 자체 BJT testbench 패턴을 따라 전체 `sky130.lib.spice` 대신 필요한 BJT 관련 파일만 직접 include했다.

```spice
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/models/corners/tt/nonfet.spice"
.include "C:/eda/sky130/skywater-pdk-libs-sky130_fd_pr/cells/npn_05v5/sky130_fd_pr__npn_05v5__t.corner.spice"
```

실행 명령:

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\smoke_sky130.log .\netlists\smoke_sky130.spice
```

검증 결과:

- ngspice exit code: `0`
- `Select-String .\results\ngspice\logs\smoke_sky130.log -Pattern "can't find|unknown|fatal|singular|error"`: 빈 결과
- raw 생성 확인: `results\ngspice\raw\smoke_sky130.raw`

로그의 operating point 출력:

```text
v(vdd) = 5.000000e+00
v(c)   = 4.965966e+00
v(b)   = 7.500000e-01
v(e)   = 0.000000e+00
```

참고 warning:

```text
unrecognized parameter (dcap) - ignored
unrecognized parameter (gap1) - ignored
unrecognized parameter (gap2) - ignored
```

위 warning은 fatal이 아니며, smoke test 통과 기준인 include path, unknown model/subckt, fatal error, singular matrix 문제는 발생하지 않았다.

## 요구사항 source of truth 반영

작성일: 2026-05-22

사용자는 `전자회로프로젝트.md`를 과제 요구사항의 최종 기준으로 두라고 명시했다.

확인 결과 `전자회로프로젝트.md` 내부에는 다음 두 기록이 함께 존재한다.

```text
(26.05.19) 저항 모델 시뮬레이션 안되는 현상이 발견되어 사용 소자를 변경합니다. res_high_po_5p73
Resistor sky130_fd_pr_main의 res_xhigh_po_5p73
```

최신 변경사항을 우선하여 resistor cell은 `res_high_po_5p73`로 반영한다.

PDK 확인 결과 두 cell 모두 존재하지만, 앞으로 과제 제출용 device list와 area table에서는 `sky130_fd_pr_main / res_high_po_5p73`를 기준으로 기록한다.

확인한 ngspice subckt/model record:

```text
sky130_fd_pr__res_high_po_5p73
```

## 추가 진행: BJT 1-stage DC operating point

작성일: 2026-05-22

`plan.md`의 최종 실행 순서 중 5번, BJT 1-stage DC operating point를 실행했다.

### 생성한 netlist

```text
netlists\bjt1_op.spice
```

구성:

- SKY130 `npn_05v5` 4-pin subckt 사용
- `tt` corner의 BJT 관련 include만 직접 사용
- 1-stage common-emitter sanity check
- 초기 검증용 ideal resistor bias 사용
- 보고용 노드: `b1_base`, `b1_emitter`, `b1_collector`, `b1_out`

### 실행 명령

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\bjt1_op.log .\netlists\bjt1_op.spice
```

### 검증 결과

- ngspice exit code: `0`
- `Select-String .\results\ngspice\logs\bjt1_op.log -Pattern "can't find|unknown|fatal|singular|error"`: 빈 결과
- raw 생성 확인: `results\ngspice\raw\bjt1_op.raw`
- summary table 생성: `results\ngspice\tables\bjt1_op_summary.csv`

로그의 operating point 출력:

```text
v(vdd) = 5.000000e+00
v(b1_base) = 1.129207e+00
v(b1_emitter) = 3.355190e-01
v(b1_collector) = 3.365828e+00
v(b1_out) = 3.365828e+00
v(b1_base)-v(b1_emitter) = 7.936884e-01
v(b1_collector)-v(b1_emitter) = 3.030309e+00
i(vdd) = -2.80714e-05
```

판단:

- `VBE1 = 0.793688 V`로 BJT가 켜져 있다.
- `VCE1 = 3.030309 V`로 saturation/rail 고착 상태가 아니다.
- collector는 `3.365828 V`로 0 V 또는 5 V rail에 붙지 않았다.
- 정적 전류는 `28.0714 uA`, 정적 전력은 약 `140.357 uW`이다.

참고 warning:

```text
unrecognized parameter (dcap) - ignored
unrecognized parameter (gap1) - ignored
unrecognized parameter (gap2) - ignored
```

위 warning은 smoke test 때와 동일한 PDK model parameter warning이며, fatal/error/singular 문제는 발생하지 않았다.
