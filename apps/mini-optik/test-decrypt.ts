
const crypto = require('crypto');
function decrypt(text, keyString) {
  try {
    const cachedKey = crypto.scryptSync(keyString, 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', cachedKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return 'ERROR: ' + error.message;
  }
}
const testString = 'f5f6d2eee6a472d4c0d8f812de4844b:855e13da0707:4a3267c5934749c6b0c1f3ad39ab1b70';
console.log('Decrypt with Vercel Key:', decrypt(testString, 'sentientwire-global-secure-key-32'));
console.log('Decrypt with Local Key:', decrypt(testString, 'a0a0129feac5efe9ba63694f830fd4edafa9a265472046fc93402177301cf911'));

