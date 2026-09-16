import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CreditCard, 
  QrCode, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Loader2, 
  Tag, 
  CheckCircle2, 
  Smartphone, 
  AlertCircle, 
  Sparkles, 
  Flame
} from 'lucide-react';
import { openUpiApp, generateUpiQrDataUrl, CATEGORY_FALLBACK_IMAGES } from '../utils/upi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    cartTotal, 
    updateCartQuantity, 
    removeFromCart, 
    createOrder, 
    currentUser,
    getItemName,
    setActiveReceiptOrder,
    upiSettings
  } = useApp();

  const [bookingType, setBookingType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'guest@nikkys.com');
  const [orderNotes, setOrderNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'counter'>('upi');
  const [upiApp, setUpiApp] = useState<'all' | 'gpay' | 'phonepe' | 'paytm'>('all');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showCouponCelebration, setShowCouponCelebration] = useState(false);
  const [billingError, setBillingError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const tax = paymentMethod === 'counter' ? 0 : Math.round((cartTotal || 0) * 0.05);
  const convenienceFee = paymentMethod === 'counter' ? 0 : Math.round((cartTotal || 0) * 0.01);
  const paymentGatewayFee = paymentMethod === 'counter' ? 0 : Math.round((cartTotal || 0) * 0.02);
  const effectiveDiscount = paymentMethod === 'counter' ? 0 : (appliedDiscount || 0);
  const grandTotal = Math.max(0, (cartTotal || 0) + tax + convenienceFee + paymentGatewayFee - effectiveDiscount);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setBillingError('');
      setShowQr(false);
      if (currentUser?.email) setCustomerEmail(currentUser.email);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isOpen && grandTotal > 0 && upiSettings?.vpa) {
      generateUpiQrDataUrl({
        vpa: upiSettings.vpa,
        merchantName: upiSettings.merchantName || "Nikky's Maggie House",
        amount: grandTotal,
        transactionNote: `Nikky Cafe Bill (${cart.length} items)`
      }).then(setUpiQrUrl).catch(() => setUpiQrUrl(''));
    }
  }, [isOpen, grandTotal, upiSettings, cart.length]);

  if (!isOpen) return null;

  const handleApplyCoupon = (overrideCode?: string) => {
    if (paymentMethod === 'counter') {
      setCouponMessage({ text: 'Promotions are unavailable for counter payments.', isError: true });
      return;
    }
    const code = (overrideCode || couponCode).trim().toUpperCase();
    if (code === 'NIKKY10') {
      const disc = Math.round((cartTotal || 0) * 0.10);
      setAppliedDiscount(disc);
      setCouponMessage({ text: `Coupon NIKKY10 applied! 10% OFF (-₹${disc})`, isError: false });
      setCouponCode('NIKKY10');
      setShowCouponCelebration(true);
      setTimeout(() => setShowCouponCelebration(false), 1800);
    } else {
      setAppliedDiscount(0);
      setCouponMessage({ text: 'Only code "NIKKY10" is valid for a 10% discount.', isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponMessage(null);
  };

  const handleLaunchUpi = (target: 'all' | 'gpay' | 'phonepe' | 'paytm' = 'all') => {
    if (!upiSettings?.vpa) {
      setBillingError('UPI settings are not configured.');
      return;
    }
    setUpiApp(target);
    openUpiApp({
      vpa: upiSettings.vpa,
      merchantName: upiSettings.merchantName || "Nikky's Maggie House",
      amount: grandTotal,
      transactionNote: `Nikky Order (${cart.length} items)`
    }, target);
  };

  // ==================== FORCE NATIVE POPUP ====================
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Force Name validation (shows "Please fill out this field.")
    if (!customerName.trim()) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.reportValidity(); // ← THIS SHOWS THE POPUP
      }
      return;
    }

    // 2. Force Phone validation (shows "Please fill out this field.")
    if (!customerPhone.trim()) {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
        phoneInputRef.current.reportValidity(); // ← THIS SHOWS THE POPUP
      }
      return;
    }

    // 3. Extra Indian mobile number check
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      if (phoneInputRef.current) {
        phoneInputRef.current.setCustomValidity('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9');
        phoneInputRef.current.reportValidity();
        phoneInputRef.current.focus();
        // Clear custom message after showing so next time it can show default again
        setTimeout(() => {
          if (phoneInputRef.current) phoneInputRef.current.setCustomValidity('');
        }, 2000);
      }
      return;
    }

    // Clear any custom validity
    if (phoneInputRef.current) phoneInputRef.current.setCustomValidity('');

    if (!cart || cart.length === 0) {
      setBillingError('Your tray is empty. Add at least one item before placing the order.');
      return;
    }

    setBillingError('');
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const order = createOrder({
          customerName: customerName.trim(),
          customerPhone: phoneDigits,
          customerEmail: customerEmail.trim() || 'guest@nikkys.com',
          items: cart,
          bookingType,
          paymentMethod,
          upiApp: paymentMethod === 'upi' ? (upiApp === 'all' ? 'gpay' : upiApp) : undefined,
          upiId: paymentMethod === 'upi' ? upiSettings?.vpa : undefined,
          notes: orderNotes.trim() || undefined,
          discount: effectiveDiscount
        });

        setIsProcessing(false);

        setTimeout(() => {
          onClose();
          setActiveReceiptOrder(order);
        }, 600);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
        setBillingError('Something went wrong. Please try again.');
      }
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
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
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold truncate">Scan & Order • Instant Checkout</h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate">
                Order directly from your phone and skip waiting in lines
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleProcessPayment} className="flex flex-col flex-1 min-h-0 overflow-hidden" noValidate={false}>
          <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1 min-h-0">
            
            {/* Cart Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Order Items ({cart.length})
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Subtotal: ₹{cartTotal}</span>
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
                  Your order tray is empty.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 sm:max-h-52 overflow-y-auto pr-1">
                  {cart.map(cartItem => (
                    <div key={cartItem.id} className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img 
                          src={cartItem.item.imageUrl} 
                          alt={cartItem.item.name}
                          onError={(e) => { e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[cartItem.item.category] || CATEGORY_FALLBACK_IMAGES.default || ''; }}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{getItemName(cartItem.item)}</p>
                          <p className="text-[10px] text-neutral-500">₹{cartItem.item.price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-0.5">
                          <button type="button" onClick={() => updateCartQuantity(cartItem.id, Math.max(0, cartItem.quantity - 1))} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">{cartItem.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(cartItem.id, cartItem.quantity + 1)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-xs w-11 text-right">₹{cartItem.item.price * cartItem.quantity}</span>
                        <button type="button" onClick={() => removeFromCart(cartItem.id)} className="p-1 text-neutral-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dining + Customer */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Order Preference
              </span>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                <button type="button" onClick={() => setBookingType('dine_in')} className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 ${bookingType === 'dine_in' ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'}`}>
                  <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600"><Flame className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs font-bold">Dine-In (Eat Here)</p>
                    <p className="text-[10px] text-neutral-500">Freshly prepared & hot</p>
                  </div>
                </button>
                <button type="button" onClick={() => setBookingType('takeaway')} className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 ${bookingType === 'takeaway' ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'}`}>
                  <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600"><ShoppingBag className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs font-bold">Takeaway (Pack To Go)</p>
                    <p className="text-[10px] text-neutral-500">Packed parcel with token</p>
                  </div>
                </button>
              </div>

              {/* ========== NAME & PHONE – REQUIRED FOR NATIVE POPUP ========== */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="customerName"
                    value={customerName}
                    required
                    minLength={2}
                    pattern="[A-Za-z][A-Za-z .'-]{1,}"
                    title="Please enter your full name."
                    autoComplete="name"
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setBillingError('');
                    }}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-[10px] text-neutral-500">Required for billing</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="customerEmail"
                    value={customerEmail}
                    required
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      setBillingError('');
                    }}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-[10px] text-neutral-500">Required for your digital bill.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    name="customerPhone"
                    value={customerPhone}
                    required
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    inputMode="numeric"
                    title="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                    autoComplete="tel"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomerPhone(digits);
                      if (phoneInputRef.current) phoneInputRef.current.setCustomValidity('');
                      setBillingError('');
                    }}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-[10px] text-neutral-500">Must start with 6, 7, 8 or 9</p>
                </div>
              </div>

              {billingError && (
                <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{billingError}</span>
                </p>
              )}
            </div>

            {/* Coupon */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Promo Coupon (NIKKY10)
                </span>
                {appliedDiscount > 0 && (
                  <button type="button" onClick={handleRemoveCoupon} className="text-[11px] text-red-500 hover:underline font-semibold">Remove</button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter NIKKY10"
                  disabled={paymentMethod === 'counter' || appliedDiscount > 0}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs uppercase focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
                <button type="button" onClick={() => handleApplyCoupon()} disabled={paymentMethod === 'counter' || appliedDiscount > 0} className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs hover:bg-amber-500 hover:text-neutral-950 disabled:opacity-50">
                  {appliedDiscount > 0 ? 'Applied' : 'Apply'}
                </button>
              </div>
              <button type="button" onClick={() => handleApplyCoupon('NIKKY10')} disabled={paymentMethod === 'counter' || appliedDiscount > 0} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold disabled:opacity-50">
                <Sparkles className="w-3 h-3" /> Tap to apply "NIKKY10" (10% OFF)
              </button>
              {couponMessage && (
                <p className={`text-[11px] font-semibold flex items-start gap-1.5 ${couponMessage.isError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {couponMessage.isError ? <AlertCircle className="w-3.5 h-3.5 mt-0.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />}
                  <span>{couponMessage.text}</span>
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Select Payment Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPaymentMethod('upi')} className={`p-2.5 rounded-xl border text-center font-bold ${paymentMethod === 'upi' ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'}`}>
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <span className="text-xs">UPI Direct</span>
                </button>
                <button type="button" onClick={() => { setPaymentMethod('counter'); setAppliedDiscount(0); setCouponCode(''); setCouponMessage({ text: 'Promotions unavailable for counter.', isError: false }); }} className={`p-2.5 rounded-xl border text-center font-bold ${paymentMethod === 'counter' ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'}`}>
                  <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <span className="text-xs">Cash Counter</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Open Payment App:</span>
                    <button type="button" onClick={() => setShowQr(!showQr)} className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> {showQr ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button type="button" onClick={() => handleLaunchUpi('all')} className="p-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" /> Any UPI
                    </button>
                    <button type="button" onClick={() => handleLaunchUpi('gpay')} className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-blue-700 dark:text-blue-300 font-bold text-[11px]">Google Pay</button>
                    <button type="button" onClick={() => handleLaunchUpi('phonepe')} className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 text-purple-700 dark:text-purple-300 font-bold text-[11px]">PhonePe</button>
                    <button type="button" onClick={() => handleLaunchUpi('paytm')} className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 text-sky-700 dark:text-sky-300 font-bold text-[11px]">Paytm</button>
                  </div>
                  {showQr && upiQrUrl && (
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl border text-center space-y-1 mt-2">
                      <p className="text-[11px] font-bold">Scan to Pay ₹{grandTotal}</p>
                      <img src={upiQrUrl} alt="QR" className="w-36 h-36 mx-auto rounded-lg" />
                      <p className="text-[10px] font-mono break-all">UPI: {upiSettings?.vpa}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 space-y-1.5 text-neutral-600 dark:text-neutral-300">
              <div className="flex justify-between"><span>Items Total</span><span>₹{cartTotal}</span></div>
              <div className="flex justify-between"><span>GST & Packaging (5%)</span><span>₹{tax}</span></div>
              {paymentMethod === 'upi' && (
                <>
                  <div className="flex justify-between"><span>Convenience Fee (1%)</span><span>₹{convenienceFee}</span></div>
                  <div className="flex justify-between"><span>Payment Gateway Fee (2%)</span><span>₹{paymentGatewayFee}</span></div>
                </>
              )}
              {appliedDiscount > 0 && paymentMethod === 'upi' && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>NIKKY10 Discount</span><span>-₹{effectiveDiscount}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-1.5 flex justify-between font-black text-sm text-neutral-900 dark:text-neutral-100">
                <span>Final Bill Amount</span>
                <span className="text-amber-600 dark:text-amber-400">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 shrink-0">
            <button type="button" onClick={onClose} className="px-3 sm:px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Back
            </button>
            <button
              type="submit"
              disabled={cart.length === 0 || isProcessing}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md ${
                cart.length === 0 || isProcessing
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {isProcessing ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming...</>
              ) : (
                <><span>Place Order • ₹{grandTotal}</span> <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};