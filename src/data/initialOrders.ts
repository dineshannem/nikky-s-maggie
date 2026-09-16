import { Order } from '../types';
import { INITIAL_MENU_ITEMS } from './initialMenu';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'NMH-1024',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rahul.s@example.com',
    bookingType: 'dine_in',
    tableNumber: 'Table 2 (Indoor - 4 Seater)',
    timeSlot: '12:30 PM - 01:00 PM (Lunch)',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    estimatedReadyTime: '15 mins',
    notes: 'Extra spicy please with crispy fried onions',
    items: [
      {
        id: 'c-1',
        menuItemId: 'mg-4',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'mg-4')!,
        quantity: 2,
        selectedSpiceLevel: 'spicy',
        selectedAddons: [{ id: 'add-2', name: 'Grated Mozzarella Cheese', price: 20 }]
      },
      {
        id: 'c-2',
        menuItemId: 'tc-3',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'tc-3')!,
        quantity: 2,
        selectedSpiceLevel: 'medium'
      }
    ],
    payment: {
      method: 'upi',
      upiApp: 'gpay',
      upiId: 'rahul@oksbi',
      transactionId: 'UPI-TXN-984201',
      subtotal: 278,
      tax: 14,
      convenienceFee: 0,
      paymentGatewayFee: 0,
      discount: 0,
      total: 292,
      status: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString()
    }
  },
  {
    id: 'NMH-1025',
    customerName: 'Priya Reddy',
    customerPhone: '+91 91234 56789',
    customerEmail: 'priya.r@example.com',
    bookingType: 'takeaway',
    timeSlot: 'Immediate (Ready in 15 mins)',
    status: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    estimatedReadyTime: 'Ready for Pickup',
    notes: 'Pack chutney and sambar in separate cups',
    items: [
      {
        id: 'c-3',
        menuItemId: 'ds-5',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'ds-5')!,
        quantity: 2,
        selectedSpiceLevel: 'medium',
        selectedAddons: [{ id: 'add-1', name: 'Extra Amul Butter', price: 15 }]
      },
      {
        id: 'c-4',
        menuItemId: 'tc-6',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'tc-6')!,
        quantity: 1
      }
    ],
    payment: {
      method: 'upi',
      upiApp: 'phonepe',
      upiId: 'priya@ybl',
      transactionId: 'UPI-TXN-773129',
      subtotal: 140,
      tax: 7,
      convenienceFee: 0,
      paymentGatewayFee: 0,
      discount: 0,
      total: 147,
      status: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString()
    }
  },
  {
    id: 'NMH-1026',
    customerName: 'Ananya Verma',
    customerPhone: '+91 98451 22334',
    customerEmail: 'ananya.v@example.com',
    bookingType: 'dine_in',
    tableNumber: 'Table 4 (Garden Side - 4 Seater)',
    timeSlot: '04:30 PM - 05:00 PM (Tea & Snacks)',
    status: 'preparing',
    createdAt: new Date(Date.now() - 3600000 * 0.3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.1).toISOString(),
    estimatedReadyTime: '8 mins',
    notes: 'Make fries extra crispy with peri-peri sprinkle',
    items: [
      {
        id: 'c-5',
        menuItemId: 'sn-2',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'sn-2')!,
        quantity: 1,
        selectedSpiceLevel: 'spicy'
      },
      {
        id: 'c-6',
        menuItemId: 'pz-2',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'pz-2')!,
        quantity: 1
      },
      {
        id: 'c-7',
        menuItemId: 'tc-1',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'tc-1')!,
        quantity: 3
      }
    ],
    payment: {
      method: 'upi',
      upiApp: 'gpay',
      upiId: 'ananya@upi',
      transactionId: 'UPI-TXN-419052',
      subtotal: 245,
      tax: 12,
      convenienceFee: 0,
      paymentGatewayFee: 0,
      discount: 0,
      total: 257,
      status: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 0.3).toISOString()
    }
  },
  {
    id: 'NMH-1027',
    customerName: 'Karthik Raja',
    customerPhone: '+91 97890 12345',
    customerEmail: 'karthik.r@example.com',
    bookingType: 'dine_in',
    tableNumber: 'Table 1 (Window View - 2 Seater)',
    timeSlot: '05:30 PM - 06:00 PM (Evening Rush)',
    status: 'new',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    estimatedReadyTime: '12 mins',
    notes: 'Sunday Special Chicken Pulav booking',
    items: [
      {
        id: 'c-8',
        menuItemId: 'sp-1',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'sp-1')!,
        quantity: 2,
        selectedSpiceLevel: 'spicy'
      },
      {
        id: 'c-9',
        menuItemId: 'nv-1',
        item: INITIAL_MENU_ITEMS.find(m => m.id === 'nv-1')!,
        quantity: 1,
        selectedSpiceLevel: 'spicy'
      }
    ],
    payment: {
      method: 'upi',
      upiApp: 'paytm',
      upiId: 'karthik@paytm',
      transactionId: 'UPI-TXN-110482',
      subtotal: 490,
      tax: 25,
      convenienceFee: 0,
      paymentGatewayFee: 0,
      discount: 20,
      total: 495,
      status: 'paid',
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  }
];
