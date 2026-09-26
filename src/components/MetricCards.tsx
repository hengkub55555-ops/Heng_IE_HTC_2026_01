import React from 'react';

interface MetricCardsProps {
  mpRequired: number;
  mpActual: number;
  mpStd: number;
  gap: number;
  utilization: number;
  planLabel: string;
  actualMinusStd?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  mpRequired,
  mpActual,
  mpStd,
  gap,
  utilization,
  planLabel,
  actualMinusStd,
}) => {
  const isGapNegative = gap < 0;
  const gapSubtitle =
    gap < -1.0
      ? 'คนขาด (Short)'
      : gap > 0.5
      ? 'คนเกิน (Surplus)'
      : 'สมดุล (Balanced)';

  const diffStd = actualMinusStd !== undefined ? actualMinusStd : mpActual - mpStd;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 my-4">
      {/* 1. MP REQUIRED */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          MP REQUIRED
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {mpRequired.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">{planLabel}</div>
        </div>
      </div>

      {/* 2. MP ACTUAL */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          MP ACTUAL
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {mpActual}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">กำลังคนที่มีจริง</div>
        </div>
      </div>

      {/* 3. MP STD */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          MP STD
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {mpStd}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">
            Actual - STD = {diffStd > 0 ? `+${diffStd.toFixed(1)}` : diffStd.toFixed(1)}
          </div>
        </div>
      </div>

      {/* 4. GAP (ACT-REQ) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          GAP (ACT-REQ)
        </div>
        <div className="mt-1">
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              isGapNegative ? 'text-rose-600' : gap > 0 ? 'text-blue-600' : 'text-emerald-600'
            }`}
          >
            {gap > 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)}
          </div>
          <div
            className={`text-xs mt-1 font-medium ${
              isGapNegative ? 'text-rose-600' : gap > 0 ? 'text-blue-600' : 'text-emerald-600'
            }`}
          >
            {gapSubtitle}
          </div>
        </div>
      </div>

      {/* 5. UTILIZATION */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          UTILIZATION
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {utilization.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">MP Req ÷ MP Actual</div>
        </div>
      </div>
    </div>
  );
};
