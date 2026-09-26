import { ProcessItem, LineData, ManpowerStatus, LineBalancingMetrics } from '../types/ie';

export function calculateStatus(gap: number): ManpowerStatus {
  // If actual is significantly less than req -> คนขาด
  // Tolerance -1.0 to 0.5 considered balanced in production lines
  if (gap < -1.0) {
    return 'คนขาด';
  } else if (gap > 0.5) {
    return 'คนเกิน';
  } else {
    return 'สมดุล';
  }
}

export function computeProcessMetrics(
  item: ProcessItem,
  workTimeSeconds: number,
  lineEfficiency: number
): ProcessItem {
  const uph = Number(item.uph) || 1;
  const planQty = Number(item.planQty) || 1;
  const mpStd = Number(item.mpStd) || 0;
  const mpActual = Number(item.mpActual) || 0;

  // CT (Cycle Time) = 3600 / UPH * Eff
  const ct = Number(((3600 / uph) * lineEfficiency).toFixed(2));

  // TT (Takt Time) = Work Time / Plan Qty
  const tt = planQty > 0 ? Number((workTimeSeconds / planQty).toFixed(2)) : 0;

  // Speed Line (ชิ้น/นาที) = 60 / TT
  const speedLine = tt > 0 ? Number((60 / tt).toFixed(2)) : 0;

  // MP Req: Use manual override if specified (e.g. PU Foam exact line setup), otherwise mpStd * (CT / TT)
  let mpReq = 0;
  if (item.manualMpReqOverride !== undefined && item.manualMpReqOverride !== null) {
    mpReq = Number(item.manualMpReqOverride.toFixed(2));
  } else {
    mpReq = tt > 0 ? Number((mpStd * (ct / tt)).toFixed(2)) : mpStd;
  }

  // Gap = Actual - Req
  const gap = Number((mpActual - mpReq).toFixed(2));

  // Util % = MP Req / MP Actual
  const utilPercent = mpActual > 0 ? Number(((mpReq / mpActual) * 100).toFixed(1)) : 0;

  const status = calculateStatus(gap);

  return {
    ...item,
    ct,
    tt,
    speedLine,
    mpReq,
    gap,
    utilPercent,
    status,
  };
}

export function computeLineData(line: LineData): {
  computedLine: LineData;
  totalMpReq: number;
  totalMpActual: number;
  totalMpStd: number;
  totalGap: number;
  utilPercent: number;
  status: ManpowerStatus;
  gapActualMinusStd: number;
} {
  const computedProcesses = line.processes.map((proc) =>
    computeProcessMetrics(proc, line.workTimeSeconds, line.lineEfficiency)
  );

  const totalMpReq = Number(
    computedProcesses.reduce((sum, p) => sum + (p.mpReq || 0), 0).toFixed(1)
  );
  const totalMpActual = Number(
    computedProcesses.reduce((sum, p) => sum + (p.mpActual || 0), 0).toFixed(0)
  );
  const totalMpStd = Number(
    computedProcesses.reduce((sum, p) => sum + (p.mpStd || 0), 0).toFixed(0)
  );

  const totalGap = Number((totalMpActual - totalMpReq).toFixed(1));
  const gapActualMinusStd = Number((totalMpActual - totalMpStd).toFixed(1));

  const utilPercent =
    totalMpActual > 0
      ? Number(((totalMpReq / totalMpActual) * 100).toFixed(1))
      : 0;

  const status = calculateStatus(totalGap);

  return {
    computedLine: {
      ...line,
      processes: computedProcesses,
    },
    totalMpReq,
    totalMpActual,
    totalMpStd,
    totalGap,
    utilPercent,
    status,
    gapActualMinusStd,
  };
}

export function computeFactoryTotals(lineAData: LineData, lineBData: LineData) {
  const summaryA = computeLineData(lineAData);
  const summaryB = computeLineData(lineBData);

  const totalMpReq = Number((summaryA.totalMpReq + summaryB.totalMpReq).toFixed(1));
  const totalMpActual = summaryA.totalMpActual + summaryB.totalMpActual;
  const totalMpStd = summaryA.totalMpStd + summaryB.totalMpStd;
  const totalGap = Number((totalMpActual - totalMpReq).toFixed(1));
  const gapActualMinusStd = Number((totalMpActual - totalMpStd).toFixed(1));

  const utilPercent =
    totalMpActual > 0
      ? Number(((totalMpReq / totalMpActual) * 100).toFixed(1))
      : 0;

  const status = calculateStatus(totalGap);

  return {
    summaryA,
    summaryB,
    totalMpReq,
    totalMpActual,
    totalMpStd,
    totalGap,
    utilPercent,
    status,
    gapActualMinusStd,
  };
}

export function computeLineBalancingMetrics(line: LineData): LineBalancingMetrics {
  const { computedLine } = computeLineData(line);
  const processes = computedLine.processes;

  if (processes.length === 0) {
    return {
      totalCT: 0,
      bottleneckCT: 0,
      bottleneckProcess: '-',
      taktTime: 0,
      lineBalanceEfficiency: 0,
      balanceLoss: 100,
      smoothnessIndex: 0,
      bottlenecksCount: 0,
    };
  }

  const totalCT = processes.reduce((acc, p) => acc + (p.ct || 0), 0);
  let bottleneckCT = 0;
  let bottleneckProcess = '';

  processes.forEach((p) => {
    if ((p.ct || 0) > bottleneckCT) {
      bottleneckCT = p.ct || 0;
      bottleneckProcess = p.process;
    }
  });

  const mainTT =
    processes.find((p) => p.line === 'All')?.tt ||
    (line.planTotal > 0 ? line.workTimeSeconds / line.planTotal : 16);

  // Line Balance Efficiency = sum(CT) / (N * max(CT)) * 100%
  const N = processes.length;
  const lineBalanceEfficiency =
    bottleneckCT > 0 ? Number(((totalCT / (N * bottleneckCT)) * 100).toFixed(1)) : 0;
  const balanceLoss = Number((100 - lineBalanceEfficiency).toFixed(1));

  // Smoothness Index = sqrt( sum( (max(CT) - CT_i)^2 ) / N )
  const sumSquaredDiff = processes.reduce((acc, p) => {
    const diff = bottleneckCT - (p.ct || 0);
    return acc + diff * diff;
  }, 0);
  const smoothnessIndex = Number(Math.sqrt(sumSquaredDiff / N).toFixed(2));

  // Processes where CT > TT
  const bottlenecksCount = processes.filter((p) => (p.ct || 0) > (p.tt || 0)).length;

  return {
    totalCT: Number(totalCT.toFixed(2)),
    bottleneckCT: Number(bottleneckCT.toFixed(2)),
    bottleneckProcess,
    taktTime: Number(mainTT.toFixed(2)),
    lineBalanceEfficiency,
    balanceLoss,
    smoothnessIndex,
    bottlenecksCount,
  };
}
