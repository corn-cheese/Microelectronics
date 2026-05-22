# BJT 3-Stage Neural Signal Amplifier Project Plan

## 1. 목적

본 문서는 `전자회로프로젝트.md`의 요구사항을 기준으로, 회로도 작성 전에 수행해야 할 조사와 설계 계획을 정리한 문서이다. 목표는 주어진 소자만을 사용하여 single-ended 신경신호 증폭기를 설계하고, 제한된 power와 area 안에서 목표 AC/transient 성능을 최대한 만족하는 최선의 PPA 지점을 찾는 것이다.

본 설계의 기본 구조는 **NPN BJT 3단 common-emitter(CE) 증폭기**로 고정한다. 세 개의 CE stage를 AC coupling으로 연결하고, 최종 출력의 180도 반전은 목표 `H(s)`와 transient waveform 비교에 포함하여 해석한다고 가정한다.

## 2. 목표 사양 요약

| 항목 | 목표 |
| --- | --- |
| 구조 | Single-ended amplifier |
| Supply voltage | `5 V` |
| 기준 전압 | `2.5 V` |
| 입력 DC bias | `2.5 V` |
| 입력 AC amplitude | `1 mV` |
| Midband gain | `40 dB`, 약 `100 V/V` |
| Target bandwidth | `10 Hz - 20 kHz` |
| Roll-off | 저주파/고주파 양쪽에서 약 `80 dB/decade` |
| Load | `10 pF` |
| 평가 | AC response 유사도, transient response 유사도, area, power |

Passband에서 `1 mV` 입력이 들어오면 이상적으로는 약 `100 mV` 수준의 출력 신호가 기준 common-mode 주변에서 나타나야 한다. 단, 3개의 CE stage를 사용하므로 출력은 입력 대비 반전된다.

## 3. 기본 회로 방향

기본 신호 경로는 다음과 같이 둔다.

```text
VIN
-> CIN
-> CE1
-> C12
-> CE2
-> C23
-> CE3
-> output coupling/rebias 또는 CE3 collector output
-> 10 pF load
```

각 CE stage는 독립적인 DC bias divider와 emitter resistor를 가진다. Coupling capacitor는 이전 stage의 collector DC operating point가 다음 stage의 base bias를 직접 결정하지 않도록 DC를 차단한다.

기존 검증 결과에서 단일 CE stage의 gain은 다음과 같이 확인되어 있다.

| Baseline | 값 | 의미 |
| --- | ---: | --- |
| 1-stage AC gain | `4.482 V/V` | 1 kHz 기준 small-signal gain |
| 1-stage transient gain | `4.485 V/V` | 1 mV, 1 kHz 입력 기준 |
| 2-stage OP static current | `56.1394 uA` | 기존 2-stage DC operating point |
| 2-stage OP DC power | `280.697 uW` | `5 V x Istatic` |

목표 전체 gain `100 V/V`에 필요한 stage당 평균 gain은 다음과 같다.

```text
100^(1/3) = 4.64 V/V
```

따라서 기존 1-stage gain `4.48 V/V`는 3단으로 확장했을 때 이론적으로 약 `4.48^3 = 90.0 V/V`, 즉 약 `39.1 dB`에 도달한다. 약간의 bias, collector resistor, emitter degeneration 조정을 통해 OPAMP 없이 목표 `40 dB` 근처를 노릴 수 있으므로, 3-stage CE 구조는 PPA 관점에서 합리적인 기본 후보이다.

## 4. 사용 소자 정책

기본 amplifier에는 다음 소자를 우선 사용한다.

| 역할 | 사용할 소자 |
| --- | --- |
| 증폭 소자 | `sky130_fd_pr_main / npn_05v5` |
| 저항 | `sky130_fd_pr_main / res_high_po_5p73` |
| 커패시터 | `sky130_fd_pr_main / cap_vpp_11p5x11p7_m1m4_noshield` |
| 보호/옵션 | 필요 시 `diode_pd2nw_05v5` |

