import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Sun, 
  Moon, 
  Bell, 
  Globe, 
  ChevronDown,
  Receipt,
  Lock,
  ShieldCheck,
  LogOut,
  QrCode,
  Sparkles
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { LanguageCode } from '../types';

export const Navbar: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    lang, 
    setLang, 
    t, 
    cartCount, 
    notifications,
    currentUser,
    switchUserRole,
    logout,
    activeTab, 
    setActiveTab,
    setCheckoutOpen,
    setTableQrOpen
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // STRICTLY 2 LANGUAGES: English and Telugu only
  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];

  const isAdminActive = activeTab === 'admin' || currentUser.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* ================= DESKTOP SINGLE ROW VIEW (md and up) ================= */}
          <div className="hidden md:flex items-center justify-between h-18 lg:h-20 gap-3">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => {
                if (isAdminActive) {
                  setActiveTab('admin');
                } else {
                  setActiveTab('menu');
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-neutral-950 font-black flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform text-base">
                NM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base lg:text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {t('brand_title')}
                  </h1>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                    isAdminActive
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  }`}>
                    {isAdminActive ? 'Admin Portal' : 'Scan & Order'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                  {isAdminActive ? 'Kitchen Orders & UPI Settlement' : 'Self-Order • Skip Queues • Instant Token Bill'}
                </p>
              </div>
            </div>

            {/* Central Navigation Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-inner">
              <button
                onClick={() => {
                  switchUserRole('customer');
                  setActiveTab('menu');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'menu' || activeTab === 'cart'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span className="tracking-wide">Menu</span>
              </button>

              <button
                onClick={() => {
                  switchUserRole('customer');
                  setActiveTab('my_orders');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'my_orders'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="tracking-wide">Orders</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('admin');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="tracking-wide">
                  {currentUser.role === 'admin' ? 'Admin' : 'Owner'}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => logout()}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 flex items-center gap-1 transition-all"
                  title="Lock & Logout Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock</span>
                </button>
              )}
            </div>

            {/* Right Action Tools (Desktop) */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              
              {/* Scan & Order QR button */}
              <button
                onClick={() => setTableQrOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 text-xs transition-colors"
                title="Universal Scan & Order QR Code"
              >
                <QrCode className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-[11px]">Scan & Order QR</span>
              </button>

              {/* Language Selector (English & Telugu only) */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 text-xs transition-colors"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-[11px] uppercase">{lang}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {langDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setLangDropdownOpen(false)}
                  >
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                          lang === l.code ? 'font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark / Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-neutral-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Push Notifications Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Live Kitchen Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 animate-pulse">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Customer Tray Button */}
              <button
                onClick={() => setCheckoutOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tray</span>
                {cartCount > 0 ? (
                  <span className="bg-neutral-950 text-amber-400 text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {cartCount}
                  </span>
                ) : null}
              </button>

            </div>

          </div>


          {/* ================= MOBILE 2-ROW VIEW (< md) ================= */}
          <div className="md:hidden py-2 space-y-2">
            
            {/* ROW 1: Brand Header & Main Navigation Tabs */}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              {/* Brand Logo & Name */}
              <div 
                onClick={() => setActiveTab('menu')}
                className="flex items-center gap-2 cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-neutral-950 font-black flex items-center justify-center text-xs shadow-xs">
                  NM
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none truncate">
                    {t('brand_title')}
                  </h1>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block mt-0.5">
                    Scan & Order
                  </span>
                </div>
              </div>

              {/* Primary Navigation Tabs on Mobile */}
              <div className="flex w-full items-center p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-inner">
                <button
                  onClick={() => {
                    switchUserRole('customer');
                    setActiveTab('menu');
                  }}
                  className={`min-w-0 flex-1 justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    activeTab === 'menu' || activeTab === 'cart'
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <UtensilsCrossed className="w-3 h-3" />
                  <span className="truncate">Menu</span>
                </button>

                <button
                  onClick={() => {
                    switchUserRole('customer');
                    setActiveTab('my_orders');
                  }}
                  className={`min-w-0 flex-1 justify-center px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    activeTab === 'my_orders'
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  <span className="truncate">Tokens</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`min-w-0 flex-1 justify-center px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-amber-500" />
                  )}
                  <span className="truncate">{currentUser.role === 'admin' ? 'Admin' : 'Owner'}</span>
                </button>
              </div>
            </div>

            {/* ROW 2: Mobile Utility & Action Bar (Zero Overflow, Fully Responsive) */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
              
              {/* Scan & Order QR */}
              <button
                onClick={() => setTableQrOpen(true)}
                className="flex-1 py-1.5 px-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors"
                title="Universal Scan & Order QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Scan QR</span>
              </button>

              {/* Language Switcher (Only English & Telugu) */}
              <button
                onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
                className="py-1.5 px-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors shrink-0"
                title="Toggle English / తెలుగు"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 shrink-0"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-neutral-700" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>

              {/* Live Alerts Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 shrink-0"
                title="Kitchen Alerts"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Customer Tray Button */}
              <button
                onClick={() => setCheckoutOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Tray</span>
                {cartCount > 0 && (
                  <span className="bg-neutral-950 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};
