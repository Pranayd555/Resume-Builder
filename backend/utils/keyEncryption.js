const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

// Ensure key is 32 bytes
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY)
  .digest(); // 32 bytes

// 🔐 Encrypt
function encrypt(text) {
    if(!text) return '';
  const iv = crypto.randomBytes(16); // unique per encryption

  const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // store iv + encrypted data
  return `${iv.toString('hex')}:${encrypted}`;
}

// 🔓 Decrypt
function decrypt(encryptedText) {
    if(!encryptedText) return '';
  const [ivHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function maskApiKey(apiKey) {
    if(!apiKey) return ''
    const parts = apiKey.split('');
    parts.splice(3, apiKey.length - 5, '*'.repeat(apiKey.length - 5));
    return parts.join('');
    
}

module.exports = { encrypt, decrypt, maskApiKey };