OPAMP는 기본 amplifier 후보에서 제외한다. OPAMP 하나는 `npn_05v5` 면적의 `1000p`로 계산되고, 선택한 `ft`에 따라 `Istatic = ft x 7 x 10^-12`의 전류 penalty를 갖기 때문이다. 10 pF load 구동 문제가 BJT-only 구조로 해결되지 않을 경우에만 별도 fallback으로 검토한다.

## 5. 목표 H(s) 정의

성능 비교용 목표 응답은 4차 band-pass 형태로 둔다.

```text
Gmid = 100
fL = 10 Hz
fH = 20 kHz

target_gain_vv(f)
  = Gmid / sqrt(1 + (fL / f)^8) / sqrt(1 + (f / fH)^8)
```

저주파와 고주파 양쪽에서 4차 pole에 해당하는 약 `80 dB/decade` 감쇠를 목표로 한다. 3-stage CE 구조는 최종 출력이 반전되므로 phase 비교나 transient signed waveform 비교에는 180도 반전을 포함한다. 만약 평가가 magnitude 중심이라면 gain magnitude와 waveform shape를 우선 비교한다.

## 6. 회로도 작성 전 조사 항목

### 6.1 Stage별 gain 조사

각 stage의 midband gain 목표는 약 `4.6 V/V`로 둔다. 조사할 변수는 다음과 같다.

| 조사 항목 | 목적 |
| --- | --- |
| `RC` sweep | gain 증가와 headroom 감소 trade-off 확인 |
| `RE` sweep | emitter degeneration에 따른 gain, linearity, power 변화 확인 |
| base divider current | bias 안정성과 static current/area trade-off 확인 |
| BJT multiplier | gain/current/area 변화 확인 |

각 stage의 collector DC는 rail에 붙지 않아야 하며, `VCE`는 transient swing을 감당할 만큼 충분히 확보되어야 한다.

### 6.2 Bias와 headroom 조사

3단을 단순히 같은 bias로 반복하면 최종 출력 DC가 `2.5 V` 기준에서 벗어날 수 있다. 따라서 CE3는 앞단과 같은 bias를 복사하기보다 output swing과 load 조건을 기준으로 collector bias를 다시 조정한다.

확인할 항목은 다음과 같다.

| 항목 | 확인 기준 |
| --- | --- |
| 각 stage `VBE` | BJT가 정상적으로 켜져 있는지 확인 |
| 각 stage `VCE` | saturation/rail 고착 여부 확인 |
| CE3 collector DC | 출력 기준 전압과 transient swing 여유 확인 |
| output rebias 필요성 | CE3 collector 직접 출력과 AC coupling + 2.5 V rebias 비교 |

### 6.3 Coupling capacitor와 저주파 pole 조사

10 Hz lower cutoff를 만들기 위해 입력 및 단간 coupling capacitor가 필요하다. 그러나 낮은 cutoff를 위해 capacitance를 키우면 area가 증가하고, 저항을 키우면 noise와 convergence 문제가 커질 수 있다.

조사할 조합은 다음과 같다.

| 위치 | 역할 |
| --- | --- |
| `CIN` | 입력 DC 2.5 V와 CE1 base bias 분리, low-frequency pole 형성 |
| `C12` | CE1 collector DC와 CE2 base bias 분리 |
| `C23` | CE2 collector DC와 CE3 base bias 분리 |
| output coupling | 필요 시 CE3 collector DC와 output common-mode 분리 |

각 coupling pole이 모두 10 Hz 근처에 몰리면 passband edge에서 gain droop가 커질 수 있다. 따라서 개별 pole 위치는 목표 H(s)의 4차 저주파 roll-off를 고려하여 분산 배치한다.

### 6.4 고주파 pole과 10 pF load 조사

10 pF load는 CE3 collector의 높은 output resistance와 결합하여 upper cutoff를 낮추고, gain loss나 phase delay를 유발할 수 있다. 따라서 unloaded 조건과 `10 pF` load 조건을 반드시 비교한다.

확인할 항목은 다음과 같다.

| 항목 | 위험 |
| --- | --- |
| upper cutoff shift | 20 kHz 이전에 gain이 떨어질 수 있음 |
| passband peaking | pole/zero 상호작용으로 ripple 발생 가능 |
| transient ringing | 10 pF load와 output resistance로 settling 악화 가능 |
| gain loss | CE3 collector load가 effective gain을 낮출 수 있음 |

