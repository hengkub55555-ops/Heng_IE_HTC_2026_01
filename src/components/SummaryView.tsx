import React from 'react';
import { LineData } from '../types/ie';
import { computeFactoryTotals, computeLineBalancingMetrics } from '../utils/ieCalculations';
import { MetricCards } from './MetricCards';
import { AlertBanner } from './AlertBanner';
import { ArrowRight, AlertTriangle, Users, TrendingUp, CheckCircle, Flame } from 'lucide-react';

interface SummaryViewProps {
  lineA: LineData;
  lineB: LineData;
  onSelectLine: (lineId: 'lineA' | 'lineB') => void;
  onSelectBalancing: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  lineA,
  lineB,
  onSelectLine,
  onSelectBalancing,
}) => {
  const totals = computeFactoryTotals(lineA, lineB);
  const { summaryA, summaryB } = totals;

  const balancingA = computeLineBalancingMetrics(lineA);
  const balancingB = computeLineBalancingMetrics(lineB);

  return (
    <div className="space-y-6">
      {/* 1. Status Alert Banner (Matches Screenshot 1) */}
      <AlertBanner
        status={totals.status}
        scopeLabel="โรงงานรวม (Line A+B)"
        mpRequired={totals.totalMpReq}
        mpActual={totals.totalMpActual}
        gap={totals.totalGap}
      />

      {/* 2. Top 5 Metric Cards (Matches Screenshot 1) */}
      <MetricCards
        mpRequired={totals.totalMpReq}
        mpActual={totals.totalMpActual}
        mpStd={totals.totalMpStd}
        gap={totals.totalGap}
        utilization={totals.utilPercent}
        planLabel="รวม Line A + B"
        actualMinusStd={totals.gapActualMinusStd}
      />

      {/* 3. Line A & Line B Cards (Matches Screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Line A Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <h2 className="text-base font-bold text-slate-900">Line A</h2>
              <span className="text-xs text-slate-400 font-mono">
                (Plan {lineA.planTotal.toLocaleString()} pcs)
              </span>
            </div>
            <button
              onClick={() => onSelectLine('lineA')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              ดูรายละเอียด / แก้ไข
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-sm mt-2">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP Required</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryA.totalMpReq.toFixed(1)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP Actual</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryA.totalMpActual}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP STD</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryA.totalMpStd}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Gap</span>
              <span
                className={`font-mono font-bold ${
                  summaryA.totalGap < 0
                    ? 'text-rose-600'
                    : summaryA.totalGap > 0
                    ? 'text-blue-600'
                    : 'text-emerald-600'
                }`}
              >
                {summaryA.totalGap > 0
                  ? `+${summaryA.totalGap.toFixed(1)}`
                  : summaryA.totalGap.toFixed(1)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Utilization</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryA.utilPercent.toFixed(1)}%
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">สถานะ</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                  summaryA.status === 'คนขาด'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : summaryA.status === 'คนเกิน'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {summaryA.status}
              </span>
            </div>
          </div>

          {/* Quick Line Health Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bottleneck: <strong>{balancingA.bottleneckProcess}</strong></span>
            <span>LBE: <strong>{balancingA.lineBalanceEfficiency}%</strong></span>
          </div>
        </div>

        {/* Line B Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <h2 className="text-base font-bold text-slate-900">Line B</h2>
              <span className="text-xs text-slate-400 font-mono">
                (Plan {lineB.planTotal.toLocaleString()} pcs)
              </span>
            </div>
            <button
              onClick={() => onSelectLine('lineB')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
            >
              ดูรายละเอียด / แก้ไข
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-sm mt-2">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP Required</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryB.totalMpReq.toFixed(1)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP Actual</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryB.totalMpActual}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">MP STD</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryB.totalMpStd}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Gap</span>
              <span
                className={`font-mono font-bold ${
                  summaryB.totalGap < 0
                    ? 'text-rose-600'
                    : summaryB.totalGap > 0
                    ? 'text-blue-600'
                    : 'text-emerald-600'
                }`}
              >
                {summaryB.totalGap > 0
                  ? `+${summaryB.totalGap.toFixed(1)}`
                  : summaryB.totalGap.toFixed(1)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Utilization</span>
              <span className="font-mono font-bold text-slate-900">
                {summaryB.utilPercent.toFixed(1)}%
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 font-medium">สถานะ</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                  summaryB.status === 'คนขาด'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : summaryB.status === 'คนเกิน'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {summaryB.status}
              </span>
            </div>
          </div>

          {/* Quick Line Health Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bottleneck: <strong>{balancingB.bottleneckProcess}</strong></span>
            <span>LBE: <strong>{balancingB.lineBalanceEfficiency}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4. IE Expert Factory Insights & Action Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              การวิเคราะห์เชิงลึกสำหรับวิศวกร IE (Industrial Engineering Insights)
            </h3>
          </div>
          <button
            onClick={onSelectBalancing}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            เปิดหน้า Line Balancing & Yamazumi Chart
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Card 1: Manpower Shortage Risk */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-4">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>ความเสี่ยงกำลังคนขาดแคลน (-58.4 คน)</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              อัตรา Utilization รวมอยู่ที่ <strong>{totals.utilPercent.toFixed(1)}%</strong> เกินเกณฑ์มาตรฐาน 100% 
              ส่งผลให้พนักงานต้องรับภาระงานหนัก (Overburden / Muri) เสี่ยงต่อความเหนื่อยล้า และผลผลิตไม่ได้ตามแผน 3,050 เครื่อง/วัน
            </p>
            <div className="mt-3 text-xs text-rose-700 font-medium">
              คำแนะนำ: เพิ่มกำลังคนชั่วคราว หรือพิจารณาทำ OT ประมาณ 45-60 นาที/กะ
            </div>
          </div>

          {/* Card 2: Bottleneck Identification */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>จุดคอขวดวิกฤต (Critical Bottlenecks)</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Line A คอขวดอยู่ที่ <strong>Inner Box A.2 (53.68s)</strong> และ Cab pre-assy A.2 <br />
              Line B คอขวดอยู่ที่ <strong>Inner Box line.2 (87.43s)</strong> <br />
              รอบเวลา Cycle Time สูงกว่าค่าเฉลี่ยของสายผลิตหลัก
            </p>
            <div className="mt-3 text-xs text-amber-700 font-medium">
              คำแนะนำ: ทำ Kaizen ลดขั้นตอนหยิบจับชิ้นงาน หรือแบ่งงาน Sub-assy
            </div>
          </div>

          {/* Card 3: Optimization Opportunity */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>โอกาสปรับเกลี่ยคน (Manpower Redistribution)</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              พบกระบวนการที่มีคนเกิน เช่น <strong>Cabinet PU Foam L1 (Line B)</strong> มีคนจริง 35 คน แต่ต้องการเพียง 4.04 คน (คนเกิน +30.96 คน)
            </p>
            <div className="mt-3 text-xs text-emerald-700 font-medium">
              คำแนะนำ: สามารถโยกย้ายกำลังพล 20-30 คน ไปช่วยจุดที่คนขาดได้ทันที
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
