# Maxrun 02: 남은 시뮬레이션 workflow 완성

너는 `D:\Codex\Support`에서 작업하는 Codex maxrun이다. 목표는 `plan.md`의 남은 netlist 작성 및 시뮬레이션 실행 절차를 상세 설계 전에 바로 실행 가능한 수준으로 정리하는 것이다.

## 먼저 읽을 파일

1. `maxrun/MAXRUN_REFERENCE.md`
2. `plan.md`
3. `progress.md`
4. `netlists/smoke_sky130.spice`
5. `netlists/bjt1_op.spice`

## 수정 대상

주 수정 대상은 `plan.md`이다. 새 시뮬레이션을 실행하지 말고, workflow와 파일 산출물 계획만 완성한다.

## 해야 할 일

`plan.md`의 netlist 작성 순서와 시뮬레이션 workflow 절을 다음 기준으로 보강한다.

- 공통 include header는 통과한 BJT 직접 include 방식을 기준으로 작성한다.
- 모든 batch 실행 명령은 다음 형태를 기준으로 한다.

```powershell
& "C:\eda\ngspice\Spice64\bin\ngspice_con.exe" -b -o .\results\ngspice\logs\<name>.log .\netlists\<name>.spice
```

- 아래 파일 각각에 대해 목적, 입력 조건, 저장해야 할 log/raw/csv/plot/table 파일, 통과 기준을 명시한다.

```text
netlists\bjt1_ac.spice
netlists\bjt1_tran.spice
netlists\bjt2_op.spice
netlists\bjt2_ac.spice
netlists\bjt2_tran.spice
netlists\bjt2_load10p_ac.spice
netlists\bjt2_load10p_tran.spice
netlists\bjt2_buffer_ac.spice
netlists\bjt2_buffer_tran.spice
```

- `bjt1_ac`는 1-stage gain과 대역 sanity check로 제한한다고 쓴다.
- `bjt1_tran`은 `1 mV`, `1 kHz` small-signal에서 clipping/headroom을 확인한다고 쓴다.
- `bjt2_op`는 stage 1 collector DC가 stage 2 base에 직접 전달되지 않도록 coupling capacitor와 독립 bias를 확인한다고 쓴다.
- `bjt2_ac`는 unloaded response 기준이다.
- `bjt2_load10p_ac/tran`는 최종 평가 load 조건이다.
- optional buffer는 Candidate A가 load 조건에서 실패하거나 방어하기 어려울 때만 평가한다고 쓴다.
- log error scan 명령을 공통 검증으로 추가한다.

```powershell
Select-String .\results\ngspice\logs\<name>.log -Pattern "can't find|unknown|fatal|singular|error"
```

- `.control` block 예시는 실제 저장 파일 경로를 `D:/Codex/Support/results/...` 같은 absolute path 또는 현재 netlist에서 안정적으로 동작하는 경로 방식 중 하나로 통일한다.
- AC csv에는 최소 `frequency`, `gain_vv`, `gain_db`, `phase_deg`를 저장하도록 계획한다.
- transient csv에는 최소 `time`, `v(vin)`, `v(vout_final)`, stage 내부 collector/base/emitter 관찰 node를 저장하도록 계획한다.

## 주의할 점

- 이 run은 netlist를 실제 생성하거나 실행하는 것이 아니라 `plan.md`의 workflow를 완성하는 run이다.
- 상세 파라미터 값을 확정하지 않는다. 단, 시작점과 측정 기준은 명확히 쓴다.
- `progress.md`에 완료 기록을 추가하지 않는다.

## 완료 전 자체 확인

아래 항목이 `plan.md`에 모두 있는지 확인한다.

```powershell
rg "bjt1_ac|bjt1_tran|bjt2_op|bjt2_ac|bjt2_tran|bjt2_load10p|bjt2_buffer" plan.md
rg "gain_vv|gain_db|phase_deg|vout_final|ngspice_con.exe" plan.md
```

## 최종 응답

추가한 workflow와 아직 다음 run에서 다룰 design-space 항목을 짧게 보고한다.