BJT-only 구조에서 load 영향이 과도하면 다음 순서로 대응한다.

1. CE3 collector resistor와 bias current를 조정한다.
2. output pole capacitor 또는 load-isolation resistor를 검토한다.
3. 그래도 성능이 부족하면 OPAMP buffer를 fallback으로 검토하되, `1000p` area와 ft 기반 current penalty를 명확히 기록한다.

## 7. 예상 문제점과 설계 유의점

| 문제 | 원인 | 설계 유의점 |
| --- | --- | --- |
| 출력 반전 | CE stage 3개 사용 | 목표 `H(s)`와 transient 비교에 180도 phase를 포함 |
| 40 dB gain 부족 | stage loading, emitter degeneration 과다 | stage당 gain `4.6 V/V` 전후로 재분배 |
| clipping | gain이 한 stage에 몰림, collector bias 부적절 | gain 분산, CE3 headroom 확보 |
| lower cutoff 불일치 | coupling capacitor와 bias resistance 조합 부정확 | 각 coupling pole을 sweep하여 4차 목표와 비교 |
| capacitor area 증가 | 10 Hz pole 구현을 위해 큰 capacitor 필요 | R/C 조합별 area와 nRMSE를 함께 비교 |
| noise/convergence 문제 | 매우 큰 bias resistor 사용 | resistor 값을 과도하게 키우지 않고 simulation log 확인 |
| upper cutoff 저하 | 10 pF load와 output resistance 결합 | loaded/unloaded AC sweep 비교 |
| ringing/overshoot | output pole, interstage pole 상호작용 | transient response에서 settling과 overshoot 기록 |
| DC bias 간섭 | coupling 없이 stage 연결 | 모든 stage에 독립 bias path를 제공 |
| power 증가 | bias current 증가, fallback OPAMP 사용 | 성능 개선 대비 power penalty를 PPA 표에 반영 |

## 8. Simulation 계획

### 8.1 기본 검증 순서

1. 3-stage DC operating point 확인
2. Unloaded AC response 확인
3. Unloaded transient response 확인
4. `10 pF` load AC response 확인
5. `10 pF` load transient response 확인
6. Parameter sweep 수행
7. Area/power/performance summary table 작성
8. 최종 candidate와 rejected candidate 비교

### 8.2 필수 sweep

| Sweep | 목적 |
| --- | --- |
| per-stage `RC`, `RE` | gain과 headroom 최적화 |
| base divider resistance | bias 안정성, current, resistor area 비교 |
| `CIN`, `C12`, `C23` | 10 Hz lower cutoff와 capacitor area 비교 |
| CE3 bias/current | 10 pF load 구동 능력과 power 비교 |
| output coupling/rebias | 출력 common-mode와 transient shape 비교 |
| optional output pole | 20 kHz high cutoff와 ripple 조정 |

### 8.3 성능 지표

최종 후보는 다음 지표로 평가한다.

| 지표 | 기준 |
| --- | --- |
| midband gain | `40 dB`에 가까울수록 좋음 |
| lower cutoff | `10 Hz`에 가까울수록 좋음 |
| upper cutoff | `20 kHz`에 가까울수록 좋음 |
| roll-off | low/high 양쪽 약 `80 dB/decade` |
| passband ripple | 작을수록 좋음 |
| AC nRMSE | 목표 `H(s)` 대비 낮을수록 좋음 |
| transient nRMSE | target waveform 대비 낮을수록 좋음 |
| output swing | 1 mV 입력에 대해 약 100 mV 출력 |
| clipping/ringing | 없어야 함 |
| static power | 낮을수록 좋음 |
| area | 낮을수록 좋음 |

## 9. PPA 선택 기준

PPA 비교는 성능이 어느 정도 동작하는 후보만 포함한다. 단순히 area나 power가 낮아도 목표 gain/bandwidth/transient가 크게 벗어나면 최종 후보에서 제외한다.

최종 선택 gate는 다음과 같다.

