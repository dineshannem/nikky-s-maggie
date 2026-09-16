import React from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { 
  X, 
  CheckCircle, 
  Printer, 
  Download, 
  QrCode,
  Clock
} from 'lucide-react';

interface Props {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ order, onClose }) => {
  const { getItemName } = useApp();

  if (!order) return null;

  const customerName = order.customerName?.trim() || 'Guest';
  const customerPhone = order.customerPhone?.trim() || 'Not provided';
  const convenienceFee = order.payment.convenienceFee || 0;
  const paymentGatewayFee = order.payment.paymentGatewayFee || 0;

  const handlePrint = () => window.print();

  const handleDownloadInvoice = () => {
    const textContent = `
========================================
       NIKKY'S MAGGIE HOUSE
   OFFICIAL TAX INVOICE & CASH BILL
   GSTIN: 27AABCN8192K1Z3
   FSSAI Lic: 11521034000892
========================================
Invoice No   : INV-2026-${order.id.replace('NMH-', '')}
Token Number : #${order.tokenNumber || 'A-12'}
Order Ref    : #${order.id}
Txn Ref      : ${order.payment.transactionId}
Date & Time  : ${new Date(order.createdAt).toLocaleString()}
Order Type   : ${order.bookingType === 'dine_in' ? 'Dine-In (Eat Here)' : 'Takeaway (Pack To Go)'}
Customer     : ${customerName}
Phone        : ${customerPhone}
----------------------------------------
ITEM                          QTY  AMOUNT
----------------------------------------
${order.items.map(ci => {
  const addonsSum = (ci.selectedAddons || []).reduce((s, a) => s + a.price, 0);
  const linePrice = (ci.item.price + addonsSum) * ci.quantity;
  const name = getItemName(ci.item).padEnd(26).substring(0, 26);
  return `${name} ${String(ci.quantity).padStart(3)}  ₹${linePrice}`;
}).join('\n')}
----------------------------------------
Subtotal                   : ₹${order.payment.subtotal}
CGST (2.5%)                : ₹${Math.round(order.payment.tax / 2)}
SGST (2.5%)                : ₹${Math.round(order.payment.tax / 2)}
Convenience Fee (1%)       : ₹${convenienceFee}
Payment Gateway Fee (2%)   : ₹${paymentGatewayFee}
Discount                   : -₹${order.payment.discount}
----------------------------------------
GRAND TOTAL PAID           : ₹${order.payment.total}
Payment Mode               : ${order.payment.method.toUpperCase()} ${order.payment.upiApp ? `(${order.payment.upiApp})` : ''}
Payment Status             : ${order.payment.status.toUpperCase()}
========================================
    Thank you for dining with Nikky's!
========================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${order.id}_NikkyMaggieHouse.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="receipt-print-root fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="receipt-print-sheet w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-b border-neutral-200 dark:border-neutral-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border ${order.payment.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'}`}>
            {order.payment.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            <span>{order.payment.status === 'pending' ? 'Payment Pending • Confirmation Required' : 'Payment Verified • Bill Generated'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            Nikky's Maggie House
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Official Tax Invoice & Dining Cash Bill • FSSAI Lic: 11521034000892
          </p>
          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
            GSTIN: 27AABCN8192K1Z3 • Tech Hub Food Court, Floor 1
          </p>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Token */}
          <div className="p-4 rounded-2xl bg-amber-500 text-neutral-950 text-center shadow-lg shadow-amber-500/20 border-2 border-amber-400">
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900/90 block">
              Serving / Pickup Token
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight my-1">
              #{order.tokenNumber || 'A-12'}
            </div>
            <p className="text-[11px] font-bold text-neutral-900/80">
              Watch the kitchen display for token #{order.tokenNumber || 'A-12'}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 text-[11px]">
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Bill / Invoice No</span>
              <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                INV-2026-{order.id.replace('NMH-', '')}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Order ID</span>
              <p className="font-mono font-bold text-amber-600 dark:text-amber-400">#{order.id}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Order Type</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {order.bookingType === 'dine_in' ? 'Dine-In (Eat Here)' : 'Takeaway (Pack To Go)'}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Date & Time</span>
              <p className="text-neutral-700 dark:text-neutral-300">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Payment Mode</span>
              <p className="font-bold uppercase text-neutral-900 dark:text-neutral-100">
                {order.payment.method} {order.payment.upiApp ? `(${order.payment.upiApp})` : ''}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Payment Status</span>
              <span className={`status-badge font-black uppercase ${order.payment.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {order.payment.status === 'paid' ? 'PAID ✓' : order.payment.status === 'pending' ? 'PENDING - AWAITING CONFIRMATION' : order.payment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ========== CUSTOMER NAME + PHONE ========== */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                  Customer Name
                </span>
                <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {customerName}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                  Contact Phone
                </span>
                <p className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {customerPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 border-t border-b border-neutral-200 dark:border-neutral-800 py-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              <span>Item Description</span>
              <div className="flex gap-8">
                <span>Qty</span>
                <span>Amount</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {order.items.map((ci, i) => {
                const addonsSum = (ci.selectedAddons || []).reduce((s, a) => s + a.price, 0);
                const lineTotal = (ci.item.price + addonsSum) * ci.quantity;

                return (
                  <div key={i} className="flex justify-between items-start gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {getItemName(ci.item)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-6 text-center">{ci.quantity}x</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 w-14 text-right">₹{lineTotal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between"><span>Subtotal:</span><span>₹{order.payment.subtotal}</span></div>
            <div className="flex justify-between text-[11px]"><span>CGST (2.5%):</span><span>₹{Math.round(order.payment.tax / 2)}</span></div>
            <div className="flex justify-between text-[11px]"><span>SGST (2.5%):</span><span>₹{Math.round(order.payment.tax / 2)}</span></div>
            {convenienceFee > 0 && (
              <div className="flex justify-between text-[11px]"><span>Convenience Fee (1%):</span><span>₹{convenienceFee}</span></div>
            )}
            {paymentGatewayFee > 0 && (
              <div className="flex justify-between text-[11px]"><span>Payment Gateway Fee (2%):</span><span>₹{paymentGatewayFee}</span></div>
            )}
            {order.payment.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Special Promo Discount:</span><span>-₹{order.payment.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-neutral-900 dark:text-neutral-50 pt-2 border-t-2 border-dashed border-neutral-200 dark:border-neutral-700">
              <span>{order.payment.status === 'paid' ? 'TOTAL AMOUNT PAID:' : 'TOTAL AMOUNT:'}</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono font-black text-lg">₹{order.payment.total}</span>
            </div>
          </div>

          {/* QR */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-amber-500">Contactless Dispatch Pass</span>
              <p className="text-[11px] text-neutral-700 dark:text-neutral-300">
                Scan or display this QR at the counter to collect your order.
              </p>
              <p className="text-[10px] font-mono text-neutral-400">UTR / Auth: {order.payment.transactionId}</p>
            </div>
            <div className="p-1.5 rounded-xl bg-white text-neutral-950 shadow-sm border border-neutral-200">
              <QrCode className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex gap-2.5 print:hidden">
          <button onClick={handlePrint} className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5">
            <Printer className="w-4 h-4 text-amber-500" /> Print Bill
          </button>
          <button onClick={handleDownloadInvoice} className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5">
            <Download className="w-4 h-4 text-amber-500" /> Download Slip
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20">
            Next Order ✓
          </button>
        </div>
      </div>
    </div>
  );
};