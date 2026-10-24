/**
 * Godly OS Browser Session & Cookie Sync Utility
 * Encrypts and decrypts browser bookmarks, history, and active sessions
 * using AES-256-GCM via the Web Crypto API.
 */

export interface BrowserSyncData {
  version: number;
  timestamp: number;
  bookmarks: Array<{ id: string; title: string; url: string; favicon?: string; folder?: string }>;
  history: Array<{ id: string; title: string; url: string; visitedAt: number }>;
  cookies?: Array<{ name: string; value: string; domain?: string; path?: string }>;
  storage?: Record<string, string>;
}

// Convert string to ArrayBuffer
function str2ab(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Derive AES-GCM 256 key from passphrase + salt using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    str2ab(passphrase) as unknown as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts session data using AES-256-GCM with a user-supplied passphrase.
 * Returns a base64 string combining salt (16 bytes) + IV (12 bytes) + ciphertext.
 */
export async function encryptSessionData(data: BrowserSyncData, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const jsonString = JSON.stringify(data);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    str2ab(jsonString) as unknown as BufferSource
  );

  // Combine [salt (16b)] + [iv (12b)] + [encrypted data]
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return base64 string
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Decrypts session data from an encrypted base64 string using the passphrase.
 */
export async function decryptSessionData(encryptedBase64: string, passphrase: string): Promise<BrowserSyncData> {
  const binary = atob(encryptedBase64.trim());
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  if (combined.length < 28) {
    throw new Error('Invalid encrypted package payload');
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext as unknown as BufferSource
  );

  const jsonString = ab2str(decrypted);
  return JSON.parse(jsonString) as BrowserSyncData;
}
