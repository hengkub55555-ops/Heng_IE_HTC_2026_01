export type SubLineType = 'All' | 'L1' | 'L2' | string;

export type ManpowerStatus = 'คนขาด' | 'สมดุล' | 'คนเกิน';

export interface ProcessItem {
  id: string;
  process: string;
  line: SubLineType;
  planQty: number;
  uph: number;
  mpStd: number;
  mpActual: number;
  // Computed fields (or custom overrides)
  ct?: number;           // Cycle Time (s) = 3600 / uph * eff
  tt?: number;           // Takt Time (s) = workTime / planQty
  speedLine?: number;    // Speed Line (pcs/min) = 60 / tt
  mpReq?: number;        // MP Required
  gap?: number;          // Gap = mpActual - mpReq
  utilPercent?: number;  // Util % = (mpReq / mpActual) * 100
  status?: ManpowerStatus;
  manualMpReqOverride?: number; // In case of special line processes
  notes?: string;
}

export interface LineData {
  id: 'Line A' | 'Line B';
  name: string;
  color: string; // 'blue' | 'amber'
  planTotal: number;
  workTimeSeconds: number; // e.g. 28,800 s (8 hours net operating)
  lineEfficiency: number;  // e.g. 0.85
  processes: ProcessItem[];
}

export interface ShiftConfig {
  date: string;
  shiftsPerDay: number;
  hoursPerShift: number;
  netWorkSecondsPerShift: number; // e.g. 14,400s per shift = 28,800s total
  lineEfficiency: number; // e.g. 0.85 (85%)
}

export interface LineBalancingMetrics {
  totalCT: number;
  bottleneckCT: number;
  bottleneckProcess: string;
  taktTime: number;
  lineBalanceEfficiency: number; // LBE %
  balanceLoss: number;           // 100 - LBE
  smoothnessIndex: number;
  bottlenecksCount: number;
}
