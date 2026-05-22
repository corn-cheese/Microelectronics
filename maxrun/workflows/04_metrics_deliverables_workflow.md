# Maxrun 04: metric 계산과 제출 산출물 계획 완성

너는 `D:\Codex\Support`에서 작업하는 Codex maxrun이다. 목표는 `plan.md`의 결과 계산, 성능 비교, 제출물 checklist가 실제 파일 단위로 완성되도록 정리하는 것이다.

## 먼저 읽을 파일

1. `maxrun/MAXRUN_REFERENCE.md`
2. `plan.md`
3. `progress.md`
4. `전자회로프로젝트.md`

## 수정 대상

주 수정 대상은 `plan.md`이다. 실제 결과 CSV를 새로 만들지 않는다.

## 해야 할 일

`plan.md`의 결과 계산 workflow와 제출 산출물 절을 다음 기준으로 보강한다.

### Area

아래 파일 schema를 구체화한다.

```text
results\ngspice\tables\device_list.csv
results\ngspice\tables\area_calculation.csv
```

`area_calculation.csv`에는 최소 다음 columns를 둔다.

```text
component,logical_role,library_cell,value,geometry,area_formula,area_p,ppa_included,notes
```

OPAMP, capacitor, resistor, diode, NPN, PNP area 기준을 과제 요구사항과 맞춘다. bonus block은 amplifier PPA에 포함하지 않는다는 column 또는 notes 기준을 넣는다.

### Power

아래 파일 schema를 구체화한다.

```text
results\ngspice\tables\power_calculation.csv
```

최소 columns:

```text
version,vdd_v,static_current_a,pdc_w,transient_avg_current_a,pavg_w,worst_power_w,notes
```

`worst_power_w = max(pdc_w, pavg_w)` 기준을 명확히 쓴다.

### AC response와 target H(s)

아래 파일 schema를 구체화한다.

```text
results\ngspice\tables\target_hs.csv
results\ngspice\tables\performance_summary.csv
results\ngspice\plots\<candidate>_ac.png
```

`target_hs.csv`에는 최소 다음 columns를 둔다.

```text
frequency_hz,target_gain_vv,target_gain_db,target_phase_deg,weight
```

`performance_summary.csv`에는 최소 다음 columns를 둔다.

```text
version,load_pf,midband_gain_db,lower_cutoff_hz,upper_cutoff_hz,low_rolloff_db_dec,high_rolloff_db_dec,passband_ripple_db,ac_nrmse,tran_nrmse,power_w,area_p,decision,notes
```

normalized RMSE 계산 정의를 넣는다.

```text
nRMSE = sqrt(mean((sim - target)^2)) / (max(target) - min(target))
```

gain dB 비교와 waveform voltage 비교의 normalization 범위가 다르므로 AC와 transient는 별도 nRMSE로 기록한다고 쓴다.

### Transient response

아래 산출물을 명시한다.

```text
results\ngspice\csv\<candidate>_tran.csv
results\ngspice\plots\<candidate>_tran.png
```

비교 항목:

- output amplitude
- DC center
- delay/settling
- overshoot/ringing
- clipping/distortion
- 10 pF load 영향

### 제출 checklist

`전자회로프로젝트.md`의 제출 요구사항을 기준으로 `plan.md` checklist를 실제 파일명 중심으로 정리한다.

- schematic/testbench netlist
- device list
- area CSV
- static current/power result
- AC response plot PNG
- transient response plot PNG
- target `H(s)` 대비 분석
- PPA trade-off 설명
- 발표 PDF

## 쓰면 안 되는 것

- 아직 없는 plot이나 CSV를 생성 완료로 표시하지 않는다.
- 산출물 파일명을 모호하게 쓰지 않는다.
- bonus block의 area/power를 amplifier PPA에 섞지 않는다.

## 완료 전 자체 확인

```powershell
rg "device_list.csv|area_calculation.csv|power_calculation.csv|target_hs.csv|performance_summary.csv|nRMSE|worst_power_w" plan.md
```

## 최종 응답

정리한 metric/산출물 schema와 다음 final integration run에서 확인해야 할 항목을 짧게 보고한다.
