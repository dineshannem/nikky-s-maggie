/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MenuSection } from './components/MenuSection';
import { MyOrdersView } from './components/MyOrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiDocsView } from './components/ApiDocsView';
import { ItemBookingModal } from './components/ItemBookingModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { TableQrModal } from './components/TableQrModal';
import { NotificationCenter } from './components/NotificationCenter';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  Zap,
  Coffee,
  Utensils,
  Smartphone
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    selectedItemForBooking,
    setSelectedItemForBooking,
    checkoutOpen, 
    setCheckoutOpen, 
    activeReceiptOrder, 
    setActiveReceiptOrder,
    tableQrOpen,
    setTableQrOpen,
    upiGuideOpen,
    setUpiGuideOpen,
    currentTable,
    t
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-amber-500 selection:text-neutral-950 font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]">
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main App Content View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 sm:py-5 md:py-6 overflow-x-hidden">
        <div className="w-full min-w-0">
          {(activeTab === 'menu' || activeTab === 'cart') && <MenuSection />}
          {activeTab === 'my_orders' && <MyOrdersView />}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'api_docs' && <ApiDocsView />}
        </div>
      </main>

      {/* Global Interactive Modals */}
      <ItemBookingModal 
        key={selectedItemForBooking?.id || 'item-booking-closed'}
        item={selectedItemForBooking} 
        onClose={() => setSelectedItemForBooking(null)} 
      />
      
      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />

      <ReceiptModal 
        order={activeReceiptOrder} 
        onClose={() => setActiveReceiptOrder(null)} 
      />

      <TableQrModal
        isOpen={tableQrOpen}
        onClose={() => setTableQrOpen(false)}
      />

      {/* Modern Kiosk Footer - Fully Responsive */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md transition-colors w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
            
            {/* Brand column */}
            <div className="space-y-2.5 sm:col-span-2 lg:col-span-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-black text-sm shadow-xs shrink-0">
                  NM
                </div>
                <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 break-words">
                  Nikky's Maggie House
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed break-words">
                Burger King style Scan & Order dining app with instant UPI payments and real-time pickup tokens.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="break-words">Zero Queue • Instant Pickup Tokens Active</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs min-w-0">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                Quick Navigation
              </span>
              <ul className="space-y-1.5 text-neutral-500 dark:text-neutral-400">
                <li>
                  <button 
                    onClick={() => setActiveTab('menu')} 
                    className="hover:text-amber-500 transition-colors text-left w-full break-words"
                  >
                    Food Menu & Instant Tray
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('my_orders')} 
                    className="hover:text-amber-500 transition-colors text-left w-full break-words"
                  >
                    My Orders
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('admin')} 
                    className="hover:text-amber-500 transition-colors text-left w-full break-words"
                  >
                    Kitchen & Admin Portal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTableQrOpen(true)} 
                    className="hover:text-amber-500 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="break-words">Scan & Order QR</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Timings & Location */}
            <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                Store Hours & Location
              </span>
              <p className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="break-words">Mon - Sun: 10:00 AM - 11:30 PM</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="break-words">Shop 12, Food Street, University Rd</span>
              </p>
              <p className="flex items-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="break-words">+91 98200 12345</span>
              </p>
            </div>

            {/* Security & Discounts */}
            <div className="space-y-2 text-xs min-w-0">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                Offers & Payment
              </span>
              <div className="space-y-2 text-neutral-500 dark:text-neutral-400 text-[11px]">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-neutral-800 dark:text-neutral-200">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">Promo Code: NIKKY10</span>
                  <span className="break-words">Use code <strong>NIKKY10</strong> for flat 10% discount on your bill</span>
                </div>
                <p className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="break-words">Direct Bank-to-Bank UPI Transfer</span>
                </p>
              </div>
            </div>

          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-neutral-500 gap-2 text-center sm:text-left">
            <p className="break-words px-1">
              © {new Date().getFullYear()} Nikky's Maggie House • Fast Contactless Dine-In & Takeaway
            </p>
            <p className="flex items-center justify-center gap-1 flex-wrap px-1">
              <span className="break-words">Scan & Order System Active • Burger King Style</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}