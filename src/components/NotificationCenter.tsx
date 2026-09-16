import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Trash2, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    pushNotificationsEnabled, 
    togglePushNotifications,
    t,
    setActiveReceiptOrder,
    orders
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOrderClick = (orderId?: string) => {
    if (!orderId) return;
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      setActiveReceiptOrder(targetOrder);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-sm h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t('notifications_title')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Toggle Setting */}
        <div className="px-4 py-3 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between">
          <div className="text-xs">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {pushNotificationsEnabled ? t('push_enabled') : t('enable_push')}
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-[11px]">
              Audio alerts & desktop push for order status
            </p>
          </div>
          <button
            onClick={togglePushNotifications}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-hidden ${
              pushNotificationsEnabled ? 'bg-amber-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action toolbar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <button
              onClick={() => notifications.forEach(n => markNotificationAsRead(n.id))}
              className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <Bell className="w-10 h-10 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No notifications yet</p>
              <p className="text-xs mt-1">Status changes for your Maggie & food orders will show up here.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = notif.type === 'payment_success' ? CheckCircle2 : notif.type === 'inventory_alert' ? AlertCircle : Clock;
              const iconColor = notif.type === 'payment_success' ? 'text-emerald-500' : notif.type === 'inventory_alert' ? 'text-amber-500' : 'text-blue-500';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.orderId) handleOrderClick(notif.orderId);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    notif.read 
                      ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-800 opacity-80' 
                      : 'bg-white dark:bg-neutral-800 border-amber-300/60 dark:border-amber-700/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold truncate ${notif.read ? 'text-neutral-800 dark:text-neutral-200' : 'text-amber-900 dark:text-amber-300'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-400">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.orderId && (
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                            #{notif.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
