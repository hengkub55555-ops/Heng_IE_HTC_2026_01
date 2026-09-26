import React, { useState } from 'react';
import { LineData, ProcessItem, SubLineType, ManpowerStatus } from '../types/ie';
import { computeLineData, computeProcessMetrics } from '../utils/ieCalculations';
import { MetricCards } from './MetricCards';
import { AlertBanner } from './AlertBanner';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  HelpCircle, 
  Sparkles, 
  Check, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface LineDetailViewProps {
  lineData: LineData;
  onUpdateLine: (updatedLine: LineData) => void;
  onSelectOtherLine: (lineId: 'lineA' | 'lineB') => void;
}

export const LineDetailView: React.FC<LineDetailViewProps> = ({
  lineData,
  onUpdateLine,
  onSelectOtherLine,
}) => {
  const [filterSubline, setFilterSubline] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [newProcessName, setNewProcessName] = useState<string>('');
  const [newSubline, setNewSubline] = useState<SubLineType>('All');
  const [newPlanQty, setNewPlanQty] = useState<number>(lineData.planTotal);
  const [newUph, setNewUph] = useState<number>(120);
  const [newMpStd, setNewMpStd] = useState<number>(10);
  const [newMpActual, setNewMpActual] = useState<number>(10);

  // Computed line data with current metrics
  const {
    computedLine,
    totalMpReq,
    totalMpActual,
    totalMpStd,
    totalGap,
    utilPercent,
    status,
    gapActualMinusStd,
  } = computeLineData(lineData);

  // Handle cell edits
  const handleCellChange = (
    processId: string,
    field: keyof ProcessItem,
    value: string | number
  ) => {
    const updatedProcesses = lineData.processes.map((proc) => {
      if (proc.id === processId) {
        if (field === 'manualMpReqOverride') {
          const numVal = value === '' ? undefined : Number(value);
          return {
            ...proc,
            manualMpReqOverride: numVal,
          };
        }
        return {
          ...proc,
          [field]: typeof proc[field] === 'number' ? Number(value) : value,
        };
      }
      return proc;
    });

    onUpdateLine({
      ...lineData,
      processes: updatedProcesses,
    });
  };

  // Reset MP Req override back to formula
  const handleResetMpReqToFormula = (processId: string) => {
    const updatedProcesses = lineData.processes.map((proc) => {
      if (proc.id === processId) {
        const copy = { ...proc };
        delete copy.manualMpReqOverride;
        return copy;
      }
      return proc;
    });

    onUpdateLine({
      ...lineData,
      processes: updatedProcesses,
    });
  };

  // Add new process row
  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;

    const newRow: ProcessItem = {
      id: `proc-${Date.now()}`,
      process: newProcessName.trim(),
      line: newSubline,
      planQty: newPlanQty,
      uph: newUph,
      mpStd: newMpStd,
      mpActual: newMpActual,
    };

    onUpdateLine({
      ...lineData,
      processes: [...lineData.processes, newRow],
    });

    setNewProcessName('');
    setIsAddingRow(false);
  };

  // Delete process row
  const handleDeleteRow = (processId: string) => {
    if (confirm('คุณต้องการลบกระบวนการนี้ใช่หรือไม่?')) {
      const updatedProcesses = lineData.processes.filter((p) => p.id !== processId);
      onUpdateLine({
        ...lineData,
        processes: updatedProcesses,
      });
    }
  };

  // Quick Action: Sync MP Actual to MP Req
  const handleSyncActualToReq = () => {
    const updated = lineData.processes.map((p) => {
      const computed = computeProcessMetrics(p, lineData.workTimeSeconds, lineData.lineEfficiency);
      return {
        ...p,
        mpActual: Math.round(computed.mpReq || p.mpStd),
      };
    });
    onUpdateLine({
      ...lineData,
      processes: updated,
    });
  };

  // Quick Action: Reset Actual to STD
  const handleResetActualToStd = () => {
    const updated = lineData.processes.map((p) => ({
      ...p,
      mpActual: p.mpStd,
    }));
    onUpdateLine({
      ...lineData,
      processes: updated,
    });
  };

  // Filtered processes list
  const filteredProcesses = computedLine.processes.filter((p) => {
    if (filterSubline !== 'all' && p.line !== filterSubline) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.process.toLowerCase().includes(q) || p.line.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* 1. Alert Banner (Matches Screenshots 2 & 3) */}
      <AlertBanner
        status={status}
        scopeLabel={lineData.name}
        mpRequired={totalMpReq}
        mpActual={totalMpActual}
        gap={totalGap}
      />

      {/* 2. Top 5 Metric Cards (Matches Screenshots 2 & 3) */}
      <MetricCards
        mpRequired={totalMpReq}
        mpActual={totalMpActual}
        mpStd={totalMpStd}
        gap={totalGap}
        utilization={utilPercent}
        planLabel={`Plan ${lineData.name}`}
        actualMinusStd={gapActualMinusStd}
      />

      {/* 3. Section Title & IE Formula Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              รายละเอียดรายกระบวนการ · {lineData.name} —{' '}
              <span className="text-blue-600 font-semibold">
                แก้ไขตัวเลข UPH / MP STD / MP Actual / MP Req ได้โดยตรง
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่ช่องตัวเลขในตารางเพื่อพิมพ์แก้ไข (รวมถึง MP Req) ระบบจะคำนวณ CT, TT, Speed Line, Gap และ Util% ให้แบบ Real-time ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingRow(!isAddingRow)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มกระบวนการ</span>
            </button>
            <button
              onClick={handleSyncActualToReq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="ปรับ MP Actual ให้เท่ากับ MP Req ทันทีเพื่อดูความสมดุล"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">จัดคนพอดีแผน (Actual=Req)</span>
              <span className="sm:hidden">Actual=Req</span>
            </button>
          </div>
        </div>

        {/* IE Formula Banner (Matches Screenshot exactly) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs leading-relaxed text-slate-700 font-sans">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-semibold text-slate-900">
              CT (Cycle Time) = 3600 ÷ UPH × Eff
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-slate-900">
              TT (Takt Time) = Work Time ÷ Plan Qty/กระบวนการ
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Speed Line (ที่ต้องคุม) = 60 ÷ TT (ชิ้น/นาที)
            </span>
            <span className="text-slate-500">
              — ความเร็วสาย/เครื่องที่ต้องตั้งไว้เพื่อให้ทันแผน; ถ้าความเร็วจริงต่ำกว่านี้ ผลผลิตจะไม่ทันแผน
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Subline Filter */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400 text-[11px]">Line:</span>
              <button
                onClick={() => setFilterSubline('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterSubline === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterSubline('All')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterSubline === 'All' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSubline('L1')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterSubline === 'L1' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                L1
              </button>
              <button
                onClick={() => setFilterSubline('L2')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterSubline === 'L2' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                L2
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400 text-[11px]">สถานะ:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterStatus('คนขาด')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  filterStatus === 'คนขาด' ? 'bg-rose-50 text-rose-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                คนขาด
              </button>
              <button
                onClick={() => setFilterStatus('สมดุล')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  filterStatus === 'สมดุล' ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                สมดุล
              </button>
              <button
                onClick={() => setFilterStatus('คนเกิน')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  filterStatus === 'คนเกิน' ? 'bg-blue-50 text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                คนเกิน
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหากระบวนการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Add Row Form Inline Drawer */}
        {isAddingRow && (
          <form
            onSubmit={handleAddProcess}
            className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">
                + เพิ่มกระบวนการทำงานใหม่ใน {lineData.name}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ยกเลิก
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 mb-1 font-medium">ชื่อกระบวนการ (Process)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Laser Welding, Pre-assembly"
                  value={newProcessName}
                  onChange={(e) => setNewProcessName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Line</label>
                <select
                  value={newSubline}
                  onChange={(e) => setNewSubline(e.target.value as SubLineType)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="All">All</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Plan Qty</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={newPlanQty}
                  onChange={(e) => setNewPlanQty(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">UPH</label>
                <input
                  type="number"
                  min="1"
                  value={newUph}
                  onChange={(e) => setNewUph(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">MP STD / Actual</label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="STD"
                    value={newMpStd}
                    onChange={(e) => setNewMpStd(Number(e.target.value))}
                    className="w-full px-1.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Act"
                    value={newMpActual}
                    onChange={(e) => setNewMpActual(Number(e.target.value))}
                    className="w-full px-1.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                บันทึกกระบวนการ
              </button>
            </div>
          </form>
        )}

        {/* 4. Process Table (Exact recreation from Image 2 & 3) */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[140px]">Process</th>
                <th className="py-2.5 px-2 whitespace-nowrap text-center">Line</th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right min-w-[90px]">
                  Plan Qty<br />
                  <span className="text-[10px] font-normal text-slate-400">/กระบวนการ</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right min-w-[70px]">
                  UPH<br />
                  <span className="text-[10px] font-normal text-blue-500">✎ แก้ได้</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right min-w-[70px]">
                  MP STD<br />
                  <span className="text-[10px] font-normal text-blue-500">✎ แก้ได้</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right min-w-[70px]">
                  MP Actual<br />
                  <span className="text-[10px] font-normal text-blue-500">✎ แก้ได้</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right">
                  CT <span className="text-[10px] font-normal">(s)</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right">
                  TT <span className="text-[10px] font-normal">(s)</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right text-amber-700 bg-amber-50/50">
                  Speed Line<br />
                  <span className="text-[10px] font-normal text-amber-600">(ชิ้น/นาที)</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right font-bold text-slate-800 min-w-[85px]">
                  MP Req<br />
                  <span className="text-[10px] font-normal text-blue-500">✎ แก้ได้</span>
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap text-right">Gap</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center min-w-[110px]">Util %</th>
                <th className="py-2.5 px-2 whitespace-nowrap text-center">สถานะ</th>
                <th className="py-2.5 px-1 whitespace-nowrap text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono">
              {filteredProcesses.map((p) => {
                const isShort = (p.gap || 0) < -1.0;
                const isSurplus = (p.gap || 0) > 0.5;
                const isBottleneck = (p.ct || 0) > (p.tt || 0);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isBottleneck ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Process Name (Editable) */}
                    <td className="py-2 px-3 text-slate-900 font-sans font-medium text-xs">
                      <input
                        type="text"
                        value={p.process}
                        onChange={(e) => handleCellChange(p.id, 'process', e.target.value)}
                        className="w-full bg-transparent hover:bg-slate-100 focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-blue-400 focus:outline-hidden transition-all text-xs font-sans font-medium"
                      />
                    </td>

                    {/* Line dropdown */}
                    <td className="py-2 px-2 text-center text-slate-600 font-sans text-xs">
                      <select
                        value={p.line}
                        onChange={(e) => handleCellChange(p.id, 'line', e.target.value)}
                        className="bg-transparent hover:bg-slate-100 focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-blue-400 focus:outline-hidden text-xs text-center cursor-pointer"
                      >
                        <option value="All">All</option>
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                      </select>
                    </td>

                    {/* Plan Qty (Editable) */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={p.planQty}
                        onChange={(e) => handleCellChange(p.id, 'planQty', e.target.value)}
                        className="w-20 text-right bg-transparent hover:bg-slate-100 focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-blue-400 focus:outline-hidden tabular-nums font-mono text-xs"
                      />
                    </td>

                    {/* UPH (Editable directly) */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={p.uph}
                        onChange={(e) => handleCellChange(p.id, 'uph', e.target.value)}
                        className="w-16 text-right bg-slate-50/80 hover:bg-blue-50 focus:bg-white text-blue-900 font-semibold px-1.5 py-0.5 rounded border border-slate-200 focus:border-blue-400 focus:outline-hidden tabular-nums font-mono text-xs"
                        title="คลิกเพื่อแก้ไขค่า UPH"
                      />
                    </td>

                    {/* MP STD (Editable directly) */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={p.mpStd}
                        onChange={(e) => handleCellChange(p.id, 'mpStd', e.target.value)}
                        className="w-16 text-right bg-slate-50/80 hover:bg-blue-50 focus:bg-white text-slate-900 px-1.5 py-0.5 rounded border border-slate-200 focus:border-blue-400 focus:outline-hidden tabular-nums font-mono text-xs"
                        title="คลิกเพื่อแก้ไขค่า MP STD"
                      />
                    </td>

                    {/* MP Actual (Editable directly) */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={p.mpActual}
                        onChange={(e) => handleCellChange(p.id, 'mpActual', e.target.value)}
                        className="w-16 text-right bg-slate-50/80 hover:bg-blue-50 focus:bg-white text-slate-900 font-bold px-1.5 py-0.5 rounded border border-slate-200 focus:border-blue-400 focus:outline-hidden tabular-nums font-mono text-xs"
                        title="คลิกเพื่อแก้ไขค่า MP Actual"
                      />
                    </td>

                    {/* CT (s) */}
                    <td className="py-2 px-2 text-right tabular-nums text-slate-700">
                      <span className={isBottleneck ? 'text-amber-700 font-bold' : ''}>
                        {(p.ct || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* TT (s) */}
                    <td className="py-2 px-2 text-right tabular-nums text-slate-700">
                      {(p.tt || 0).toFixed(2)}
                    </td>

                    {/* Speed Line (ชิ้น/นาที) - Highlighted in yellow/amber */}
                    <td className="py-2 px-2 text-right tabular-nums text-amber-600 font-bold bg-amber-50/30">
                      {(p.speedLine || 0).toFixed(2)}
                    </td>

                    {/* MP Req (Editable directly) */}
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={p.manualMpReqOverride !== undefined && p.manualMpReqOverride !== null ? p.manualMpReqOverride : (p.mpReq || 0)}
                          onChange={(e) =>
                            handleCellChange(
                              p.id,
                              'manualMpReqOverride',
                              e.target.value
                            )
                          }
                          className={`w-18 text-right px-1.5 py-0.5 rounded border focus:border-blue-400 focus:outline-hidden tabular-nums font-mono text-xs font-bold transition-all ${
                            p.manualMpReqOverride !== undefined && p.manualMpReqOverride !== null
                              ? 'bg-amber-50/90 text-amber-900 border-amber-300 ring-1 ring-amber-300/50'
                              : 'bg-slate-50/80 hover:bg-blue-50 focus:bg-white text-slate-900 border-slate-200'
                          }`}
                          title={
                            p.manualMpReqOverride !== undefined && p.manualMpReqOverride !== null
                              ? `กำหนดค่าเองแบบ Manual (${p.manualMpReqOverride}). คลิกปุ่ม ↺ เพื่อกลับไปใช้สูตรคำนวณอัตโนมัติ`
                              : 'คลิกเพื่อแก้ไขค่า MP Req โดยตรง (จะทำการ Override ค่าจากสูตร)'
                          }
                        />
                        {p.manualMpReqOverride !== undefined && p.manualMpReqOverride !== null && (
                          <button
                            type="button"
                            onClick={() => handleResetMpReqToFormula(p.id)}
                            className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors text-[10px]"
                            title="คืนค่า MP Req ให้คำนวณตามสูตรอัตโนมัติ (Reset to formula)"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Gap */}
                    <td className="py-2 px-2 text-right tabular-nums font-semibold">
                      <span
                        className={
                          (p.gap || 0) < 0
                            ? 'text-rose-600'
                            : (p.gap || 0) > 0
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }
                      >
                        {(p.gap || 0) > 0 ? `+${(p.gap || 0).toFixed(2)}` : (p.gap || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Util % with Progress Bar */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              (p.utilPercent || 0) > 120
                                ? 'bg-rose-500'
                                : (p.utilPercent || 0) > 100
                                ? 'bg-amber-500'
                                : (p.utilPercent || 0) < 50
                                ? 'bg-blue-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (p.utilPercent || 0))}%`,
                            }}
                          ></div>
                        </div>
                        <span className="tabular-nums font-medium text-slate-700 text-xs w-9 text-right">
                          {(p.utilPercent || 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Status Badge (Matches screenshots: 'คนขาด', 'สมดุล', 'คนเกิน') */}
                    <td className="py-2 px-2 text-center font-sans">
                      <span
                        className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                          p.status === 'คนขาด'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : p.status === 'คนเกิน'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Delete button */}
                    <td className="py-2 px-1 text-center">
                      <button
                        onClick={() => handleDeleteRow(p.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                        title="ลบกระบวนการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-slate-800 font-mono text-xs font-bold">
              <tr>
                <td className="py-2.5 px-3 font-sans" colSpan={4}>
                  รวมทั้งหมด ({computedLine.processes.length} กระบวนการ)
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums">
                  {totalMpStd}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-slate-900">
                  {totalMpActual}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-normal">--</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-normal">--</td>
                <td className="py-2.5 px-2 text-right text-amber-700 bg-amber-50/50">
                  {(
                    computedLine.processes.reduce((acc, p) => acc + (p.speedLine || 0), 0) /
                    (computedLine.processes.length || 1)
                  ).toFixed(2)}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-slate-900">
                  {totalMpReq.toFixed(2)}
                </td>
                <td
                  className={`py-2.5 px-2 text-right tabular-nums ${
                    totalGap < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {totalGap > 0 ? `+${totalGap.toFixed(2)}` : totalGap.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center tabular-nums">
                  {utilPercent.toFixed(1)}%
                </td>
                <td className="py-2.5 px-2 text-center font-sans">
                  <span
                    className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold ${
                      status === 'คนขาด'
                        ? 'bg-rose-100 text-rose-700'
                        : status === 'คนเกิน'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quick Footer Navigation & Tools */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>สลับไปยังสายการผลิตอื่น:</span>
            <button
              onClick={() => onSelectOtherLine(lineData.id === 'Line A' ? 'lineB' : 'lineA')}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              ดู {lineData.id === 'Line A' ? 'Line B' : 'Line A'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetActualToStd}
              className="hover:text-slate-900 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>รีเซ็ต Actual ให้เท่ากับ STD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
