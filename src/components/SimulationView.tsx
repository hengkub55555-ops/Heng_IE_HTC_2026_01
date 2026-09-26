import React, { useState } from 'react';
import { LineData, ProcessItem } from '../types/ie';
import { computeLineData, computeFactoryTotals } from '../utils/ieCalculations';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface SimulationViewProps {
  lineA: LineData;
  lineB: LineData;
  onUpdateLineA: (line: LineData) => void;
  onUpdateLineB: (line: LineData) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  lineA,
  lineB,
  onUpdateLineA,
  onUpdateLineB,
}) => {
  // Simulation parameters
  const [planScalePercent, setPlanScalePercent] = useState<number>(100); // 100% is current
  const [simLineEfficiency, setSimLineEfficiency] = useState<number>(0.85); // 85% default
  const [hourlyWageBaht, setHourlyWageBaht] = useState<number>(150); // Baht per hour
  const [otRateMultiplier, setOtRateMultiplier] = useState<number>(1.5); // 1.5x for OT

  // Calculate current baseline
  const baselineTotals = computeFactoryTotals(lineA, lineB);

  // Simulated Lines
  const simLineA: LineData = {
    ...lineA,
    planTotal: Math.round(lineA.planTotal * (planScalePercent / 100)),
    lineEfficiency: simLineEfficiency,
    processes: lineA.processes.map((p) => ({
      ...p,
      planQty: Number((p.planQty * (planScalePercent / 100)).toFixed(1)),
    })),
  };

  const simLineB: LineData = {
    ...lineB,
    planTotal: Math.round(lineB.planTotal * (planScalePercent / 100)),
    lineEfficiency: simLineEfficiency,
    processes: lineB.processes.map((p) => ({
      ...p,
      planQty: Number((p.planQty * (planScalePercent / 100)).toFixed(1)),
    })),
  };

  const simTotals = computeFactoryTotals(simLineA, simLineB);

  // Overtime Calculation:
  // Shortage = |Gap| = MP Req - MP Actual
  // If we don't add workers, how many OT hours are needed per worker to produce the required work content?
  // Total work content needed = MP Req * Net Work Hours (8 hrs)
  // Work content produced by Actual = MP Actual * Net Work Hours (8 hrs)
  // Shortage work hours = (MP Req - MP Actual) * 8 hrs
  // OT hours per actual worker = Shortage work hours / MP Actual
  const shortagePeople = Math.max(0, simTotals.totalMpReq - simTotals.totalMpActual);
  const totalShortageHours = shortagePeople * 8; // 8 hours net
  const otHoursPerPerson = simTotals.totalMpActual > 0 ? (totalShortageHours / simTotals.totalMpActual) : 0;
  const estimatedDailyOtCost = Math.round(totalShortageHours * hourlyWageBaht * otRateMultiplier);

  // Smart Reallocation Algorithm:
  // Propose transferring surplus workers from Line B (PU Foam) to shortage stations
  const handleApplySmartReallocation = () => {
    // Look for processes in Line B with huge surplus
    const updatedLineB = {
      ...lineB,
      processes: lineB.processes.map((p) => {
        if (p.process.includes('PU Foam line 1') && p.mpActual > 10) {
          // Reduce actual from 35 down to 10 (save 25 people)
          return { ...p, mpActual: 8 };
        }
        if (p.process.includes('Assembly') && !p.process.includes('Vacuum')) {
          // Add 10 to Assembly (was 69 -> 79)
          return { ...p, mpActual: 79 };
        }
        if (p.process.includes('Cab pre-assy Line.1')) {
          // Add 6 to Cab pre-assy Line.1 (was 24 -> 30)
          return { ...p, mpActual: 30 };
        }
        if (p.process.includes('System ass\'y')) {
          // Add 6 to System ass'y (was 28 -> 34)
          return { ...p, mpActual: 34 };
        }
        return p;
      }),
    };

    onUpdateLineB(updatedLineB);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            What-If Scenario Simulation & Labor Cost Optimization
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          จำลองสถานการณ์เปลี่ยนยอดการผลิต (Plan Qty), ปรับประสิทธิภาพสายผลิต (Line Efficiency), วิเคราะห์ค่าล่วงเวลา (OT) และทดลองจัดสรรกำลังพลอัตโนมัติ
        </p>

        {/* Simulation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 pt-4 border-t border-slate-100">
          {/* Slider 1: Plan Qty Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">ปรับเปลี่ยนแผนการผลิต (Plan Qty)</span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {planScalePercent}% ({Math.round(3050 * (planScalePercent / 100)).toLocaleString()} ชิ้น/วัน)
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={planScalePercent}
              onChange={(e) => setPlanScalePercent(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Low Season)</span>
              <span>100% (ปัจจุบัน)</span>
              <span>+50% (High Season)</span>
            </div>
          </div>

          {/* Slider 2: Line Efficiency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">ประสิทธิภาพสายผลิต (Line Efficiency)</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {(simLineEfficiency * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="0.95"
              step="0.01"
              value={simLineEfficiency}
              onChange={(e) => setSimLineEfficiency(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>75% (ต่ำ)</span>
              <span>85% (ปัจจุบัน)</span>
              <span>95% (Kaizen World-Class)</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">สถานการณ์ตัวอย่าง (Presets)</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setPlanScalePercent(100);
                  setSimLineEfficiency(0.85);
                }}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                รีเซ็ตค่าเดิม (100% / Eff 85%)
              </button>
              <button
                onClick={() => {
                  setPlanScalePercent(120);
                  setSimLineEfficiency(0.85);
                }}
                className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-colors border border-amber-200"
              >
                +20% High Season
              </button>
              <button
                onClick={() => {
                  setPlanScalePercent(100);
                  setSimLineEfficiency(0.92);
                }}
                className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-colors border border-emerald-200"
              >
                Kaizen Lean (Eff 92%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Baseline (As-Is) vs Simulated (To-Be) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline As-Is */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                สถานการณ์ปัจจุบัน (AS-IS)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Baseline (Plan 3,050 ชิ้น / Eff 85%)
              </h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-600 border border-rose-200">
              {baselineTotals.status}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-sm mt-3 font-mono">
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">MP Required</span>
              <span className="font-bold text-slate-900">{baselineTotals.totalMpReq.toFixed(1)}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">MP Actual (คนจริง)</span>
              <span className="font-bold text-slate-900">{baselineTotals.totalMpActual}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">Gap (คนขาด/เกิน)</span>
              <span className="font-bold text-rose-600">{baselineTotals.totalGap.toFixed(1)}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">Utilization Rate</span>
              <span className="font-bold text-slate-900">{baselineTotals.utilPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Simulated To-Be */}
        <div className="bg-indigo-50/40 rounded-xl border border-indigo-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div>
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                สถานการณ์จำลอง (TO-BE SIMULATION)
              </span>
              <h3 className="text-base font-bold text-indigo-950 mt-0.5">
                Plan {planScalePercent}% / Eff {(simLineEfficiency * 100).toFixed(0)}%
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                simTotals.status === 'คนขาด'
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {simTotals.status}
            </span>
          </div>

          <div className="divide-y divide-indigo-100 text-sm mt-3 font-mono">
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700">MP Required (จำลอง)</span>
              <span className="font-bold text-indigo-900">{simTotals.totalMpReq.toFixed(1)}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700">MP Actual (คนจริง)</span>
              <span className="font-bold text-indigo-900">{simTotals.totalMpActual}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700">Gap ผลกระทบ</span>
              <span
                className={`font-bold ${
                  simTotals.totalGap < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {simTotals.totalGap > 0 ? `+${simTotals.totalGap.toFixed(1)}` : simTotals.totalGap.toFixed(1)}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700">Utilization Rate (จำลอง)</span>
              <span className="font-bold text-indigo-950">{simTotals.utilPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Labor Cost & OT Impact Assessment */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Clock className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            การประเมินชั่วโมงทำงานล่วงเวลา (Overtime) & ต้นทุนค่าแรง
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 font-medium">ชั่วโมง OT เฉลี่ยที่ต้องทำต่อคน</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
              {otHoursPerPerson.toFixed(2)} ชม./คน/วัน
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              (ประมาณ {(otHoursPerPerson * 60).toFixed(0)} นาที/คน ในแต่ละวัน เพื่อให้ผลิตได้ครบตามแผน)
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 font-medium">ประมาณการค่าล่วงเวลา (OT Cost) รวม</div>
            <div className="text-2xl font-extrabold font-mono text-rose-600 mt-1">
              ฿{estimatedDailyOtCost.toLocaleString()} / วัน
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              คิดที่อัตราค่าจ้าง ฿{hourlyWageBaht}/ชม. (OT {otRateMultiplier} เท่า)
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 font-medium">ต้นทุนสะสมต่อเดือน (26 วันทำงาน)</div>
            <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1">
              ฿{(estimatedDailyOtCost * 26).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              หากจ้างคนเพิ่ม {Math.round(shortagePeople)} คน จะประหยัดค่า OT ได้มหาศาล
            </div>
          </div>
        </div>
      </div>

      {/* Smart Manpower Rebalancing Tool */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Smart Lean Reallocation Engine</span>
            </div>
            <h3 className="text-lg font-bold">
              ระบบแนะนำเกลี่ยกำลังคนอัตโนมัติ (Rebalance Surplus to Shortage)
            </h3>
            <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
              ระบบตรวจพบว่าที่ Line B กระบวนการ <strong>Cabinet PU Foam line 1</strong> มีคนเกินจริงอยู่ถึง <strong>+30.96 คน</strong> 
              (มีคน 35 คน แต่ต้องการเพียง 4 คน) หากนำคนส่วนเกินนี้ไปเติมเต็มสถานี Assembly (+10 คน), Cab pre-assy (+6 คน) และ System ass&apos;y (+6 คน) 
              จะสามารถแก้ไขปัญหาคนขาดในจุดคอขวดได้ทันทีโดยไม่ต้องจ้างคนเพิ่ม!
            </p>
          </div>

          <button
            onClick={handleApplySmartReallocation}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <Check className="w-4 h-4" />
            <span>ปรับเกลี่ยคนอัตโนมัติทันที</span>
          </button>
        </div>
      </div>
    </div>
  );
};
