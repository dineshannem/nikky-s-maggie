export type Category = 
  | 'all'
  | 'tea_coffee'
  | 'maggie'
  | 'snacks'
  | 'dosa'
  | 'pizza'
  | 'rice_varieties'
  | 'chapati'
  | 'non_veg'
  | 'specials';

export interface MenuItem {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  nameEs?: string;
  category: Exclude<Category, 'all'>;
  price: number;
  description: string;
  isVeg: boolean;
  spiceLevel?: 'mild' | 'medium' | 'spicy';
  isDaySpecial?: string;
  isNew?: boolean;
  stock: number;
  initialStock: number;
  imageUrl: string;
  rating: number;
  preparationTime: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  item: MenuItem;
  quantity: number;
  selectedSpiceLevel?: 'mild' | 'medium' | 'spicy';
  selectedAddons?: AddonOption[];
  notes?: string;
}

export type BookingType = 'dine_in' | 'takeaway';

export interface PaymentDetails {
  method: 'upi' | 'counter';
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  upiId?: string;
  transactionId: string;
  subtotal: number;
  tax: number;
  convenienceFee: number;
  paymentGatewayFee: number;
  discount: number;
  total: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  tokenNumber?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  bookingType: BookingType;
  tableNumber?: string;
  timeSlot?: string;
  payment: PaymentDetails;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
  type: 'order_status' | 'inventory_alert' | 'payment_success';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
}

export type LanguageCode = 'en' | 'te';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi?: string;
    te: string;
    es?: string;
  };
}