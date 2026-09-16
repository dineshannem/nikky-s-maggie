import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  QrCode, 
  Smartphone, 
  Download, 
  Printer, 
  Sparkles,
  Upload,
  CreditCard
} from 'lucide-react';
import { generateAppQrDataUrl } from '../utils/upi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TableQrModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { upiSettings, updateUpiSettings } = useApp();
  
  const [activeTab, setActiveTab] = useState<'app_qr' | 'shop_pay_qr'>('app_qr');
  const [appQrUrl, setAppQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [, setCustomQrInput] = useState(upiSettings.customShopQrUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Base URLs
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nikkys.cafe';

  useEffect(() => {
    if (isOpen) {
      generateAppQrDataUrl(originUrl).then(setAppQrUrl);
    }
  }, [isOpen, originUrl]);

  if (!isOpen) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomQrInput(result);
          updateUpiSettings({
            ...upiSettings,
            customShopQrUrl: result,
            useCustomShopQr: true
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Scan & Order QR Codes</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Store Menu QR & Shop UPI Payment QR</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('app_qr')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'app_qr'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Store Menu QR (Scan & Order)</span>
          </button>

          <button
            onClick={() => setActiveTab('shop_pay_qr')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'shop_pay_qr'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Shop Payment QR</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs text-center">
          
          {/* TAB 1: STORE MENU QR CODE (Burger King Style Self Order) */}
          {activeTab === 'app_qr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Just Scan & Order • Burger King Style</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Customers scan this single QR code with their mobile camera to open the menu, pick dishes, choose Dine-In or Takeaway, and receive a live Token Number. No apps to download, zero waiting in lines!
                </p>
              </div>

              {/* QR Display Card */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-3 shadow-inner max-w-xs mx-auto">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-widest font-black text-amber-600 dark:text-amber-400">
                    Nikky's Maggie & Cafe
                  </span>
                  <h4 className="text-base font-black tracking-tight">Scan to Order</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Open camera, point at code, and start ordering
                  </p>
                </div>

                {appQrUrl ? (
                  <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-md inline-block">
                    <img src={appQrUrl} alt="Store Scan & Order QR" className="w-48 h-48 mx-auto" />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-2xl flex items-center justify-center">
                    Generating...
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleDownload(appQrUrl, 'nikkys-scan-and-order-qr')}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="py-2 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    title="Print QR Flyer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Direct App Link */}
              <div className="space-y-1 text-left max-w-xs mx-auto">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Store Web App Link
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-[11px]">
                  <input 
                    type="text" 
                    readOnly 
                    value={originUrl} 
                    className="bg-transparent flex-1 truncate font-mono text-neutral-600 dark:text-neutral-300 outline-hidden"
                  />
                  <button
                    onClick={() => handleCopyLink(originUrl)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold shrink-0 shadow-2xs hover:bg-amber-400"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOP PAYMENT QR CODE (Direct Settlement) */}
          {activeTab === 'shop_pay_qr' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-left">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Direct UPI Merchant QR (0% Fee)</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Provide your shop's UPI QR code (Google Pay for Business, PhonePe Merchant, or Paytm QR). Payments go directly into the cafe bank account with <strong>0% MDR transaction fees</strong>.
                </p>
              </div>

              {/* Shop QR Display or Upload */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3 shadow-inner max-w-xs mx-auto text-center">
                <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                  Shop Payment QR
                </span>
                <h4 className="text-base font-black tracking-tight">{upiSettings.merchantName}</h4>
                <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                  UPI VPA: {upiSettings.vpa}
                </p>

                {upiSettings.customShopQrUrl ? (
                  <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-md inline-block">
                    <img 
                      src={upiSettings.customShopQrUrl} 
                      alt="Shop Payment QR" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 space-y-2">
                    <QrCode className="w-12 h-12 mx-auto text-neutral-400" />
                    <p className="text-[11px]">Dynamic UPI QR generated from merchant VPA: <strong>{upiSettings.vpa}</strong>.</p>
                    <p className="text-[10px] text-neutral-400">Upload your physical shop QR photo below if preferred.</p>
                  </div>
                )}

                {/* Upload or Link Custom QR */}
                <div className="pt-2 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Upload Your Physical Shop QR Photo
                  </label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Image</span>
                    </button>

                    {upiSettings.customShopQrUrl && (
                      <button
                        onClick={() => {
                          setCustomQrInput('');
                          updateUpiSettings({
                            ...upiSettings,
                            customShopQrUrl: '',
                            useCustomShopQr: false
                          });
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
