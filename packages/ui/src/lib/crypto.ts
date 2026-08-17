// @ts-nocheck
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Uygulama genelinde kullanılacak gizli anahtar (Environment'tan alınmalı)
// Şimdilik .env'de tanımlanmadığı durumlarda geçici bir fallback kullanılıyor (Gerçek prod ortamında mutlaka .env kullanılmalıdır!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "sentientwire-global-secure-key-32";

/**
 * Verilen düz metni AES-256-GCM kullanarak kriptolar.
 * @param text Şifrelenecek düz metin (Örn: API Key, VKN)
 * @returns Kriptolanmış metin (Hex formatında)
 */
export function encrypt(text: string): string {
  // Gelişmiş güvenlik için her şifrelemede rastgele bir IV (Initialization Vector) üretilir
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Anahtarın her zaman tam 32 byte olmasını garanti ediyoruz (AES-256 için)
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

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

    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decrypt error:", error);
    throw new Error("Veri çözme işlemi başarısız. Güvenlik anahtarı değişmiş veya veri bozulmuş olabilir.");
  }
}
