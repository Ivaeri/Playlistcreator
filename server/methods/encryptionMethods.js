const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const encryptionSecret = process.env.ENCRYPTION_SECRET;

if (!encryptionSecret) {
  console.log(encryptionSecret);
  throw new Error("ENCRYPTION_SECRET is not defined in the environment variables");
}

const key = crypto.scryptSync(encryptionSecret, 'salt', 32);
const iv = crypto.randomBytes(16);

function encryptToken(token) {
  if (!token) return null;
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedToken) {
  if (!encryptedToken) return null;
  const [ivHex, encrypted] = encryptedToken.split(':');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encryptToken,
  decryptToken,
};