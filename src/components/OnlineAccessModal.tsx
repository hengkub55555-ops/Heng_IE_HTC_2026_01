import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  X, 
  Smartphone, 
  Laptop, 
  QrCode, 
  ExternalLink,
  Wifi,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface OnlineAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnlineAccessModal: React.FC<OnlineAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Online URL (Shared App URL or current window URL)
  const onlineUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-pre-vc6vlt3dybh7vagdd3ituw-434237865567.asia-southeast1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(onlineUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                ลิงก์ใช้งาน Online & ติดตั้งลงเครื่อง (PWA)
              </h3>
              <p className="text-[11px] text-slate-500">
                เปิดใช้งานได้ทุกอุปกรณ์ (มือถือ, แท็บเล็ต, PC, โน้ตบุ๊ก)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Online Link Box */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ลิงก์ URL สำหรับเปิดใช้งาน Online สาธารณะ:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 truncate select-all">
                {onlineUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
              <a
                href={onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="เปิดในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Guide Tabs / Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Mobile (Android & iOS) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>สำหรับมือถือ & แท็บเล็ต</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>เปิดลิงก์ด้านบนผ่าน Chrome หรือ Safari</li>
                <li>
                  <strong>Android:</strong> แตะเมนู 3 จุด &gt; เลือก <em>&ldquo;ติดตั้งแอป&rdquo;</em>
                </li>
                <li>
                  <strong>iPhone/iPad:</strong> แตะปุ่มแชร์ &gt; เลือก <em>&ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo;</em>
                </li>
                <li>เปิดใช้งานได้แบบเต็มหน้าจอ ไม่เกะกะแถบเบราว์เซอร์</li>
              </ul>
            </div>

            {/* Desktop / Laptop */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>สำหรับคอมพิวเตอร์ / โน้ตบุ๊ก</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>เปิดด้วย Google Chrome หรือ Microsoft Edge</li>
                <li>
                  สังเกตไอคอน <strong>&ldquo;ติดตั้ง&rdquo; (Install icon)</strong> บนแถบที่อยู่ URL ขวาบน
                </li>
                <li>คลิกติดตั้งเพื่อเปิดเป็น Standalone Window เหมือนโปรแกรม Desktop</li>
                <li>มีไอคอน Shortcut บน Desktop ทันที</li>
              </ul>
            </div>
          </div>

          {/* Offline & Auto-Sync Highlights */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>รองรับการทำงานแบบ Offline (Service Worker Precache):</strong>
              <p className="text-slate-600 mt-0.5">
                เมื่อเปิดเว็บขึ้นมาหนึ่งครั้ง ข้อมูลและระบบคำนวณทั้งหมดจะถูกแคชไว้ในเครื่อง 
                สามารถเปิดใช้งานหน้างานในโรงงานแม้ในจุดที่ไม่มีสัญญาณอินเทอร์เน็ต และบันทึกข้อมูลในเครื่องได้อย่างต่อเนื่อง
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
