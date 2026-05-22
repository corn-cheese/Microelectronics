* Shared 3-stage BJT core for output rebias candidate.
* The including testbench must define VDD, VIN, CCPL, CH, RCVAL, REVAL, COUT, and ROUT.

CIN vin b1_base {CCPL}

RB1_TOP vdd b1_base 3.3Meg
RB1_BOT b1_base 0 1Meg
RC1 vdd b1_collector {RCVAL}
RE1 b1_emitter 0 {REVAL}
XQ1 b1_collector b1_base b1_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH1 b1_collector 0 {CH}

C12 b1_collector b2_base {CCPL}

RB2_TOP vdd b2_base 3.3Meg
RB2_BOT b2_base 0 1Meg
RC2 vdd b2_collector {RCVAL}
RE2 b2_emitter 0 {REVAL}
XQ2 b2_collector b2_base b2_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH2 b2_collector 0 {CH}

C23 b2_collector b3_base {CCPL}

RB3_TOP vdd b3_base 3.3Meg
RB3_BOT b3_base 0 1Meg
RC3 vdd b3_collector {RCVAL}
RE3 b3_emitter 0 {REVAL}
XQ3 b3_collector b3_base b3_emitter 0 sky130_fd_pr__npn_05v5_W1p00L1p00 mult=1
CH3 b3_collector 0 {CH}

COUT b3_collector vout_final {COUT}
ROUT_TOP vdd vout_final {ROUT}
ROUT_BOT vout_final 0 {ROUT}
CLOAD_10P vout_final 0 10p
