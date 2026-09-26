import React, { useState } from 'react';
import { LineData, ProcessItem } from '../types/ie';
import { computeLineData, computeLineBalancingMetrics } from '../utils/ieCalculations';
import { 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  Sliders,
  Scissors
} from 'lucide-react';

interface LineBalancingViewProps {
  lineA: LineData;
  lineB: LineData;
  onUpdateLineA: (line: LineData) => void;
  onUpdateLineB: (line: LineData) => void;
}

export const LineBalancingView: React.FC<LineBalancingViewProps> = ({
  lineA,
  lineB,
  onUpdateLineA,
  onUpdateLineB,
}) => {
  const [selectedLineId, setSelectedLineId] = useState<'Line A' | 'Line B'>('Line A');
  const currentLine = selectedLineId === 'Line A' ? lineA : lineB;
  const onUpdateCurrentLine = selectedLineId === 'Line A' ? onUpdateLineA : onUpdateLineB;

  const { computedLine } = computeLineData(currentLine);
  const metrics = computeLineBalancingMetrics(currentLine);

  // Maximum CT for chart scaling
  const maxBarValue = Math.max(...computedLine.processes.map((p) => p.ct || 0), metrics.taktTime, 60) * 1.15;

  // Kaizen simulation on bottleneck
  const handleKaizenReduce = (procId: string, secondsReduction: number) => {
    const updated = currentLine.processes.map((p) => {
      if (p.id === procId) {
        // To reduce CT, we increase UPH: CT_new = CT_old - seconds -> UPH_new = (3600 * eff) / CT_new
        const currentCT = (3600 / p.uph) * currentLine.lineEfficiency;
        const targetCT = Math.max(5, currentCT - secondsReduction);
        const newUph = Math.round((3600 * currentLine.lineEfficiency) / targetCT);
        return {
          ...p,
          uph: newUph,
        };
      }
      return p;
    });
    onUpdateCurrentLine({
      ...currentLine,
      processes: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              การวิเคราะห์สมดุลสายการผลิต & แผนภูมิ Yamazumi (Line Balancing)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เครื่องมือวิเคราะห์ทางวิศวกรรมอุตสาหการ (IE) เพื่อค้นหาจุดคอขวด (Bottlenecks) และคำนวณดัชนีประสิทธิภาพ Line Balancing
          </p>
        </div>

        {/* Line Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedLineId('Line A')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              selectedLineId === 'Line A'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Line A ({lineA.processes.length} กระบวนการ)
          </button>
          <button
            onClick={() => setSelectedLineId('Line B')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              selectedLineId === 'Line B'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Line B ({lineB.processes.length} กระบวนการ)
          </button>
        </div>
      </div>

      {/* 4 Core IE KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* LBE */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Line Balancing Eff. (LBE)
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {metrics.lineBalanceEfficiency}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.lineBalanceEfficiency >= 85 ? (
              <span className="text-emerald-600 font-semibold">✓ อยู่ในเกณฑ์มาตรฐาน (&gt;85%)</span>
            ) : (
              <span className="text-rose-600 font-semibold">⚠ ต่ำกว่ามาตรฐาน (&lt;85%)</span>
            )}
          </div>
        </div>

        {/* Balance Loss */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Balance Loss (ความสูญเสีย)
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {metrics.balanceLoss}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            เวลาสูญเปล่าจากการรอคอย (Waiting Waste)
          </div>
        </div>

        {/* Bottleneck Process */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>จุดคอขวด (Bottleneck)</span>
          </div>
          <div className="text-lg font-bold text-rose-600 mt-1 truncate" title={metrics.bottleneckProcess}>
            {metrics.bottleneckProcess}
          </div>
          <div className="text-xs font-mono text-slate-600 mt-1">
            CT: <strong className="text-rose-600">{metrics.bottleneckCT}s</strong> (Takt: {metrics.taktTime}s)
          </div>
        </div>

        {/* Smoothness Index */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Smoothness Index (SI)
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {metrics.smoothnessIndex}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ยิ่งค่าน้อย ยิ่งกระจายงานได้ราบเรียบ
          </div>
        </div>
      </div>

      {/* Yamazumi Chart Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Yamazumi Chart — Cycle Time vs Takt Time ({selectedLineId})
            </h3>
            <p className="text-xs text-slate-500">
              แท่งกราฟแสดง Cycle Time (CT) แต่ละสถานีเทียบกับเส้นประ Takt Time (TT = {metrics.taktTime}s). 
              แท่งที่เกินเส้นประสีแดงถือเป็นจุดวิกฤตที่ทำให้สายผลิตหลุดแผน!
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
              <span className="text-slate-600">CT ปกติ (&lt; TT)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              <span className="text-rose-700 font-bold">คอขวด CT &gt; TT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500"></span>
              <span className="text-slate-700 font-semibold">Takt Time ({metrics.taktTime}s)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="space-y-3">
            {computedLine.processes.map((proc, index) => {
              const ct = proc.ct || 0;
              const tt = proc.tt || metrics.taktTime;
              const isBottleneck = ct > tt;
              const pctOfMax = (ct / maxBarValue) * 100;
              const ttPct = (tt / maxBarValue) * 100;

              return (
                <div key={proc.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 w-5 text-right">{index + 1}.</span>
                      <span className="font-medium text-slate-800">{proc.process}</span>
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded">
                        {proc.line}
                      </span>
                      {isBottleneck && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          เกิน Takt +{(ct - tt).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span>UPH: <strong>{proc.uph}</strong></span>
                      <span>TT: <strong>{tt.toFixed(1)}s</strong></span>
                      <span className={`font-bold ${isBottleneck ? 'text-rose-600' : 'text-slate-900'}`}>
                        CT: {ct.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Bar and Takt Marker */}
                  <div className="relative w-full h-7 bg-slate-100 rounded-md overflow-hidden flex items-center">
                    {/* Takt Time Target Line */}
                    <div
                      className="absolute top-0 bottom-0 z-10 border-r-2 border-dashed border-rose-500 pointer-events-none"
                      style={{ left: `${Math.min(100, ttPct)}%` }}
                    >
                      <span className="absolute -top-4 -translate-x-1/2 text-[9px] font-mono font-bold text-rose-600 bg-white px-1 rounded shadow-2xs">
                        TT {tt.toFixed(1)}s
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className={`h-full transition-all duration-300 rounded-l flex items-center justify-end pr-2 text-white font-mono text-xs font-semibold ${
                        isBottleneck
                          ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, pctOfMax)}%` }}
                    >
                      {pctOfMax > 15 && <span>{ct.toFixed(1)}s</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kaizen & Line Balancing Action Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">
            IE Kaizen Action Guide — แนวทางปรับปรุงสมดุลสายการผลิต
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-rose-600" />
              1. แบ่งแยกงานและลดเวลาที่สถานีคอขวด (De-bottlenecking)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              สำหรับสถานี <strong>{metrics.bottleneckProcess}</strong> ที่มีรอบเวลาสูงถึง {metrics.bottleneckCT}s 
              วิศวกร IE ควรเข้าไปจับเวลาแบบ Time & Motion Study เพื่อแยก Element งานที่ไม่เพิ่มมูลค่า (Non-Value Added) ออก 
              หรือแยกงาน Pre-assembly ออกไปทำก่อนเข้า Line หลัก
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-slate-500">ทดลองจำลอง Kaizen:</span>
              <button
                onClick={() => {
                  const bProc = computedLine.processes.find((p) => p.process === metrics.bottleneckProcess);
                  if (bProc) handleKaizenReduce(bProc.id, 5);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-semibold text-blue-600 transition-colors shadow-2xs"
              >
                ลด CT คอขวดลง -5 วินาที
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              2. เกลี่ยงานไปยังสถานีที่มีเวลาว่าง (Work Re-distribution)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              สถานีที่มี CT สั้นกว่า Takt Time มาก เช่น Cooling Test (17.79s) หรือ Rolling 
              มีเวลาว่างแฝง (Idle Time) สามารถรวมงานตรวจสอบชิ้นงาน (Inspection) หรือติดสติ๊กเกอร์จากสถานีคอขวดมาทำที่นี่ได้
            </p>
            <div className="text-emerald-700 font-semibold pt-1">
              ผลลัพธ์ที่คาดหวัง: จะเพิ่ม Line Balancing Efficiency ขึ้นเป็น &gt;88%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
