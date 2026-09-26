import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-amber-500/50 px-4 py-2 text-xs font-medium text-amber-300 shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>โหมดออฟไลน์ (Offline Mode) — กำลังใช้งานข้อมูลที่ถูกแคชไว้ในเครื่อง สามารถแก้ไขและบันทึกได้ตามปกติ</span>
    </div>
  );
};
