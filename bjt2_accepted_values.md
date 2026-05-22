# Accepted 2BJT Candidate Detailed Values

Baseline candidate:

```text
bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k
```

Primary source netlist:

```text
netlists/bjt2_sweep_ppa_rc120k_re3p9k_rb4p7m_c68n_cout10n_ch22p_r10k_c220p_ft250k_ac.spice
```

Detailed schematic SVG:

```text
results/ngspice/plots/bjt2_accepted_schematic_detailed.svg
```

## Topology

```text
VIN
-> CIN
-> CE stage 1
-> C12
-> CE stage 2
-> COUT
-> output rebias divider
-> ideal OPAMP follower
-> two-pole RC low-pass filter
-> 10 pF external load
```

Signal path:

```text
vin -> b1_base -> b1_collector -> b2_base -> b2_collector
    -> vout_drv -> vop_ideal -> vbuf -> vfilt1 -> vout_final
```

## Global Parameters

| Parameter | Value | Meaning |
|---|---:|---|
| `VDD` | `5 V` | Supply voltage |
| `VCM` | `2.5 V` | Input common-mode voltage |
| `OPAMP_FT` | `250 kHz` | Ideal output buffer bandwidth model |
| `IOPAMP` | `1.75 uA` | `OPAMP_FT * 7e-12` |
| `ROPAMP` | `1 kohm` | OPAMP internal output pole resistor |
| `COPAMP` | `636.62 pF` | `1 / (2*pi*ROPAMP*OPAMP_FT)` |

## Input Source

| Element | Connection | Value |
|---|---|---:|
| `VIN` | `vin 0` | `DC 2.5 V`, `AC 1 V` |

## Stage 1 Values

| Element | Connection | Value |
|---|---|---:|
| `CIN` | `vin -> b1_base` | `68 nF` |
| `RB1_TOP` | `vdd -> b1_base` | `4.7 Mohm` |
| `RB1_BOT` | `b1_base -> 0` | `1 Mohm` |
| `RC1` | `vdd -> b1_collector` | `120 kohm` |
| `RE1` | `b1_emitter -> 0` | `3.9 kohm` |
| `Q1` | `b1_collector b1_base b1_emitter 0` | `sky130_fd_pr__npn_05v5_W1p00L1p00`, `mult=1` |
| `CH1` | `b1_collector -> 0` | `22 pF` |

## Interstage Coupling

| Element | Connection | Value |
|---|---|---:|
| `C12` | `b1_collector -> b2_base` | `68 nF` |

## Stage 2 Values

| Element | Connection | Value |
|---|---|---:|
| `RB2_TOP` | `vdd -> b2_base` | `4.7 Mohm` |
| `RB2_BOT` | `b2_base -> 0` | `1 Mohm` |
| `RC2` | `vdd -> b2_collector` | `120 kohm` |
| `RE2` | `b2_emitter -> 0` | `3.9 kohm` |
| `Q2` | `b2_collector b2_base b2_emitter 0` | `sky130_fd_pr__npn_05v5_W1p00L1p00`, `mult=1` |
| `CH2` | `b2_collector -> 0` | `22 pF` |

## Output Coupling And Rebias

| Element | Connection | Value |
|---|---|---:|
| `COUT` | `b2_collector -> vout_drv` | `10 nF` |
| `ROUT_TOP` | `vdd -> vout_drv` | `10 Mohm` |
| `ROUT_BOT` | `vout_drv -> 0` | `10 Mohm` |

The output rebias divider centers `vout_drv` near `2.5 V` before the buffer.

## Output Buffer And Low-Pass Filter

| Element | Connection | Value |
|---|---|---:|
| `EBUF` | `vop_ideal 0 vout_drv 0` | unity-gain ideal VCVS |
| `ROPAMP` | `vop_ideal -> vbuf` | `1 kohm` |
| `COPAMP` | `vbuf -> 0` | `636.62 pF` |
| `IOPAMP` | `vdd -> 0` | `1.75 uA` |
| `RBUF1` | `vbuf -> vfilt1` | `10 kohm` |
| `CBUF1` | `vfilt1 -> 0` | `220 pF` |
| `RBUF2` | `vfilt1 -> vout_final` | `10 kohm` |
| `CBUF2` | `vout_final -> 0` | `220 pF` |
| `CLOAD_10P` | `vout_final -> 0` | `10 pF` external load |

The 10 pF load is the required evaluation load and is excluded from amplifier
PPA area.

