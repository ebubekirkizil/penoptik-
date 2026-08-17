import crypto from 'crypto';

// The encryption key should be exactly 32 bytes (256 bits) for aes-256-gcm.
// In production, this MUST come from an environment variable.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'Xq9!Lm4#Yz1$Kv2*Mw8@En3%Tb7&Rc5+';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a plain text string using AES-256-GCM.
 * @param text The plain text to encrypt.
 * @returns The encrypted text in the format: iv:authTag:encryptedData
 */
export function encryptData(text: string | null | undefined): string | null {
  if (!text) return null;
  if (text.trim() === '') return text;

  // Ensure key is 32 bytes (truncate or pad if necessary for local testing, though prod should be strict)
  const keyBuffer = Buffer.alloc(32);
  Buffer.from(ENCRYPTION_KEY).copy(keyBuffer);

  const iv = crypto.randomBytes(12); // GCM standard IV length
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a previously encrypted string.
 * @param encryptedText The encrypted string in the format: iv:authTag:encryptedData
 * @returns The decrypted plain text.
 */
export function decryptData(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;
  
  // If it doesn't look like our encrypted format, return as is (for backwards compatibility/raw data)
  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText;

  try {
    const keyBuffer = Buffer.alloc(32);
    Buffer.from(ENCRYPTION_KEY).copy(keyBuffer);

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Don't expose partial/failed data
  }
}

/**
 * Creates a deterministic hash for blind indexing (searching encrypted fields).
 * @param text The text to hash (e.g., phone number)
 * @returns SHA-256 hash of the normalized text
 */
export function createBlindIndex(text: string | null | undefined): string | null {
  if (!text) return null;
  
  const keyBuffer = Buffer.alloc(32);
  Buffer.from(ENCRYPTION_KEY).copy(keyBuffer);

  // Normalize: lowercase and remove spaces so "555 123" matches "555123"
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  
  return crypto.createHmac('sha256', keyBuffer).update(normalized).digest('hex');
}
