/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LineData, ShiftConfig } from './types/ie';
import { INITIAL_LINE_A, INITIAL_LINE_B, DEFAULT_SHIFT_CONFIG } from './data/initialData';
import { Header } from './components/Header';
import { SummaryView } from './components/SummaryView';
import { LineDetailView } from './components/LineDetailView';
import { LineBalancingView } from './components/LineBalancingView';
import { SimulationView } from './components/SimulationView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { PrintReportView } from './components/PrintReportView';
import { OnlineAccessModal } from './components/OnlineAccessModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEY_A = 'haier_ie_lineA_data_v1';
const STORAGE_KEY_B = 'haier_ie_lineB_data_v1';
const STORAGE_KEY_CONFIG = 'haier_ie_shift_config_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'summary' | 'lineA' | 'lineB' | 'balancing' | 'simulation'
  >('summary');

  // Load initial data from localStorage if available, otherwise use initial benchmark
  const [lineA, setLineA] = useState<LineData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_A);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load Line A data from storage', e);
    }
    return INITIAL_LINE_A;
  });

  const [lineB, setLineB] = useState<LineData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_B);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load Line B data from storage', e);
    }
    return INITIAL_LINE_B;
  });

  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load shift config from storage', e);
    }
    return DEFAULT_SHIFT_CONFIG;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isOnlineGuideOpen, setIsOnlineGuideOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save to localStorage whenever lineA, lineB, or shiftConfig changes
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_A, JSON.stringify(lineA));
        localStorage.setItem(STORAGE_KEY_B, JSON.stringify(lineB));
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(shiftConfig));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      setIsSaving(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [lineA, lineB, shiftConfig]);

  // Reset to original factory benchmark data from screenshots
  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าตั้งต้นจากเอกสาร Haier IE (Original Benchmark) ใช่หรือไม่?')) {
      setLineA(INITIAL_LINE_A);
      setLineB(INITIAL_LINE_B);
      setShiftConfig(DEFAULT_SHIFT_CONFIG);
      try {
        localStorage.removeItem(STORAGE_KEY_A);
        localStorage.removeItem(STORAGE_KEY_B);
        localStorage.removeItem(STORAGE_KEY_CONFIG);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        shiftConfig={shiftConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        onExportCSV={() => setIsExportOpen(true)}
        onPrint={() => setIsPrintOpen(true)}
        onOpenOnlineGuide={() => setIsOnlineGuideOpen(true)}
        isSaving={isSaving}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {currentTab === 'summary' && (
          <SummaryView
            lineA={lineA}
            lineB={lineB}
            onSelectLine={(lineId) => setCurrentTab(lineId)}
            onSelectBalancing={() => setCurrentTab('balancing')}
          />
        )}

        {currentTab === 'lineA' && (
          <LineDetailView
            lineData={lineA}
            onUpdateLine={setLineA}
            onSelectOtherLine={(lineId) => setCurrentTab(lineId)}
          />
        )}

        {currentTab === 'lineB' && (
          <LineDetailView
            lineData={lineB}
            onUpdateLine={setLineB}
            onSelectOtherLine={(lineId) => setCurrentTab(lineId)}
          />
        )}

        {currentTab === 'balancing' && (
          <LineBalancingView
            lineA={lineA}
            lineB={lineB}
            onUpdateLineA={setLineA}
            onUpdateLineB={setLineB}
          />
        )}

        {currentTab === 'simulation' && (
          <SimulationView
            lineA={lineA}
            lineB={lineB}
            onUpdateLineA={setLineA}
            onUpdateLineB={setLineB}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            HAIER INDUSTRIAL ENGINEERING · LINE BALANCING & MANPOWER OPTIMIZATION SYSTEM
          </div>
          <div className="flex items-center gap-3">
            <span>Cycle Time (CT)</span>
            <span>·</span>
            <span>Takt Time (TT)</span>
            <span>·</span>
            <span>Speed Line (ชิ้น/นาที)</span>
            <span>·</span>
            <span>Line Balance Efficiency (LBE)</span>
          </div>
        </div>
      </footer>

      {/* Modals & Offline Alert */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shiftConfig={shiftConfig}
        onUpdateShiftConfig={setShiftConfig}
        lineA={lineA}
        lineB={lineB}
        onUpdateLineA={setLineA}
        onUpdateLineB={setLineB}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        lineA={lineA}
        lineB={lineB}
        shiftConfig={shiftConfig}
      />

      <PrintReportView
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        lineA={lineA}
        lineB={lineB}
        shiftConfig={shiftConfig}
      />

      <OnlineAccessModal
        isOpen={isOnlineGuideOpen}
        onClose={() => setIsOnlineGuideOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
