import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DownloadCloud, Smartphone, Check, X, Share2, Globe, Laptop } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenOnlineGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenOnlineGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running in standalone mode, show clean installed badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        <Check className="w-3.5 h-3.5" />
        <span>PWA Installed</span>
      </span>
    );
  }

  // Handle Chrome / Edge / Android install prompt
  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (onOpenOnlineGuide) {
      onOpenOnlineGuide();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 transition-all shadow-2xs cursor-pointer"
        title="ติดตั้งแอปลงเครื่องสำหรับใช้งาน Online & Offline (PWA App)"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>{isInstallable ? 'ติดตั้งแอปลงเครื่อง' : 'ติดตั้ง/ใช้งาน Online'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  ติดตั้งบน iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
              <p>สามารถติดตั้งเว็บแอปนี้ให้ทำงานเหมือนแอปบนมือถือได้ทันที:</p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    เปิดเว็บนี้บน Safari แล้วกดปุ่ม <strong>แชร์ (Share)</strong> ด้านล่างของจอ
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    เลื่อนลงมาแล้วเลือก <strong>&ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo; (Add to Home Screen)</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    กด <strong>&ldquo;เพิ่ม&rdquo; (Add)</strong> เพื่อเปิดใช้งานแบบเต็มจอได้ทุกที่
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </>
  );
};
