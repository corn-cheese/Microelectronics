# Maxrun Workflow Index

`plan.md`를 상세 설계 전 단계까지 완성하려면 maxrun을 총 **5번** 돌리는 것을 권장한다. 각 run은 한 가지 관점만 맡기고, 마지막 run에서 전체 모순을 정리한다.

## 실행 순서

1. `workflows/01_status_reconcile.md`
   - 현재 진행 상태와 `plan.md`의 과거 가정을 맞춘다.
   - 설치, PDK, smoke test, BJT 1-stage OP 결과를 반영한다.

2. `workflows/02_simulation_workflow.md`
   - 남은 netlist와 시뮬레이션 실행 workflow를 완성한다.
   - AC/transient/load/buffer별 파일, 명령, 산출물을 정한다.

3. `workflows/03_design_space_workflow.md`
   - 상세 설계 전에 필요한 topology, bias, pole/zero, sweep, candidate gate 계획을 완성한다.
   - 최종 sizing은 확정하지 않고 결정 절차를 명확히 한다.

4. `workflows/04_metrics_deliverables_workflow.md`
   - area, power, target `H(s)`, normalized RMSE, plot/table/report 산출물 계획을 완성한다.
   - 제출 checklist를 실제 파일명 중심으로 정리한다.

5. `workflows/05_final_integration_review.md`
   - `plan.md` 전체를 읽고 중복, 모순, stale 내용, 빠진 산출물을 정리한다.
   - 상세 설계에 들어가도 되는 상태인지 최종 판정한다.

## PowerShell 실행 예

아래 스크립트를 한 번 실행하면 5개 workflow가 순서대로 실행된다.

```powershell
powershell -ExecutionPolicy Bypass -File .\maxrun\run_plan_maxrun.ps1
```

개별 workflow만 실행하려면 `codex exec`에 파일 내용을 인자로 넘긴다. `codex maxrun`은 이 CLI에서 정식 subcommand가 아니며, 파이프 입력 시 `stdin is not a terminal` 오류가 날 수 있다.

```powershell
codex.cmd exec --cd D:\Codex\Support (Get-Content -Raw .\maxrun\workflows\01_status_reconcile.md)
```

## Run 사이 확인

각 run이 끝날 때마다 최소한 다음을 확인한다.

```powershell
git diff -- plan.md
rg "TODO|TBD|나중|적절히" plan.md
```

`progress.md`나 netlist 파일이 변경되었다면 그 run이 실제 실행을 했는지 확인한다. 이번 목표는 계획 완성이므로 대부분의 run은 `plan.md`만 수정하는 것이 정상이다.

## 완료 판정

5번째 run 이후 `plan.md`가 아래 조건을 만족하면 상세 설계 단계로 넘어간다.

- 현재 완료 상태와 다음 진행 단계가 분리되어 있다.
- `ngspice_con.exe`와 통과한 BJT include 방식이 기준으로 반영되어 있다.
- 남은 시뮬레이션의 파일명, 명령, 산출물, 통과 기준이 빠짐없이 있다.
- parameter sweep과 Candidate A/B gate가 명확하다.
- area/power/performance 산출물 schema가 정해져 있다.
- 최종 제출물 checklist가 과제 요구사항과 일치한다.

보너스 회로까지 `plan.md`에 자세히 넣고 싶다면 5번 완료 후 optional로 한 번 더 돌린다. 기본 amplifier 계획 완성에는 포함하지 않는다.