| Gate | 통과 조건 |
| --- | --- |
| DC OP | 모든 BJT가 정상 bias, collector가 rail에 붙지 않음 |
| Gain | midband gain이 `40 dB` 근처 |
| Bandwidth | `10 Hz - 20 kHz` 목표 대역을 설명 가능하게 만족 |
| Load | `10 pF` 연결 후 gain loss, cutoff shift, ringing이 허용 범위 |
| Transient | 1 mV 입력에 대해 clipping 없이 약 100 mV 출력 |
| Area | 큰 capacitor와 OPAMP 사용을 최소화 |
| Power | bias current 증가가 성능 개선으로 정당화됨 |
| Explanation | 발표에서 구조 선택과 trade-off를 명확히 설명 가능 |

Capacitor area가 급증하거나 static current가 큰 후보는 성능 개선 폭이 충분하지 않으면 탈락시킨다. OPAMP buffer는 기본 PPA 경쟁에서 매우 불리하므로, BJT-only 구조가 load 조건에서 명확히 실패할 때만 비교 후보로 둔다.

## 10. 회로도 작성 전 확인 질문

회로도 작성 전에 다음 항목을 확인한다.

1. Transient 평가에서 출력 반전을 허용하는지, 또는 signed waveform이 비반전이어야 하는지 확인한다.
2. 목표 `H(s)`의 phase까지 RMSE에 포함하는지, magnitude 중심으로 비교하는지 확인한다.
3. 출력 common-mode가 반드시 `2.5 V` 주변이어야 하는지, 또는 AC coupling 후 rebias가 허용되는지 확인한다.
4. 10 Hz lower cutoff 구현을 위해 큰 capacitor를 사용하는 것이 area 점수에서 얼마나 불리한지 비교 기준을 정한다.
5. `10 pF` load가 실제 최종 출력에 항상 연결되는지, 또는 testbench에서만 연결되는지 확인한다.
6. OPAMP fallback을 사용할 경우 main gain path가 아니라 load buffer로만 인정되는지 확인한다.
7. 추가 옵션인 AC-DC converter와 I/O protection을 수행할지 여부를 정한다.

본 문서에서는 1번에 대해 출력 반전 허용을 기본 가정으로 둔다. 나머지 항목은 schematic 작성 및 simulation sweep 전에 확인하거나, 결과 분석에서 명시적으로 가정한다.

## 11. 제출물 연결 계획

최종 제출물에는 다음 자료가 연결되어야 한다.

| 제출 자료 | 포함 내용 |
| --- | --- |
| schematic/testbench netlist | 최종 3-stage BJT amplifier와 AC/transient testbench |
| device list CSV | BJT, resistor, capacitor, optional diode/OPAMP 사용 목록 |
| area calculation CSV | 주어진 산술 기준에 따른 area 계산 |
| power calculation | static power와 transient average power 중 불리한 값 |
| AC plot PNG | 목표 `H(s)`와 simulated response 비교 |
| transient plot PNG | 입력, 출력, target/reference waveform 비교 |
| performance summary | gain, cutoff, roll-off, ripple, nRMSE, clipping 여부 |
| 발표 PDF | 구조 선택 이유, PPA trade-off, load 안정성 설명 |

AC-DC converter와 I/O protection은 가산점 옵션으로만 다룬다. 해당 블록을 구현하더라도 amplifier 본 설계의 area/power PPA에는 포함하지 않는다.

## 12. 결론

3-stage NPN common-emitter 구조는 기존 1-stage 검증 결과를 기준으로 OPAMP 없이 목표 `40 dB` gain에 접근할 수 있는 가장 작은 구조이다. 핵심 위험은 10 Hz lower cutoff 구현에 필요한 capacitor area, 10 pF load로 인한 upper cutoff 저하, 3단 CE에 따른 출력 반전, 그리고 CE3 출력 common-mode/headroom이다.

따라서 회로도 작성 전에는 단순히 gain을 키우는 방향이 아니라, stage별 gain 분배, coupling pole 배치, output load sensitivity, transient distortion, area/power를 함께 sweep하여 목표 `H(s)`와 PPA의 균형점을 찾는 것이 최선의 설계 전략이다.
