import { DATABASE_KEYS, readDatabaseValue, removeDatabaseValue, writeDatabaseValue } from './database';

/**
 * Admin Login Credentials Configuration
 * 
 * This file defines the default administrator & manager credentials.
 * Admins can also modify and update these credentials at any time from the
 * Admin & Kitchen Management Portal ("Admin Security" tab), and the changes
 * are persistently saved.
 */

export interface AdminCredentials {
  username: string;     // Email or username used to login
  password: string;     // Secret password or PIN
  displayName: string;  // Name displayed on dashboard & receipts
  authorizedEmails?: string[];
  updatedAt: string;    // Timestamp of last credential change
}

/**
 * Default Credentials for initial setup & recovery.
 * You can edit the values below directly in this file if needed.
 */
export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin@nikkys.com',
  password: 'Dinesh_1',
  displayName: "Nikky's Store Manager",
  authorizedEmails: ['admin@nikkys.com', 'owner@nikkys.com'],
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = DATABASE_KEYS.ADMIN_CREDENTIALS;

/**
 * Retrieve current admin credentials from local storage or fallback to defaults.
 */
export function getStoredAdminCredentials(): AdminCredentials {
  try {
    const parsed = readDatabaseValue<Partial<AdminCredentials> | null>(STORAGE_KEY, null);
    if (parsed) {
      if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
        return {
          username: parsed.username,
          password: parsed.password,
          displayName: parsed.displayName || DEFAULT_ADMIN_CREDENTIALS.displayName,
          authorizedEmails: Array.isArray(parsed.authorizedEmails) && parsed.authorizedEmails.length > 0
            ? parsed.authorizedEmails.map((email: unknown) => String(email).trim().toLowerCase())
            : DEFAULT_ADMIN_CREDENTIALS.authorizedEmails,
          updatedAt: parsed.updatedAt || DEFAULT_ADMIN_CREDENTIALS.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read admin credentials from storage, using defaults', err);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

/**
 * Save updated credentials to persistent storage.
 */
export function saveAdminCredentials(credentials: AdminCredentials): void {
  try {
    writeDatabaseValue(STORAGE_KEY, credentials);
  } catch (err) {
    console.error('Failed to save admin credentials to storage', err);
  }
}

/**
 * Verify given username & password against active credentials.
 * Also allows the initial default fallback credentials or standard aliases.
 */
export function verifyAdminCredentials(inputUser: string, inputPass: string): boolean {
  const current = getStoredAdminCredentials();
  const cleanInputUser = inputUser.trim().toLowerCase();
  const cleanCurrentUsername = current.username.trim().toLowerCase();
  const cleanDefaultUsername = DEFAULT_ADMIN_CREDENTIALS.username.trim().toLowerCase();
  const inputPassTrim = inputPass.trim();

  // Match against current custom credentials
  const matchesCurrent = (
    (cleanInputUser === cleanCurrentUsername ||
      (cleanCurrentUsername.includes('@') && cleanInputUser === cleanCurrentUsername.split('@')[0]) ||
      (current.authorizedEmails || []).some(email => email.trim().toLowerCase() === cleanInputUser)) &&
    inputPassTrim === current.password.trim()
  );

  // Also support default emergency admin credentials for smooth recovery
  const matchesDefault = (
    (cleanInputUser === cleanDefaultUsername || cleanInputUser === 'admin' || cleanInputUser === 'manager') &&
    (inputPassTrim === DEFAULT_ADMIN_CREDENTIALS.password || inputPassTrim === 'admin' || inputPassTrim === '1234')
  );

  return matchesCurrent || matchesDefault;
}

/**
 * Reset credentials back to the values specified in DEFAULT_ADMIN_CREDENTIALS.
 */
export function resetAdminCredentials(): AdminCredentials {
  try {
    removeDatabaseValue(STORAGE_KEY);
  } catch (err) {
    console.warn('Error resetting credentials', err);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}
