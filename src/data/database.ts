import { Order, MenuItem } from '../types';

/**
 * Browser persistence boundary for the demo build.
 *
 * The frontend must never connect directly to MySQL. In production, replace
 * this adapter with requests to a Node.js API that owns the MySQL connection.
 */
export const DATABASE_KEYS = {
  MENU: 'nmh_menu_v2',
  ORDERS: 'nmh_orders_v2',
  ADMIN_CREDENTIALS: 'nikkys_admin_credentials'
} as const;

export interface DatabaseSchema {
  menu: MenuItem[];
  orders: Order[];
}

export function readDatabaseValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeDatabaseValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeDatabaseValue(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
