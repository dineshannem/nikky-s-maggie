import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MenuItem, 
  CartItem, 
  Order, 
  OrderStatus, 
  User, 
  AppNotification, 
  LanguageCode, 
  AddonOption 
} from '../types';
import { 
  AdminCredentials, 
  getStoredAdminCredentials, 
  saveAdminCredentials, 
  verifyAdminCredentials,
  resetAdminCredentials
} from '../data/adminCredentials';
import { INITIAL_MENU_ITEMS } from '../data/initialMenu';
import { INITIAL_ORDERS } from '../data/initialOrders';
import { TRANSLATIONS } from '../data/translations';
import { soundEffects } from '../utils/audio';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
  getItemName: (item: MenuItem) => string;
  
  // Auth & Admin Security
  currentUser: User;
  switchUserRole: (role: 'customer' | 'admin') => void;
  loginAsAdmin: (email: string, pass: string) => boolean;
  logout: () => void;
  adminCredentials: AdminCredentials;
  updateAdminCredentials: (newCreds: AdminCredentials) => void;
  resetAdminCredentialsState: () => void;
  
  // Menu & Stock
  menuItems: MenuItem[];
  updateItemStock: (itemId: string, newStock: number) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, spiceLevel?: 'mild' | 'medium' | 'spicy', addons?: AddonOption[], notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Orders & Transactions
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: CartItem[];
    bookingType: 'dine_in' | 'takeaway';
    tableNumber?: string;
    timeSlot?: string;
    paymentMethod: 'upi' | 'counter';
    upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
    upiId?: string;
    notes?: string;
    discount?: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: 'paid' | 'pending') => void;
  refundOrder: (orderId: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  pushNotificationsEnabled: boolean;
  togglePushNotifications: () => void;
  
  // UI Navigation
  activeTab: 'menu' | 'cart' | 'my_orders' | 'admin' | 'api_docs';
  setActiveTab: (tab: 'menu' | 'cart' | 'my_orders' | 'admin' | 'api_docs') => void;
  selectedItemForBooking: MenuItem | null;
  setSelectedItemForBooking: (item: MenuItem | null) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;

  // Table Scan & Order (Skip the Queue)
  currentTable: string | null;
  setCurrentTable: (table: string | null) => void;
  tableQrOpen: boolean;
  setTableQrOpen: (open: boolean) => void;

  // UPI Deep Linking & Store Config
  upiSettings: { vpa: string; merchantName: string; customShopQrUrl?: string; useCustomShopQr?: boolean };
  updateUpiSettings: (settings: { vpa: string; merchantName: string; customShopQrUrl?: string; useCustomShopQr?: boolean }) => void;
  upiGuideOpen: boolean;
  setUpiGuideOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'nmh_theme',
  LANG: 'nmh_lang',
  MENU: 'nmh_menu_v2',
  ORDERS: 'nmh_orders_v2',
  USER: 'nmh_user',
  PUSH: 'nmh_push_enabled',
  NOTIFS: 'nmh_notifications'
};

const DEFAULT_CUSTOMER: User = {
  id: 'usr-guest',
  name: 'Guest Diner',
  email: 'guest@nikkys.com',
  phone: '+91 98000 00000',
  role: 'customer'
};

