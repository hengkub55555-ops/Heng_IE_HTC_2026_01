import React, { useState } from 'react';
import { ShiftConfig, LineData } from '../types/ie';
import { X, Check, RotateCcw, Clock, Gauge, Calendar } from 'lucide-react';
import { DEFAULT_SHIFT_CONFIG } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftConfig: ShiftConfig;
  onUpdateShiftConfig: (config: ShiftConfig) => void;
  lineA: LineData;
  lineB: LineData;
  onUpdateLineA: (line: LineData) => void;
  onUpdateLineB: (line: LineData) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  shiftConfig,
  onUpdateShiftConfig,
  lineA,
  lineB,
  onUpdateLineA,
  onUpdateLineB,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(shiftConfig.date);
  const [shiftsPerDay, setShiftsPerDay] = useState<number>(shiftConfig.shiftsPerDay);
  const [lineEfficiency, setLineEfficiency] = useState<number>(shiftConfig.lineEfficiency);
  const [planA, setPlanA] = useState<number>(lineA.planTotal);
  const [planB, setPlanB] = useState<number>(lineB.planTotal);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShiftConfig({
      ...shiftConfig,
      date,
      shiftsPerDay,
      lineEfficiency,
    });

    onUpdateLineA({
      ...lineA,
      planTotal: planA,
      lineEfficiency,
    });

    onUpdateLineB({
      ...lineB,
      planTotal: planB,
      lineEfficiency,
    });

    onClose();
  };

  const handleResetToDefault = () => {
    setDate(DEFAULT_SHIFT_CONFIG.date);
    setShiftsPerDay(DEFAULT_SHIFT_CONFIG.shiftsPerDay);
    setLineEfficiency(DEFAULT_SHIFT_CONFIG.lineEfficiency);
    setPlanA(1800);
    setPlanB(1250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              ตั้งค่ากะการทำงาน & พารามิเตอร์ IE (Shift & IE Settings)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              รอบข้อมูลวันที่ (Report Date)
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนกะต่อวัน (Shifts / Day)
              </label>
              <select
                value={shiftsPerDay}
                onChange={(e) => setShiftsPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value={1}>1 กะ/วัน</option>
                <option value={2}>2 กะ/วัน (มาตรฐานปัจจุบัน)</option>
                <option value={3}>3 กะ/วัน</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                Line Efficiency (Eff)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={lineEfficiency}
                onChange={(e) => setLineEfficiency(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                0.85 = ประสิทธิภาพสายผลิต 85%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-800 block mb-2">
              เป้าหมายการผลิตรวมแต่ละ Line (Plan Qty)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1">Line A Plan Total</label>
                <input
                  type="number"
                  value={planA}
                  onChange={(e) => setPlanA(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Line B Plan Total</label>
                <input
                  type="number"
                  value={planB}
                  onChange={(e) => setPlanB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่ามาตรฐาน</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกการตั้งค่า</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
