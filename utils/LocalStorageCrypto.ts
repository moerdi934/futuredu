// src/utils/LocalStorageCrypto.ts
import CryptoJS from 'crypto-js';

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY && typeof window !== 'undefined') {
  console.error('ENCRYPTION_KEY is not defined in environment variables');
}

/**
 * Encrypts data for storage in localStorage
 * @param data Any data that can be JSON stringified
 * @returns Encrypted string
 */
export const encryptData = (data: any): string => {
  try {
    if (!ENCRYPTION_KEY) return JSON.stringify(data);
    
    const dataString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data from localStorage
 * @param encryptedData The encrypted string to decrypt
 * @returns Decrypted data, parsed from JSON
 */
export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    if (!ENCRYPTION_KEY) return JSON.parse(encryptedData) as T;
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedString ? (JSON.parse(decryptedString) as T) : null;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Securely store data in localStorage with encryption
 * @param key localStorage key
 * @param value data to store
 */
export const secureLocalStorage = {
  setItem: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error saving to secureLocalStorage:', error);
    }
  },
  
  getItem: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return decryptData<T>(encryptedValue);
    } catch (error) {
      console.error('Error reading from secureLocalStorage:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};