const DEFAULT_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Nikky (Owner / Head Chef)',
  email: 'admin@nikkys.com',
  role: 'admin',
  avatar: '👨‍🍳'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Language state
  const [lang, setLangState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      if (saved && (saved === 'en' || saved === 'te')) {
        return saved as LanguageCode;
      }
    }
    return 'en';
  });

  // User state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return DEFAULT_CUSTOMER;
  });

  // Menu items with live inventory
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep user-modified stock while refreshing with latest high-quality food photos
            return parsed.map((item: MenuItem) => {
              const fresh = INITIAL_MENU_ITEMS.find(i => i.id === item.id);
              return fresh ? { ...item, imageUrl: fresh.imageUrl } : item;
            });
          }
        } catch { /* ignore */ }
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Table Scan & Order (Skip the Queue)
  const [currentTable, setCurrentTableState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl) {
        const formatted = tbl.startsWith('Table') ? tbl : `Table ${tbl}`;
        localStorage.setItem('nmh_current_table', formatted);
        return formatted;
      }
      return localStorage.getItem('nmh_current_table') || null;
    }
    return null;
  });

  const setCurrentTable = useCallback((table: string | null) => {
    setCurrentTableState(table);
    if (table) {
      localStorage.setItem('nmh_current_table', table);
    } else {
      localStorage.removeItem('nmh_current_table');
    }
  }, []);

  const [tableQrOpen, setTableQrOpen] = useState(false);

  // UPI Deep-Linking Settings
  const [upiSettings, setUpiSettings] = useState<{ vpa: string; merchantName: string; customShopQrUrl?: string; useCustomShopQr?: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmh_upi_config');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return {
      vpa: 'nikkys@upi',
      merchantName: "Nikky's Maggie House",
      customShopQrUrl: '',
      useCustomShopQr: false
    };
  });

  const updateUpiSettings = useCallback((settings: { vpa: string; merchantName: string; customShopQrUrl?: string; useCustomShopQr?: boolean }) => {
    setUpiSettings(settings);
    localStorage.setItem('nmh_upi_config', JSON.stringify(settings));
  }, []);

  const [upiGuideOpen, setUpiGuideOpen] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders and Transactions
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((order: Order) => (
              order.payment?.method === 'upi' && order.payment.status === 'pending'
                ? { ...order, payment: { ...order.payment, status: 'paid' as const } }
                : order
            ));
          }
        } catch { /* ignore */ }
      }
    }
    return INITIAL_ORDERS;
  });

  // Push notifications
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.PUSH) !== 'false';
    }
    return true;
  });

  // In-app notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome',
      title: "Welcome to Nikky's Maggie House!",
      message: "Order piping hot Maggie, filter coffee and fresh dosa directly with instant booking.",
      timestamp: new Date().toISOString(),
      read: false,
      type: 'order_status'
    }
  ]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'my_orders' | 'admin' | 'api_docs'>('menu');
  const [selectedItemForBooking, setSelectedItemForBooking] = useState<MenuItem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Persist menu and orders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setLang = useCallback((newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEYS.LANG, newLang);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  }, [lang]);

  const getItemName = useCallback((item: MenuItem): string => {
    if (lang === 'te' && item.nameTe) return item.nameTe;
    return item.name;
  }, [lang]);

  const switchUserRole = useCallback((role: 'customer' | 'admin') => {
    if (role === 'admin') {
      setCurrentUser(DEFAULT_ADMIN);
      setActiveTab('admin');
    } else {
      setCurrentUser(DEFAULT_CUSTOMER);
      setActiveTab('menu');
    }
  }, []);

  // Dynamic Admin Credentials Management
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(getStoredAdminCredentials);

  const updateAdminCredentials = useCallback((newCreds: AdminCredentials) => {
    saveAdminCredentials(newCreds);
    setAdminCredentials(newCreds);
    setCurrentUser(prev => ({
      ...prev,
      name: newCreds.displayName,
      email: newCreds.username,
    }));
    soundEffects.playSuccess();
  }, []);

  const resetAdminCredentialsState = useCallback(() => {
    const resetCreds = resetAdminCredentials();
    setAdminCredentials(resetCreds);
    setCurrentUser(prev => ({
      ...prev,
      name: resetCreds.displayName,
      email: resetCreds.username,
    }));
    soundEffects.playSuccess();
  }, []);

  const loginAsAdmin = useCallback((inputUser: string, pass: string): boolean => {
    const isValid = verifyAdminCredentials(inputUser, pass);
    if (isValid) {
      const activeCreds = getStoredAdminCredentials();
      setCurrentUser({
        ...DEFAULT_ADMIN,
        name: activeCreds.displayName,
        email: activeCreds.username,
      });
      setActiveTab('admin');
      soundEffects.playSuccess();
      return true;
    }
    soundEffects.playError();
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(DEFAULT_CUSTOMER);
    setActiveTab('menu');
  }, []);

  // Update real-time inventory
  const updateItemStock = useCallback((itemId: string, newStock: number) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const clampedStock = Math.max(0, newStock);
        return { ...item, stock: clampedStock };
      }
      return item;
    }));
  }, []);

  const updateMenuItem = useCallback((updated: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updated.id ? updated : item));
  }, []);

  const addMenuItem = useCallback((newItemData: Omit<MenuItem, 'id'>) => {
    const newId = `custom-${Date.now()}`;
    const item: MenuItem = {
      ...newItemData,
      id: newId
    };
    setMenuItems(prev => [item, ...prev]);
    soundEffects.playSuccess();
  }, []);

  // Cart operations
  const addToCart = useCallback((
    item: MenuItem, 
    quantity = 1, 
    spiceLevel?: 'mild' | 'medium' | 'spicy', 
    addons?: AddonOption[], 
    notes?: string
  ) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    if (item.stock <= 0 || safeQuantity > item.stock) return;

    setCart(prev => {
      // Find existing item with exact match of addons and spice
      const addonKey = (addons || []).map(a => a.id).sort().join('-');
      const existingIdx = prev.findIndex(ci => 
        ci.menuItemId === item.id && 
        ci.selectedSpiceLevel === spiceLevel &&
        (ci.selectedAddons || []).map(a => a.id).sort().join('-') === addonKey
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const currentQty = copy[existingIdx].quantity;
        const newQty = Math.min(item.stock, currentQty + safeQuantity);
        copy[existingIdx] = { ...copy[existingIdx], quantity: newQty };
        return copy;
      } else {
        const newCartItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          item,
          quantity: safeQuantity,
          selectedSpiceLevel: spiceLevel || item.spiceLevel || 'medium',
          selectedAddons: addons || [],
          notes
        };
        return [...prev, newCartItem];
      }
    });

    window.setTimeout(() => soundEffects.playNotification(), 0);
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => prev.filter(c => c.id !== cartItemId));
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, qty: number) => {
    setCart(prev => {
      if (qty <= 0) {
        return prev.filter(c => c.id !== cartItemId);
      }
      return prev.map(c => {
        if (c.id === cartItemId) {
          const maxAvailable = c.item.stock;
          return { ...c, quantity: Math.min(maxAvailable, qty) };
        }
        return c;
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, ci) => {
      const addonsPrice = (ci.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
      return sum + ((ci.item.price + addonsPrice) * ci.quantity);
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cart]);

  // Notifications push alert helper
  const triggerNotification = useCallback((title: string, message: string, orderId?: string, type: 'order_status' | 'inventory_alert' | 'payment_success' = 'order_status') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      orderId,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (pushNotificationsEnabled) {
      soundEffects.playNotification();

      // Native browser notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico'
          });
        } catch { /* ignore */ }
      }
    }
  }, [pushNotificationsEnabled]);

  const togglePushNotifications = useCallback(() => {
    setPushNotificationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.PUSH, String(next));
      if (next && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
      return next;
    });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Create Order & process booking
  const createOrder = useCallback((orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: CartItem[];
    bookingType: 'dine_in' | 'takeaway';
    tableNumber?: string;
    timeSlot?: string;
    paymentMethod: 'upi' | 'counter';
    upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
    upiId?: string;
    notes?: string;
    discount?: number;
  }): Order => {
    const subtotal = orderData.items.reduce((acc, ci) => {
      const addonsPrice = (ci.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
      return acc + (ci.item.price + addonsPrice) * ci.quantity;
    }, 0);

    const tax = orderData.paymentMethod === 'counter' ? 0 : Math.round(subtotal * 0.05);
    const convenienceFee = orderData.paymentMethod === 'counter' ? 0 : Math.round(subtotal * 0.01);
    const paymentGatewayFee = orderData.paymentMethod === 'counter' ? 0 : Math.round(subtotal * 0.02);
    const discount = orderData.paymentMethod === 'counter' ? 0 : (orderData.discount || 0);
    const total = Math.max(0, subtotal + tax + convenienceFee + paymentGatewayFee - discount);
    const orderId = `NMH-${Math.floor(1000 + Math.random() * 9000)}`;
    const tokenNumber = ((orders.length) % 99) + 1;

    const newOrder: Order = {
      id: orderId,
      tokenNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      items: orderData.items,
      bookingType: orderData.bookingType,
      tableNumber: orderData.tableNumber,
      timeSlot: orderData.timeSlot || 'Immediate (Ready in 15 mins)',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedReadyTime: '15-20 mins',
      notes: orderData.notes,
      payment: {
        method: orderData.paymentMethod,
        upiApp: orderData.upiApp,
        upiId: orderData.upiId,
        transactionId: `${orderData.paymentMethod.toUpperCase()}-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        subtotal,
        tax,
        convenienceFee,
        paymentGatewayFee,
        discount,
        total,
        status: orderData.paymentMethod === 'upi' ? 'paid' : 'pending',
        timestamp: new Date().toISOString()
      }
    };

    // Deduct stock from real-time inventory
    setMenuItems(prev => prev.map(item => {
      const orderedCount = orderData.items
        .filter(ci => ci.menuItemId === item.id)
        .reduce((s, ci) => s + ci.quantity, 0);
      if (orderedCount > 0) {
        return { ...item, stock: Math.max(0, item.stock - orderedCount) };
      }
      return item;
    }));

    // Add to orders list
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    soundEffects.playSuccess();

    // Trigger Notification
    triggerNotification(
      `Order Confirmed! #${orderId}`,
      `Your booking for ${orderData.bookingType === 'dine_in' ? (orderData.tableNumber || 'Table') : 'Takeaway'} has been received and sent to the kitchen. Total: ₹${total}`,
      orderId,
      'payment_success'
    );

    return newOrder;
  }, [triggerNotification]);

  // Update order status (Admin or Kitchen)
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    let orderTarget: Order | undefined;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        orderTarget = { ...o, status, updatedAt: new Date().toISOString() };
        return orderTarget;
      }
      return o;
    }));

    const statusTitles: Record<OrderStatus, string> = {
      new: 'Order Placed',
      preparing: 'Kitchen is Cooking Your Maggie & Dishes! 🍳',
      ready: 'Order is Ready for Pickup / Table! 🛎️',
      completed: 'Order Completed & Served! Enjoy your food! ✨',
      cancelled: 'Order Cancelled'
    };

    triggerNotification(
      `Order #${orderId}: ${statusTitles[status] || status}`,
      `Status updated to "${status.toUpperCase()}". Check your order tracker for details.`,
      orderId,
      'order_status'
    );
  }, [triggerNotification]);

  const updatePaymentStatus = useCallback((orderId: string, paymentStatus: 'paid' | 'pending') => {
    let paymentTotal = 0;

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      paymentTotal = order.payment.total;
      return {
        ...order,
        payment: { ...order.payment, status: paymentStatus, timestamp: new Date().toISOString() },
        updatedAt: new Date().toISOString()
      };
    }));

    triggerNotification(
      `Payment ${paymentStatus === 'paid' ? 'Received' : 'Reopened'}: #${orderId}`,
      paymentStatus === 'paid'
        ? `Counter payment of ₹${paymentTotal} was marked as received.`
        : `Payment for order #${orderId} was returned to pending.`,
      orderId,
      'payment_success'
    );
  }, [triggerNotification]);

  // Refund Order
  const refundOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled',
          payment: { ...o.payment, status: 'refunded' },
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    triggerNotification(
      `Refund Issued for #${orderId}`,
      `Payment of ₹${orders.find(o => o.id === orderId)?.payment.total || 0} has been refunded to original source.`,
      orderId,
      'payment_success'
    );
  }, [orders, triggerNotification]);

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      lang,
      setLang,
      t,
      getItemName,
      currentUser,
      switchUserRole,
      loginAsAdmin,
      logout,
      adminCredentials,
      updateAdminCredentials,
      resetAdminCredentialsState,
      menuItems,
      updateItemStock,
      updateMenuItem,
      addMenuItem,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartCount,
      orders,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      refundOrder,
      notifications,
      markNotificationAsRead,
      clearAllNotifications,
      pushNotificationsEnabled,
      togglePushNotifications,
      activeTab,
      setActiveTab,
      selectedItemForBooking,
      setSelectedItemForBooking,
      checkoutOpen,
      setCheckoutOpen,
      activeReceiptOrder,
      setActiveReceiptOrder,
      currentTable,
      setCurrentTable,
      tableQrOpen,
      setTableQrOpen,
      upiSettings,
      updateUpiSettings,
      upiGuideOpen,
      setUpiGuideOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
