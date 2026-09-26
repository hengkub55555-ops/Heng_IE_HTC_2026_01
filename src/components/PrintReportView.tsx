import React from 'react';
import { LineData, ShiftConfig } from '../types/ie';
import { computeLineData, computeFactoryTotals } from '../utils/ieCalculations';
import { Printer, X } from 'lucide-react';

interface PrintReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  lineA: LineData;
  lineB: LineData;
  shiftConfig: ShiftConfig;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  isOpen,
  onClose,
  lineA,
  lineB,
  shiftConfig,
}) => {
  if (!isOpen) return null;

  const totals = computeFactoryTotals(lineA, lineB);
  const { summaryA, summaryB } = totals;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl p-8 my-auto space-y-6 text-slate-800">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span>ตัวอย่างเอกสารรายงานสำหรับการพิมพ์ / บันทึกเป็น PDF (Print Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              HAIER · INDUSTRIAL ENGINEERING DIVISION
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              MP Utilization & Line Balancing Daily Summary Report
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 font-medium">
              <span>รอบข้อมูล: {shiftConfig.date}</span>
              <span>·</span>
              <span>จำนวนกะ: {shiftConfig.shiftsPerDay} กะ/วัน</span>
              <span>·</span>
              <span>ประสิทธิภาพสายผลิตมาตรฐาน: {(shiftConfig.lineEfficiency * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-5 gap-3 border border-slate-300 p-3 rounded-lg bg-slate-50 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">MP REQUIRED</div>
              <div className="text-xl font-bold font-mono mt-0.5">{totals.totalMpReq.toFixed(1)}</div>
              <div className="text-[10px] text-slate-500">รวม Line A + B</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">MP ACTUAL</div>
              <div className="text-xl font-bold font-mono mt-0.5">{totals.totalMpActual}</div>
              <div className="text-[10px] text-slate-500">กำลังคนที่มีจริง</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">MP STD</div>
              <div className="text-xl font-bold font-mono mt-0.5">{totals.totalMpStd}</div>
              <div className="text-[10px] text-slate-500">
                Diff: {totals.gapActualMinusStd > 0 ? `+${totals.gapActualMinusStd}` : totals.gapActualMinusStd}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">GAP (ACT - REQ)</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${totals.totalGap < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {totals.totalGap.toFixed(1)}
              </div>
              <div className="text-[10px] font-semibold">{totals.status}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">UTILIZATION</div>
              <div className="text-xl font-bold font-mono mt-0.5">{totals.utilPercent.toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500">MP Req ÷ Actual</div>
            </div>
          </div>

          {/* Line A Table */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b pb-1">
              <span>สายการผลิต Line A (Plan: {lineA.planTotal} pcs)</span>
              <span className="font-mono text-xs font-normal">
                Req: {summaryA.totalMpReq.toFixed(1)} | Act: {summaryA.totalMpActual} | Gap: {summaryA.totalGap.toFixed(1)} | Util: {summaryA.utilPercent.toFixed(1)}%
              </span>
            </h2>
            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-1.5 border border-slate-300">Process</th>
                  <th className="p-1.5 border border-slate-300 text-center">Line</th>
                  <th className="p-1.5 border border-slate-300 text-right">Plan Qty</th>
                  <th className="p-1.5 border border-slate-300 text-right">UPH</th>
                  <th className="p-1.5 border border-slate-300 text-right">MP STD</th>
                  <th className="p-1.5 border border-slate-300 text-right">MP Act</th>
                  <th className="p-1.5 border border-slate-300 text-right">CT(s)</th>
                  <th className="p-1.5 border border-slate-300 text-right">TT(s)</th>
                  <th className="p-1.5 border border-slate-300 text-right">Speed</th>
                  <th className="p-1.5 border border-slate-300 text-right font-bold">MP Req</th>
                  <th className="p-1.5 border border-slate-300 text-right">Gap</th>
                  <th className="p-1.5 border border-slate-300 text-right">Util%</th>
                  <th className="p-1.5 border border-slate-300 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px]">
                {summaryA.computedLine.processes.map((p) => (
                  <tr key={p.id}>
                    <td className="p-1 border border-slate-300 font-sans font-medium">{p.process}</td>
                    <td className="p-1 border border-slate-300 text-center">{p.line}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.planQty}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.uph}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.mpStd}</td>
                    <td className="p-1 border border-slate-300 text-right font-bold">{p.mpActual}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.ct || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.tt || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.speedLine || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right font-bold">{(p.mpReq || 0).toFixed(2)}</td>
                    <td className={`p-1 border border-slate-300 text-right ${(p.gap || 0) < 0 ? 'text-rose-600' : ''}`}>
                      {(p.gap || 0).toFixed(2)}
                    </td>
                    <td className="p-1 border border-slate-300 text-right">{(p.utilPercent || 0).toFixed(0)}%</td>
                    <td className="p-1 border border-slate-300 text-center font-sans">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Line B Table */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b pb-1">
              <span>สายการผลิต Line B (Plan: {lineB.planTotal} pcs)</span>
              <span className="font-mono text-xs font-normal">
                Req: {summaryB.totalMpReq.toFixed(1)} | Act: {summaryB.totalMpActual} | Gap: {summaryB.totalGap.toFixed(1)} | Util: {summaryB.utilPercent.toFixed(1)}%
              </span>
            </h2>
            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-1.5 border border-slate-300">Process</th>
                  <th className="p-1.5 border border-slate-300 text-center">Line</th>
                  <th className="p-1.5 border border-slate-300 text-right">Plan Qty</th>
                  <th className="p-1.5 border border-slate-300 text-right">UPH</th>
                  <th className="p-1.5 border border-slate-300 text-right">MP STD</th>
                  <th className="p-1.5 border border-slate-300 text-right">MP Act</th>
                  <th className="p-1.5 border border-slate-300 text-right">CT(s)</th>
                  <th className="p-1.5 border border-slate-300 text-right">TT(s)</th>
                  <th className="p-1.5 border border-slate-300 text-right">Speed</th>
                  <th className="p-1.5 border border-slate-300 text-right font-bold">MP Req</th>
                  <th className="p-1.5 border border-slate-300 text-right">Gap</th>
                  <th className="p-1.5 border border-slate-300 text-right">Util%</th>
                  <th className="p-1.5 border border-slate-300 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px]">
                {summaryB.computedLine.processes.map((p) => (
                  <tr key={p.id}>
                    <td className="p-1 border border-slate-300 font-sans font-medium">{p.process}</td>
                    <td className="p-1 border border-slate-300 text-center">{p.line}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.planQty}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.uph}</td>
                    <td className="p-1 border border-slate-300 text-right">{p.mpStd}</td>
                    <td className="p-1 border border-slate-300 text-right font-bold">{p.mpActual}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.ct || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.tt || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right">{(p.speedLine || 0).toFixed(2)}</td>
                    <td className="p-1 border border-slate-300 text-right font-bold">{(p.mpReq || 0).toFixed(2)}</td>
                    <td className={`p-1 border border-slate-300 text-right ${(p.gap || 0) < 0 ? 'text-rose-600' : ''}`}>
                      {(p.gap || 0).toFixed(2)}
                    </td>
                    <td className="p-1 border border-slate-300 text-right">{(p.utilPercent || 0).toFixed(0)}%</td>
                    <td className="p-1 border border-slate-300 text-center font-sans">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signoff / Verification Box */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-xs">
            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-700">Prepared by (IE Engineer)</span>
              <div className="h-10"></div>
              <span className="text-[11px] text-slate-400">วันที่: ...../...../..........</span>
            </div>
            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-700">Reviewed by (Production Manager)</span>
              <div className="h-10"></div>
              <span className="text-[11px] text-slate-400">วันที่: ...../...../..........</span>
            </div>
            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-700">Approved by (Plant Director)</span>
              <div className="h-10"></div>
              <span className="text-[11px] text-slate-400">วันที่: ...../...../..........</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
