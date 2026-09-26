import React from 'react';
import { ManpowerStatus } from '../types/ie';

interface AlertBannerProps {
  status: ManpowerStatus;
  scopeLabel: string; // e.g. "โรงงานรวม (Line A+B)", "Line A", "Line B"
  mpRequired: number;
  mpActual: number;
  gap: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  status,
  scopeLabel,
  mpRequired,
  mpActual,
  gap,
}) => {
  const isShortage = gap < -1.0;
  const isSurplus = gap > 0.5;

  const statusTitle = isShortage
    ? 'คนขาด (Short)'
    : isSurplus
    ? 'คนเกิน (Surplus)'
    : 'สมดุล (Balanced)';

  const gapDetail = isShortage
    ? `(ขาด ${Math.abs(gap).toFixed(1)} คน)`
    : isSurplus
    ? `(เกิน ${gap.toFixed(1)} คน)`
    : '(กำลังพลพอดีกับแผน)';

  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 my-3 text-sm flex items-start sm:items-center gap-3 bg-white ${
        isShortage
          ? 'border-slate-200 border-l-4 border-l-rose-500'
          : isSurplus
          ? 'border-slate-200 border-l-4 border-l-blue-500'
          : 'border-slate-200 border-l-4 border-l-emerald-500'
      }`}
    >
      <div className="leading-relaxed">
        <span className="font-semibold text-slate-800">สรุปสถานะ: </span>
        <span
          className={`font-bold ${
            isShortage
              ? 'text-rose-600'
              : isSurplus
              ? 'text-blue-600'
              : 'text-emerald-600'
          }`}
        >
          {statusTitle}
        </span>
        <span className="text-slate-700">
          {' '}
          — {scopeLabel} ต้องการกำลังคน{' '}
          <strong className="font-mono font-bold text-slate-900">
            {mpRequired.toFixed(1)}
          </strong>{' '}
          คน ปัจจุบันมีอยู่{' '}
          <strong className="font-mono font-bold text-slate-900">{mpActual}</strong> คน{' '}
          <span
            className={`font-medium ${
              isShortage
                ? 'text-rose-600'
                : isSurplus
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}
          >
            {gapDetail}
          </span>
        </span>
      </div>
    </div>
  );
};
