# Maxrun 03: 상세 설계 전 design-space 계획 완성

너는 `D:\Codex\Support`에서 작업하는 Codex maxrun이다. 목표는 `plan.md`에 최종 회로값을 박기 전에 어떤 topology와 sweep으로 설계를 확정할지 명확히 쓰는 것이다.

## 먼저 읽을 파일

1. `maxrun/MAXRUN_REFERENCE.md`
2. `plan.md`
3. `progress.md`
4. `전자회로프로젝트.md`
5. `results/ngspice/tables/bjt1_op_summary.csv`

## 수정 대상

주 수정 대상은 `plan.md`이다. 새 netlist나 결과 파일을 만들지 않는다.

## 해야 할 일

`plan.md`에 "상세 설계 전 결정해야 할 설계 공간" 또는 이에 준하는 절을 보강한다.

반드시 포함할 내용:

- Candidate A 기본 구조: 2-stage BJT common-emitter amplifier
- Candidate B 보조 구조: BJT gain core + OPAMP voltage follower buffer
- OPAMP는 main gain source가 아니라 10 pF load driving buffer로만 쓴다는 기준
- stage별 목표 gain을 나누는 방법
  - 예: 두 CE stage가 각각 약 `10 V/V` 전후를 담당하면 전체 `100 V/V`에 접근
  - 실제 값은 bias, degeneration, load, capacitor interaction sweep으로 결정
- CE stage rough equation을 계획 수준으로 적는다.

```text
re ≈ 25.8 mV / IE
Av_stage ≈ -RC / (re + RE_unbypassed + reflected_loading)
PDC ≈ VDD x Istatic
```

- high-pass와 low-pass cutoff 산정식을 넣는다.

```text
fc ≈ 1 / (2πRC)
```

- `80 dB/decade` roll-off 목표는 1st-order pole 하나로는 불가능하므로, 필요한 pole 수와 현실적인 trade-off를 계획에 명시한다.
  - 1 pole: `20 dB/decade`
  - 2 poles: `40 dB/decade`
  - 4 poles: `80 dB/decade`
  - 실제 회로에서는 passband flatness, area, power와 충돌하므로 target `H(s)` 대비 RMSE와 설명 가능성을 함께 본다.
- sweep family를 한 번에 하나씩 바꾸는 순서로 정리한다.
  - `RB1_TOP/RB1_BOT`, `RE1`, `RC1`
  - `RB2_TOP/RB2_BOT`, `RE2`, `RC2`
  - `CIN`, `CINT`, output low-pass capacitor/network
  - optional emitter bypass capacitor
  - optional buffer ft/current only if Candidate B 평가
- 각 sweep의 관찰 지표를 표로 정리한다.
  - DC rail margin
  - midband gain at 1 kHz
  - lower cutoff
  - upper cutoff
  - passband ripple
  - 10 pF load sensitivity
  - transient amplitude
  - clipping/ringing
  - static current/power
  - estimated area
- Candidate A/B gate를 정량/정성 기준으로 정리한다.

## 쓰면 안 되는 것

- 최종 resistor/capacitor geometry를 임의 확정하지 않는다.
- OPAMP를 기본 증폭기로 쓰는 방향으로 계획을 바꾸지 않는다.
- `80 dB/decade`를 달성했다고 단정하지 않는다. 상세 설계와 검증 후 판단하도록 쓴다.
- 실행하지 않은 sweep 결과를 넣지 않는다.

## 완료 전 자체 확인

```powershell
rg "25.8 mV|80 dB/decade|20 dB/decade|40 dB/decade|4 poles|Candidate A|Candidate B|sweep" plan.md
```

## 최종 응답

보강한 설계-space 절과 다음 run에서 산출물/metric 쪽으로 넘길 항목을 짧게 보고한다.
