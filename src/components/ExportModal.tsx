import React, { useState } from 'react';
import { LineData, ShiftConfig } from '../types/ie';
import { computeLineData, computeFactoryTotals } from '../utils/ieCalculations';
import { X, Download, Copy, Check, FileSpreadsheet, MessageSquareQuote } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineA: LineData;
  lineB: LineData;
  shiftConfig: ShiftConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  lineA,
  lineB,
  shiftConfig,
}) => {
  if (!isOpen) return null;

  const [copiedAsakai, setCopiedAsakai] = useState(false);
  const totals = computeFactoryTotals(lineA, lineB);
  const { summaryA, summaryB } = totals;

  // Prepare CSV Export
  const downloadCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support

    // Header metadata
    csvContent += `HAIER INDUSTRIAL ENGINEERING - MP UTILIZATION SUMMARY REPORT\n`;
    csvContent += `รอบข้อมูล: ${shiftConfig.date},จำนวนกะ: ${shiftConfig.shiftsPerDay} กะ/วัน,Line Efficiency: ${(shiftConfig.lineEfficiency * 100).toFixed(0)}%\n\n`;

    // Factory Overview
    csvContent += `สรุปภาพรวมโรงงาน,MP Required,MP Actual,MP STD,Gap (Actual - Req),Utilization %,สถานะ\n`;
    csvContent += `Line A,${summaryA.totalMpReq.toFixed(1)},${summaryA.totalMpActual},${summaryA.totalMpStd},${summaryA.totalGap.toFixed(1)},${summaryA.utilPercent.toFixed(1)}%,${summaryA.status}\n`;
    csvContent += `Line B,${summaryB.totalMpReq.toFixed(1)},${summaryB.totalMpActual},${summaryB.totalMpStd},${summaryB.totalGap.toFixed(1)},${summaryB.utilPercent.toFixed(1)}%,${summaryB.status}\n`;
    csvContent += `โรงงานรวม (Line A+B),${totals.totalMpReq.toFixed(1)},${totals.totalMpActual},${totals.totalMpStd},${totals.totalGap.toFixed(1)},${totals.utilPercent.toFixed(1)}%,${totals.status}\n\n`;

    // Process Details - Line A
    csvContent += `รายละเอียดกระบวนการ Line A\n`;
    csvContent += `Process,Line,Plan Qty,UPH,MP STD,MP Actual,CT (s),TT (s),Speed Line (pcs/min),MP Req,Gap,Util %,Status\n`;
    summaryA.computedLine.processes.forEach((p) => {
      csvContent += `"${p.process}",${p.line},${p.planQty},${p.uph},${p.mpStd},${p.mpActual},${(p.ct || 0).toFixed(2)},${(p.tt || 0).toFixed(2)},${(p.speedLine || 0).toFixed(2)},${(p.mpReq || 0).toFixed(2)},${(p.gap || 0).toFixed(2)},${(p.utilPercent || 0).toFixed(0)}%,${p.status}\n`;
    });
    csvContent += `\n`;

    // Process Details - Line B
    csvContent += `รายละเอียดกระบวนการ Line B\n`;
    csvContent += `Process,Line,Plan Qty,UPH,MP STD,MP Actual,CT (s),TT (s),Speed Line (pcs/min),MP Req,Gap,Util %,Status\n`;
    summaryB.computedLine.processes.forEach((p) => {
      csvContent += `"${p.process}",${p.line},${p.planQty},${p.uph},${p.mpStd},${p.mpActual},${(p.ct || 0).toFixed(2)},${(p.tt || 0).toFixed(2)},${(p.speedLine || 0).toFixed(2)},${(p.mpReq || 0).toFixed(2)},${(p.gap || 0).toFixed(2)},${(p.utilPercent || 0).toFixed(0)}%,${p.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Haier_IE_MP_Utilization_${shiftConfig.date.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Asakai Brief for Morning Production Meeting
  const copyAsakaiText = () => {
    const text = `📊 [Haier IE Daily Standup Report]
รอบข้อมูล: ${shiftConfig.date} (Shift: ${shiftConfig.shiftsPerDay} กะ/วัน)

📌 สรุปสถานะภาพรวม: ${totals.status}
- MP Required: ${totals.totalMpReq.toFixed(1)} คน
- MP Actual: ${totals.totalMpActual} คน (STD: ${totals.totalMpStd})
- Gap (คนขาด/เกิน): ${totals.totalGap > 0 ? '+' : ''}${totals.totalGap.toFixed(1)} คน
- Utilization Rate: ${totals.utilPercent.toFixed(1)}%

🔹 Line A: Req ${summaryA.totalMpReq.toFixed(1)} | Act ${summaryA.totalMpActual} | Gap ${summaryA.totalGap.toFixed(1)} | Util ${summaryA.utilPercent.toFixed(1)}% (${summaryA.status})
🔸 Line B: Req ${summaryB.totalMpReq.toFixed(1)} | Act ${summaryB.totalMpActual} | Gap ${summaryB.totalGap.toFixed(1)} | Util ${summaryB.utilPercent.toFixed(1)}% (${summaryB.status})

⚠️ จุดวิกฤตที่ต้องเฝ้าระวัง:
- โรงงานต้องการคนเพิ่ม ${Math.abs(totals.totalGap).toFixed(1)} คน หรือต้องทำ OT เพื่อชดเชย
- Line B มีสถานี Cabinet PU Foam L1 มีกำลังคนเกิน (+30.9 คน) แนะนำโยกย้ายมาช่วย Assembly และ Cab pre-assy`;

    navigator.clipboard.writeText(text);
    setCopiedAsakai(true);
    setTimeout(() => setCopiedAsakai(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">ส่งออกข้อมูลรายงาน IE</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Option 1: CSV for Excel */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ดาวน์โหลดไฟล์ Excel / CSV (.csv)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              มีข้อมูลครบทั้ง Summary, Line A, Line B พร้อมสูตรคำนวณ CT, TT, Speed Line, MP Req, Gap, Util% 
              รองรับภาษาไทยสำหรับเปิดใน Microsoft Excel ได้ทันทีโดยไม่เพี้ยน
            </p>
            <button
              onClick={downloadCSV}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ CSV (สำหรับ Excel)</span>
            </button>
          </div>

          {/* Option 2: Copy Morning Asakai */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
              <MessageSquareQuote className="w-4 h-4 text-blue-600" />
              <span>คัดลอกสรุปสำหรับประชุม Asakai / Line ประจำวัน</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              จัดรูปแบบข้อความพร้อมสัญลักษณ์สำหรับส่งเข้ากลุ่ม LINE, Microsoft Teams หรืออ่านในที่ประชุมกะเช้า
            </p>
            <button
              onClick={copyAsakaiText}
              className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              {copiedAsakai ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>คัดลอกลง Clipboard แล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกสรุปข้อความ Asakai</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
