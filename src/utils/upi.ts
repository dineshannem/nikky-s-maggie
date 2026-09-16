/**
 * UPI Integration & Deep Linking Utility
 * 
 * Implements National Payments Corporation of India (NPCI) UPI Intent URI Specification:
 * upi://pay?pa={vpa}&pn={merchant_name}&am={amount}&cu=INR&tn={note}&tr={ref}
 * 
 * On Android and iOS mobile devices, clicking a link or navigating to `upi://pay?...`
 * prompts the operating system to open the native UPI app chooser (Google Pay, PhonePe,
 * Paytm, BHIM, CRED, Amazon Pay, etc.).
 */

import QRCode from 'qrcode';

export interface UpiPaymentConfig {
  vpa: string;           // Merchant Virtual Payment Address e.g. "nikkys@upi" or "9820012345@paytm"
  merchantName: string;  // Registered Merchant / Business Name
  amount: number;        // Total bill amount in INR
  transactionNote?: string; // Order note or invoice reference
  transactionRef?: string;  // Unique transaction reference / Order ID
}

export type UpiAppTarget = 'all' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred';

/**
 * Generates the official NPCI standard UPI Payment URI
 */
export function generateUpiUri(config: UpiPaymentConfig, app: UpiAppTarget = 'all'): string {
  const { vpa, merchantName, amount, transactionNote = 'Nikky Cafe Order', transactionRef = `NMH${Date.now()}` } = config;

  const params = new URLSearchParams();
  params.set('pa', vpa.trim());
  params.set('pn', merchantName.trim());
  params.set('am', Math.max(1, amount).toFixed(2));
  params.set('cu', 'INR');
  params.set('tn', transactionNote.slice(0, 50));
  params.set('tr', transactionRef);
  params.set('mode', '02'); // Secure QR / in-app intent
  params.set('purpose', '00');

  const queryString = params.toString();

  switch (app) {
    case 'gpay':
      // Google Pay deep link intent on mobile
      return `tez://upi/pay?${queryString}`;
    case 'phonepe':
      // PhonePe deep link intent
      return `phonepe://pay?${queryString}`;
    case 'paytm':
      // Paytm deep link intent
      return `paytmmp://pay?${queryString}`;
    case 'cred':
      // CRED UPI deep link
      return `cred://pay?${queryString}`;
    default:
      // Standard NPCI generic intent recognized by all mobile OS
      return `upi://pay?${queryString}`;
  }
}

/**
 * Checks if current runtime is a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Triggers the native mobile UPI app chooser or specific app
 */
export function openUpiApp(config: UpiPaymentConfig, app: UpiAppTarget = 'all'): boolean {
  const uri = generateUpiUri(config, app);

  try {
    // Attempt standard intent launch via window.location
    window.location.href = uri;
    return true;
  } catch (err) {
    console.warn('Unable to directly trigger UPI protocol link:', err);
    return false;
  }
}

/**
 * Generates high-resolution Data URL for dynamic UPI QR Code display
 */
export async function generateUpiQrDataUrl(config: UpiPaymentConfig): Promise<string> {
  const uri = generateUpiUri(config, 'all');
  try {
    return await QRCode.toDataURL(uri, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#171717',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

/**
 * Generates Table QR Code URL for "Scan & Order from Table"
 */
export async function generateTableQrDataUrl(tableNumber: string, baseUrl?: string): Promise<string> {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nikkys.cafe');
  const tableUrl = `${origin}?table=${encodeURIComponent(tableNumber)}`;
  
  try {
    return await QRCode.toDataURL(tableUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate table QR:', err);
    return '';
  }
}

/**
 * Generates Universal App QR Code URL (Access anywhere without table preselection)
 */
export async function generateAppQrDataUrl(baseUrl?: string): Promise<string> {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nikkys.cafe');
  try {
    return await QRCode.toDataURL(origin, {
      width: 360,
      margin: 2,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate universal app QR:', err);
    return '';
  }
}

/**
 * Verified fallback food image by category to ensure no broken images ever appear
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  tea_coffee: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  maggie: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
  snacks: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
  rice_varieties: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  chapati: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  non_veg: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  specials: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80'
};
