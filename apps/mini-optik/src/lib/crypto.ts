// @ts-nocheck
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === "production") {
    console.warn("WARNING: ENCRYPTION_KEY environment variable is missing in production!");
  }
}

// Dev fallback if missing
const ACTIVE_KEY = ENCRYPTION_KEY || "sentientwire-global-secure-key-32";

let cachedKey: Buffer | null = null;
function getDerivedKey(): Buffer {
  if (!cachedKey) {
    cachedKey = crypto.scryptSync(ACTIVE_KEY, "salt", 32);
  }
  return cachedKey;
}

/**
 * Verilen düz metni AES-256-GCM kullanarak kriptolar.
 * @param text Şifrelenecek düz metin (Örn: API Key, VKN)
 * @returns Kriptolanmış metin (Hex formatında)
 */
export function encrypt(text: string): string {
  // Gelişmiş güvenlik için her şifrelemede rastgele bir IV (Initialization Vector) üretilir
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Anahtarın her zaman tam 32 byte olmasını garanti ediyoruz (AES-256 için)
  const key = getDerivedKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Şifrelenmiş veriyi, IV ve doğrulama etiketiyle (AuthTag) birlikte saklıyoruz
  return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

/**
 * Kriptolanmış metni AES-256-GCM kullanarak çözer ve düz metni döndürür.
 * @param text Kriptolanmış metin
 * @returns Çözülmüş düz metin
 */
export function decrypt(text: string): string {
  try {
    const parts = text.split(":");
    if (parts.length !== 3) {
      throw new Error("Geçersiz şifreli metin formatı.");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    const tryDecrypt = (keyBuffer: Buffer) => {
      const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    };

    try {
      return tryDecrypt(getDerivedKey());
    } catch (primaryError) {
      // Fallback: If decryption fails with the primary key, it might have been encrypted 
      // with the Vercel fallback key (if ENCRYPTION_KEY was missing in prod) or vice versa.
      // We try the default fallback key to ensure data is not permanently locked out.
      const FALLBACK_KEY = "sentientwire-global-secure-key-32";
      if (ACTIVE_KEY !== FALLBACK_KEY) {
        try {
          const fallbackKeyBuffer = crypto.scryptSync(FALLBACK_KEY, "salt", 32);
          return tryDecrypt(fallbackKeyBuffer);
        } catch (fallbackError) {
          throw primaryError; // Throw the original error if fallback also fails
        }
      }
      throw primaryError;
    }
  } catch (error) {
    // console.error("Decrypt error:", error); // Devre dışı bırakıldı log kirliliği için
    // Modified to return the original text if decryption fails, helpful during transition phase
    // where some DB entries are plain text and some are encrypted
    return text;
  }
}

/**
 * Creates a deterministic hash for a string to be used as a Blind Index.
 * @param text Düz metin
 * @returns SHA-256 hash
 */
export function createBlindIndex(text: string | null | undefined): string | null {
  if (!text) return null;
  
  try {
    let BLIND_INDEX_SALT = process.env.BLIND_INDEX_SALT;
    if (!BLIND_INDEX_SALT) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BLIND_INDEX_SALT environment variable is missing in production!");
      }
      BLIND_INDEX_SALT = "pen-optik-salt-1234";
    }
    // Normalize text (lowercase, trim) to make search more robust
    const normalized = text.toLowerCase().trim();
    
    const hmac = crypto.createHmac("sha256", BLIND_INDEX_SALT);
    hmac.update(normalized);
    return hmac.digest("hex");
  } catch (error) {
    console.error("Hash error:", error);
    return null;
  }
}
