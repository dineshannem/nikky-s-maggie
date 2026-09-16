import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, AddonOption } from '../types';
import { 
  X, 
  Flame, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  Tag, 
  Clock, 
  ChevronRight, 
  Check, 
  Minus, 
  Plus, 
  CheckCircle2, 
  Smartphone, 
  QrCode,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { openUpiApp, generateUpiQrDataUrl, isMobileDevice, CATEGORY_FALLBACK_IMAGES } from '../utils/upi';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
}

const AVAILABLE_ADDONS: AddonOption[] = [
  { id: 'ad-cheese', name: 'Extra Amul Cheese', price: 20 },
  { id: 'ad-butter', name: 'Desi Butter Cube', price: 15 },
  { id: 'ad-egg', name: 'Boiled / Poached Egg', price: 15 },
  { id: 'ad-chili', name: 'Fried Green Chillies', price: 10 },
  { id: 'ad-paneer', name: 'Grilled Paneer Cubes', price: 25 },
  { id: 'ad-mayo', name: 'Garlic Mayo Dip', price: 15 }
];

export const ItemBookingModal: React.FC<Props> = ({ item, onClose }) => {
  const { 
    createOrder, 
    addToCart, 
    getItemName, 
    setActiveReceiptOrder, 
    currentUser,
    upiSettings,
    t 
  } = useApp();

  // Customization state
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'spicy'>(item?.spiceLevel || 'medium');
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const [notes, setNotes] = useState('');

  // Dining preference (Burger King Style: Dine-In vs Takeaway)
  const [bookingType, setBookingType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'counter'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCouponCelebration, setShowCouponCelebration] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [billingAttempted, setBillingAttempted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const handleToggleAddon = (addon: AddonOption) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = (item.price + addonsTotal) * quantity;
  const tax = paymentMethod === 'counter' ? 0 : Math.round(subtotal * 0.05);
  const effectiveDiscount = paymentMethod === 'counter' ? 0 : appliedDiscount;
  const grandTotal = Math.max(0, subtotal + tax - effectiveDiscount);
  const isOutOfStock = item.stock <= 0;

  // STRICT COUPON: ONLY NIKKY10 is valid for 10% discount on the bill
  const handleApplyCoupon = (overrideCode?: string) => {
    const codeToTest = (overrideCode || couponCode).trim().toUpperCase();
    if (codeToTest === 'NIKKY10') {
      const disc = Math.round(subtotal * 0.10);
      setAppliedDiscount(disc);
      setCouponMessage({ text: `Coupon NIKKY10 applied! 10% OFF (-₹${disc})`, isError: false });
      setCouponCode('NIKKY10');
      setShowCouponCelebration(true);
      window.setTimeout(() => setShowCouponCelebration(false), 1800);
    } else {
      setAppliedDiscount(0);
      setCouponMessage({ text: 'Only code "NIKKY10" is valid for a 10% discount on your bill.', isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponMessage(null);
  };

  // Generate UPI QR code for current grand total
  useEffect(() => {
    generateUpiQrDataUrl({
      vpa: upiSettings.vpa,
      merchantName: upiSettings.merchantName,
      amount: grandTotal,
      transactionNote: `Order: ${item.name}`
    }).then(setUpiQrUrl);
  }, [grandTotal, upiSettings, item.name]);

  // Handle UPI direct app launch
  const handleLaunchUpi = (appTarget: 'all' | 'gpay' | 'phonepe' | 'paytm' = 'all') => {
    openUpiApp({
      vpa: upiSettings.vpa,
      merchantName: upiSettings.merchantName,
      amount: grandTotal,
      transactionNote: `Nikky Order - ${item.name}`
    }, appTarget);
  };

  // Direct In-Place Booking & Instant Order
  const handleCompleteBookingAndPay = () => {
    setBillingAttempted(true);
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (isOutOfStock || isProcessing || quantity < 1 || quantity > item.stock) return;
    if (!nameInputRef.current?.checkValidity()) {
      nameInputRef.current?.focus();
      nameInputRef.current?.reportValidity();
      return;
    }
    if (!phoneInputRef.current?.checkValidity()) {
      phoneInputRef.current?.focus();
      phoneInputRef.current?.reportValidity();
      return;
    }
    setBillingError('');
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        customerName: customerName.trim(),
        customerPhone: phoneDigits,
        customerEmail: 'diner@maggiehouse.com',
        items: [
          {
            id: `ci_${Date.now()}`,
            menuItemId: item.id,
            item: item,
            quantity,
            selectedSpiceLevel: spiceLevel,
            selectedAddons,
            notes
          }
        ],
        bookingType,
        paymentMethod,
        upiApp: paymentMethod === 'upi' ? upiApp : undefined,
        upiId: paymentMethod === 'upi' ? upiSettings.vpa : undefined,
        notes: notes.trim() || undefined,
        discount: effectiveDiscount
      });

      setIsProcessing(false);
      onClose();
      setActiveReceiptOrder(order);
    }, 700);
  };

  const handleAddOnlyToTray = () => {
    addToCart(item, quantity, spiceLevel, selectedAddons, notes);
    onClose();
  };

  const isMobile = isMobileDevice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      {showCouponCelebration && (
        <div className="coupon-burst pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
          <div className="coupon-popper coupon-popper-left" />
          <div className="coupon-popper coupon-popper-right" />
          {Array.from({ length: 20 }, (_, index) => (
            <span
              key={index}
              className="coupon-strip"
              style={{
                '--burst-angle': `${index * 18 - 171}deg`,
                '--burst-delay': `${index * 18}ms`,
                '--burst-color': ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'][index % 5]
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            onError={(e) => {
              e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.default;
            }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title on Image */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                item.isVeg ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {item.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
              <span className="flex items-center gap-1 text-[11px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{item.preparationTime}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                ⚡ Fast Token Order
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{getItemName(item)}</h2>
            <p className="text-xs text-neutral-200 line-clamp-1">{item.description}</p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Quantity and Price */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Item Price</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹{item.price}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Quantity:</span>
              <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Taste & Customization */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800">
            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              1. Customize Spice & Gourmet Add-ons
            </span>

            {/* Spice levels */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                Spice Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'mild', label: 'Mild (Gentle)', icon: '🟢' },
                  { level: 'medium', label: 'Medium (Balanced)', icon: '🟡' },
                  { level: 'spicy', label: 'Spicy (Hot & Tangy)', icon: '🔴' }
                ].map(sp => (
                  <button
                    key={sp.level}
                    type="button"
                    onClick={() => setSpiceLevel(sp.level as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                      spiceLevel === sp.level
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold' 
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="mr-1">{sp.icon}</span>
                    <span>{sp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                Optional Add-ons:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_ADDONS.map(addon => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleToggleAddon(addon)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300' 
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <p className="font-semibold truncate text-[11px]">{addon.name}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">+₹{addon.price}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cooking Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                Special Cooking Instructions (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Less salt, extra crispy, separate cutlery"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Order Type (Burger King Style) */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800">
            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              2. Order Type (Instant Token Assignment)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBookingType('dine_in')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  bookingType === 'dine_in'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Dine-In (Eat Here)</p>
                  <p className="text-[10px] text-neutral-500">Served hot & fresh</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('takeaway')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  bookingType === 'takeaway'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Takeaway (Pack To Go)</p>
                  <p className="text-[10px] text-neutral-500">Fast packed parcel pick-up</p>
                </div>
              </button>
            </div>

            {/* Quick Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Customer Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={customerName}
                  required
                  minLength={2}
                  pattern="[A-Za-z][A-Za-z .'-]{1,}"
                  title="Please enter your full name."
                  autoComplete="name"
                  onChange={e => {
                    setCustomerName(e.target.value);
                    setBillingError('');
                  }}
                  placeholder="Your Name"
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 ${billingAttempted && !customerName.trim() ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-neutral-300 dark:border-neutral-700'}`}
                />
                <p className="mt-1 text-[10px] text-neutral-500">Enter your valid name for billing.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Phone Number (For Bill SMS & Token) <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={customerPhone}
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  inputMode="numeric"
                  title="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  autoComplete="tel"
                  onChange={e => {
                    setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setBillingError('');
                  }}
                  placeholder="+91 98200 12345"
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 ${billingAttempted && !/^[6-9]\d{9}$/.test(customerPhone.replace(/\D/g, '')) ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-neutral-300 dark:border-neutral-700'}`}
                />
                <p className="mt-1 text-[10px] text-neutral-500">Enter a valid 10-digit Indian mobile number.</p>
              </div>
            </div>
            {billingError && (
              <p role="alert" className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{billingError}</span>
              </p>
            )}
          </div>

          {/* Section 3: STRICT Coupon Code: ONLY NIKKY10 */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                3. Coupon Discount (10% OFF with NIKKY10)
              </span>
              {appliedDiscount > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] text-red-500 hover:underline font-semibold"
                >
                  Remove Coupon
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter NIKKY10"
                disabled={appliedDiscount > 0}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-xs uppercase focus:outline-hidden focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={appliedDiscount > 0}
                className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs hover:bg-amber-500 hover:text-neutral-950 transition-colors"
              >
                {appliedDiscount > 0 ? 'Applied' : 'Apply'}
              </button>
            </div>

            {/* Quick 1-tap NIKKY10 Chip */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleApplyCoupon('NIKKY10')}
                disabled={appliedDiscount > 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-500/25 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Tap to apply "NIKKY10" (10% OFF)</span>
              </button>
            </div>

            {couponMessage && (
              <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                couponMessage.isError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {couponMessage.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{couponMessage.text}</span>
              </p>
            )}
          </div>

          {/* Section 4: UPI & Payment Redirection */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              4. Payment Method & UPI Redirection
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                <span>UPI Direct</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('counter');
                  setAppliedDiscount(0);
                  setCouponMessage({ text: 'Promotions are unavailable for counter payments.', isError: false });
                }}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  paymentMethod === 'counter'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                <span>Pay at Counter</span>
              </button>
            </div>

            {/* UPI Deep-Link Action Panel */}
            {paymentMethod === 'upi' && (
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Direct Payment via Installed Phone Apps:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(!showQrModal)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrModal ? 'Hide QR' : 'Show UPI QR'}</span>
                  </button>
                </div>

                {/* Direct App Launch Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchUpi('all')}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all sm:col-span-1"
                    title="Opens app selector on Android/iOS"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Any UPI App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi('gpay')}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] hover:bg-blue-100 transition-all text-center"
                  >
                    Google Pay
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi('phonepe')}
                    className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-[11px] hover:bg-purple-100 transition-all text-center"
                  >
                    PhonePe
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi('paytm')}
                    className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-300 font-bold text-[11px] hover:bg-sky-100 transition-all text-center"
                  >
                    Paytm
                  </button>
                </div>

                {/* Expandable QR Display */}
                {showQrModal && upiQrUrl && (
                  <div className="p-3 bg-white rounded-2xl border border-neutral-200 text-center space-y-1">
                    <p className="text-[11px] text-neutral-600 font-bold">Scan to Pay ₹{grandTotal}</p>
                    <img src={upiQrUrl} alt="UPI QR" className="w-36 h-36 mx-auto" />
                    <p className="text-[10px] text-neutral-500 font-mono">UPI ID: {upiSettings.vpa}</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bill Summary */}
          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 space-y-1.5 text-neutral-600 dark:text-neutral-300">
            <div className="flex justify-between">
              <span>Item ({item.name} × {quantity})</span>
              <span>₹{item.price * quantity}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between">
                <span>Add-ons ({selectedAddons.length})</span>
                <span>₹{addonsTotal * quantity}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST & Packaging (5%)</span>
              <span>₹{tax}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Promo Discount (NIKKY10 10%)</span>
                <span>-₹{effectiveDiscount}</span>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-1.5 flex justify-between font-black text-sm text-neutral-900 dark:text-neutral-100">
              <span>Total Payable</span>
              <span className="text-amber-600 dark:text-amber-400">₹{grandTotal}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions (Sticky Bottom on Mobile) */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddOnlyToTray}
            className="px-3 sm:px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs transition-colors shrink-0 text-neutral-700 dark:text-neutral-300"
          >
            Add to Tray
          </button>

          <button
            type="button"
            onClick={handleCompleteBookingAndPay}
            disabled={isOutOfStock || isProcessing}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isOutOfStock 
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {isProcessing ? (
              <span>Confirming Order...</span>
            ) : (
              <>
                <span>Confirm & Pay ₹{grandTotal}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
