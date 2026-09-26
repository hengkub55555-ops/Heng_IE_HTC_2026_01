import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Settings, 
  Download, 
  Printer, 
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Globe
} from 'lucide-react';
import { ShiftConfig } from '../types/ie';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'summary' | 'lineA' | 'lineB' | 'balancing' | 'simulation';
  onTabChange: (tab: 'summary' | 'lineA' | 'lineB' | 'balancing' | 'simulation') => void;
  shiftConfig: ShiftConfig;
  onOpenSettings: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onOpenOnlineGuide: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  shiftConfig,
  onOpenSettings,
  onResetData,
  onExportCSV,
  onPrint,
  onOpenOnlineGuide,
  isSaving,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner Zone */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Title */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              HAIER · INDUSTRIAL ENGINEERING
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              MP Utilization Summary Report
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>รอบข้อมูล: {shiftConfig.date}</span>
              <span aria-hidden="true">·</span>
              <span>Shift: {shiftConfig.shiftsPerDay} กะ/วัน</span>
              <span aria-hidden="true">·</span>
              <span>Eff: {(shiftConfig.lineEfficiency * 100).toFixed(0)}%</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                {isSaving ? (
                  <>
                    <Clock className="w-3 h-3 animate-spin text-amber-500" />
                    <span className="text-amber-600">กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-500">บันทึกเรียบร้อย</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Navigation Tabs and Online Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
              <button
                onClick={() => onTabChange('summary')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentTab === 'summary'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => onTabChange('lineA')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentTab === 'lineA'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Line A
              </button>
              <button
                onClick={() => onTabChange('lineB')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentTab === 'lineB'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Line B
              </button>
              <button
                onClick={() => onTabChange('balancing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentTab === 'balancing'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                title="Line Balancing & Yamazumi Chart"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Yamazumi & LBE</span>
              </button>
              <button
                onClick={() => onTabChange('simulation')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentTab === 'simulation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                title="What-If Simulation"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulation</span>
              </button>
            </div>

            {/* PWA & Online Access Quick Actions */}
            <div className="flex items-center gap-1.5 pl-1">
              <PWAInstallButton onOpenOnlineGuide={onOpenOnlineGuide} />

              <button
                onClick={onOpenOnlineGuide}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
                title="เปิดลิงก์สำหรับแชร์และใช้งาน Online"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">ใช้งาน Online</span>
              </button>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="ตั้งค่ากะ & พารามิเตอร์ (Shift & Settings)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onExportCSV}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="ส่งออก Excel / CSV"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onPrint}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="พิมพ์รายงาน (Print Report)"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="รีเซ็ตเป็นข้อมูลเริ่มต้นจากภาพถ่าย (Reset to Initial Haier Data)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
