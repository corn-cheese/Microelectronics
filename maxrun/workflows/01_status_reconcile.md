# Maxrun 01: `plan.md` 현재 상태 반영

너는 `D:\Codex\Support`에서 작업하는 Codex maxrun이다. 목표는 상세 설계 전에 `plan.md`가 실제 진행 상태와 맞도록 정리하는 것이다.

## 먼저 읽을 파일

1. `maxrun/MAXRUN_REFERENCE.md`
2. `plan.md`
3. `progress.md`
4. `전자회로프로젝트.md`
5. `netlists/smoke_sky130.spice`
6. `netlists/bjt1_op.spice`
7. `results/ngspice/tables/bjt1_op_summary.csv`

## 수정 대상

주 수정 대상은 `plan.md` 하나이다. 실제 시뮬레이션을 새로 실행하지 않았다면 `progress.md`, `netlists/`, `results/`는 수정하지 않는다.

## 해야 할 일

- `plan.md` 초반에 "현재 확정 상태" 또는 이에 준하는 절을 추가하거나 기존 절을 수정한다.
- 설치 전 가정으로 쓰인 문장을 현재 상태와 계획 상태로 분리한다.
- `ngspice` batch 실행 기준을 `ngspice_con.exe`로 정리한다.
- SourceForge `/download` URL이 HTML landing page를 저장할 수 있다는 점과 `curl.exe -L` 또는 직접 다운로드 URL 사용 기준을 반영한다.
- `sky130.lib.spice` 전체 include 실패 기록을 반영한다.
- 통과한 BJT 직접 include 방식을 smoke test와 이후 BJT netlist의 기준으로 둔다.
- NPN 인스턴스가 `Q`가 아니라 4-pin subckt `X... c b e s sky130_fd_pr__npn_05v5_W1p00L1p00` 방식임을 명시한다.
- `smoke_sky130.spice`와 `bjt1_op.spice`가 이미 통과한 상태임을 기록한다.
- BJT 1-stage OP 수치 요약을 `plan.md`에 짧게 넣고, 이 값은 최종 sizing이 아니라 sanity check라고 명시한다.
- 다음 미완료 단계가 `bjt1_ac.spice`와 `bjt1_tran.spice`부터 시작한다는 것을 분명히 한다.

## 쓰면 안 되는 것

- 실행하지 않은 AC/transient 결과를 완료했다고 쓰지 않는다.
- 이미 생성된 netlist나 result 파일을 삭제하지 않는다.
- 전체 `sky130.lib.spice` include를 계속 기본 template처럼 남기지 않는다. 단, 실패 원인 설명으로는 남겨도 된다.
- 저항 cell을 `res_xhigh_po_5p73`로 되돌리지 않는다. 최종 기준은 `res_high_po_5p73`이다.

## 완료 전 자체 확인

아래 명령으로 핵심 표기가 들어갔는지 확인한다.

```powershell
rg "ngspice_con|npn_05v5_W1p00L1p00|res_high_po_5p73|BJT 1-stage|smoke" plan.md
rg "현재 PowerShell 기준으로 `ngspice`와 `git`은 설치되어 있지 않다" plan.md
```

두 번째 명령에서 문장이 남아 있으면 현재 상태처럼 오해되지 않도록 수정한다.

## 최종 응답

수정한 `plan.md` 절 목록과 아직 다음 run으로 넘긴 항목을 짧게 보고한다.