## Current Selected Performance

| Metric | Value | Comment |
|---|---:|---|
| Midband gain | `39.760102 dB` | About `97.2 V/V` |
| Lower cutoff | `12.569950 Hz` | Above nominal `10 Hz` target |
| Upper cutoff | `20409.380253 Hz` | Above `20 kHz` target |
| 10 Hz gain relative to midband | about `-4.39 dB` | More attenuation than ideal `-3 dB` corner |
| 20 kHz gain relative to midband | about `-2.90 dB` | Close to target |
| Low-frequency slope, 1 Hz to 10 Hz | about `+41 dB/dec` | Weaker than approximate `+80 dB/dec` target |
| Far high-frequency slope | `-80.5594 dB/dec` | From `100 kHz` to `1 MHz` |
| AC nRMSE | `0.136319434501` | Target H(s) fit metric |
| Transient nRMSE | `0.023733677809` | 50 ms to 100 ms target comparison |
| Output common-mode | `2.4983 V` | Close to `2.5 V` |
| 1 mV input transient output | `194.14 mVpp` | Near 100 V/V target |
| Noise, 10 Hz to 20 kHz | `7.365 uVrms` input-referred | From noise run |

## Power

| Metric | Value | Notes |
|---|---:|---|
| Static current | `13.0273 uA` | From `bjt2_power_calculation.csv` |
| DC power | `65.1365 uW` | `VDD * Istatic` |
| Transient average power | `65.1724334 uW` | Settled 50 ms to 100 ms window |
| Worst power | `65.1724334 uW` | `max(pdc_w, transient_avg_power_w)` |

## PPA Area Contributors

| Component | Value | Area | PPA included |
|---|---:|---:|---|
| `Q1-Q2` | two NPN BJTs | `2 p` | yes |
| `RC1-RC2` | `120 kohm` each | `24343.25446334 p` | yes |
| `RE1-RE2` | `3.9 kohm` each | `777.79218916 p` | yes |
| `RB1_TOP-RB2_TOP` | `4.7 Mohm` each | `953971.3097237 p` | yes |
| `RB1_BOT-RB2_BOT` | `1 Mohm` each | `202961.74543039 p` | yes |
| `ROUT_TOP-ROUT_BOT` | `10 Mohm` each | `2.02974177e6 p` | yes |
| `CIN,C12` | `68 nF` each | `1.66065886e8 p` | yes |
| `COUT` | `10 nF` | `1.22107269e7 p` | yes |
| `CH1-CH2` | `22 pF` each | `53727.19847536 p` | yes |
| `EBUF/IOPAMP` | ideal buffer model | `1000 p` | yes |
| `RBUF1-RBUF2` | `10 kohm` each | `2015.94309245 p` | yes |
| `CBUF1-CBUF2` | `220 pF` each | `537271.98475361 p` | yes |
| `CLOAD_10P` | `10 pF` | `12210.72692622 p` | no |

Total selected amplifier area:

```text
1.820824e8 p
```

Dominant area term:

```text
CIN + C12 = 1.66065886e8 p
```

This means the two 68 nF coupling capacitors dominate the PPA area.

## Comparison Against 3BJT Fallback

Comparison baseline:

```text
bjt3_sweep_hfbuf_r10k_c150p
```

| Metric | Current 2BJT | 3BJT fallback | Difference |
|---|---:|---:|---:|
| Power | `65.172 uW` | `235.862 uW` | `-170.690 uW` |
| Area | `1.820824e8 p` | `2.651698e8 p` | `-8.308739e7 p` |
| AC nRMSE | `0.136319` | `0.105900` | worse |
| Transient nRMSE | `0.023734` | `0.029755` | better |
| Far HF slope | `-80.5594 dB/dec` | `-87.1742 dB/dec` | weaker but passes proxy |

## Known Weak Points

The current 2BJT candidate is strong on power and area, but its performance
shape is not exact against the original target H(s).

Main weak points:

```text
fL is 12.57 Hz, not at or below 10 Hz.
10 Hz gain is about -4.39 dB from midband, not near -3 dB.
1 Hz to 10 Hz low-frequency slope is about +41 dB/dec, not near +80 dB/dec.
Far high-frequency slope passes only narrowly at -80.5594 dB/dec.
AC nRMSE is worse than the 3BJT fallback.
```

The next low-frequency PPA branch should test whether a small extra or reshaped
high-pass section improves target H(s) fit enough to raise the total PPA score.
