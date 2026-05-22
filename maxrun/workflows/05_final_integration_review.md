# Maxrun 05: `plan.md` 최종 통합 검토

너는 `D:\Codex\Support`에서 작업하는 Codex maxrun이다. 목표는 앞선 네 번의 run 이후 `plan.md`를 상세 설계에 들어가기 직전의 최종 계획 문서로 정리하는 것이다.

## 먼저 읽을 파일

1. `maxrun/MAXRUN_REFERENCE.md`
2. `maxrun/WORKFLOW_INDEX.md`
3. `plan.md`
4. `progress.md`
5. `전자회로프로젝트.md`

## 수정 대상

주 수정 대상은 `plan.md`이다. 이 run은 통합 검토이므로 새 시뮬레이션을 실행하지 않는다.

## 해야 할 일

`plan.md` 전체를 처음부터 끝까지 읽고 아래를 정리한다.

- 과거 상태와 현재 상태가 뒤섞인 문장을 제거하거나 고친다.
- `ngspice.exe`와 `ngspice_con.exe` 사용 기준이 모순되지 않게 한다.
- `sky130.lib.spice` 전체 include와 직접 include 방식의 역할이 모순되지 않게 한다.
- `res_high_po_5p73` 기준이 끝까지 유지되는지 확인한다.
- 완료된 항목과 예정 항목을 분리한다.
- netlist 파일명, 결과 파일명, checklist 파일명이 서로 일치하는지 확인한다.
- Candidate A/B 설명이 중복되거나 서로 다른 기준을 말하지 않게 한다.
- `80 dB/decade` 목표를 현실적인 검증 gate와 연결한다.
- area/power/performance 산출물 schema가 제출 checklist와 연결되도록 한다.
- final execution order를 현재 진행 상태 기준으로 다시 번호 매긴다.
- plan 말미에 "상세 설계 진입 전 readiness checklist"를 추가한다.

## Readiness checklist에 들어갈 항목

최소 아래 항목을 포함한다.

- `bjt1_ac.spice` 생성 전 공통 include header 확정
- `bjt1_tran.spice` 생성 전 transient input source 형식 확정
- `bjt2_op.spice` 생성 전 stage 2 독립 bias와 coupling capacitor 방침 확정
- `bjt2_ac/tran` 생성 전 node naming 규칙 확정
- `10 pF load` 평가 전 unloaded baseline 저장
- parameter sweep 전 baseline version tag 확정
- Candidate B 평가 전 Candidate A failure reason 기록
- final report 전 area/power/performance CSV와 plot PNG 생성 확인

## Placeholder와 모순 검색

아래 검색어를 확인하고, 실행자가 다시 물어봐야 할 정도로 애매하면 고친다.

```powershell
rg "TODO|TBD|나중|적절히|미정|필요시" plan.md
rg "res_xhigh|ngspice`와 `git`은 설치되어 있지 않다|QSMOKE|sky130.lib.spice\" tt" plan.md
```

검색어가 설명 목적으로 남아 있는 것은 괜찮지만, 기본 workflow처럼 남아 있으면 고친다.

## 완료 기준

최종 `plan.md`는 다음 질문에 바로 답할 수 있어야 한다.

- 현재 어디까지 끝났는가?
- 다음 netlist는 무엇인가?
- 어떤 명령으로 실행하는가?
- 어떤 파일이 생성되어야 하는가?
- 어떤 수치와 plot을 보고 통과/실패를 판단하는가?
- Candidate A/B 중 언제 buffer를 고려하는가?
- area/power/performance 결과는 어떤 CSV와 식으로 계산하는가?
- 최종 제출물은 어떤 파일들인가?

## 최종 응답

`plan.md`가 상세 설계 진입 가능 상태인지 판정하고, 남아 있는 위험이나 사용자가 직접 결정해야 할 항목이 있으면 짧게 적는다.
