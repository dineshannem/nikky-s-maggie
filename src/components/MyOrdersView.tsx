import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Receipt, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const { 
    orders, 
    currentUser, 
    getItemName, 
    setActiveReceiptOrder, 
    setActiveTab, 
    t 
  } = useApp();

  // Customers can only see orders tied to their current contact identity.
  const myOrders = orders.filter(order =>
    order.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
    (currentUser.phone && order.customerPhone === currentUser.phone)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'Order Placed',
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          icon: Clock
        };
      case 'preparing':
        return {
          label: 'Cooking in Kitchen',
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          icon: ChefHat
        };
      case 'ready':
        return {
          label: 'Ready for Serving / Pickup',
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          icon: CheckCircle2
        };
      case 'completed':
        return {
          label: 'Delivered / Completed',
          bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: 'Cancelled / Refunded',
          bg: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          bg: 'bg-neutral-100 text-neutral-800',
          icon: Clock
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100">
            {t('orders')} & Live Status
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track your Maggie and food preparations in real-time from our kitchen
          </p>
        </div>

        <button
          onClick={() => setActiveTab('menu')}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <span>Order More Dishes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto stroke-1" />
          <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            No orders found yet
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Ready for delicious food? Browse Nikky's Maggie House menu and place your first booking!
          </p>
          <button
            onClick={() => setActiveTab('menu')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
          >
            Explore Menu Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const itemsCount = order.items.reduce((s, ci) => s + ci.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs text-center min-w-[64px] shadow-xs">
                      <span className="text-[9px] uppercase tracking-wider block leading-none font-bold text-neutral-900/80">Token</span>
                      <span className="text-sm sm:text-base font-black leading-tight mt-0.5 block">#{order.tokenNumber || 'A-12'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                          {order.bookingType === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          #{order.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.timeSlot || 'Immediate'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-4 sm:p-5 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    {order.items.map((ci, idx) => (
                      <div key={idx} className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">{ci.quantity}x</span>
                          <span className="truncate">{getItemName(ci.item)}</span>
                          {ci.selectedSpiceLevel && (
                            <span className="text-[10px] text-neutral-400">({ci.selectedSpiceLevel})</span>
                          )}
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          ₹{ci.item.price * ci.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial & Status Footer */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Total Amount</span>
                        <span className="text-base font-extrabold text-neutral-900 dark:text-neutral-50">
                          ₹{order.payment.total}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 block">Payment Mode</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase text-[11px]">
                          {order.payment.method} {order.payment.upiApp ? `(${order.payment.upiApp})` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 block">Estimated Time</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                          {order.estimatedReadyTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveReceiptOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
