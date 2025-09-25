import crypto from 'crypto';
import { ENCRYPTION_CONFIG } from '../utils/constants';
import type { EncryptionResult, DecryptionParams } from '../types';

export function generateEncryptionKey(masterPassword: string, salt: string): string {
  return crypto.pbkdf2Sync(
    masterPassword,
    salt,
    100000,
    ENCRYPTION_CONFIG.KEY_LENGTH,
    'sha256'
  ).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH).toString('hex');
}

export function generateIV(): string {
  return crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH).toString('hex');
}

export function encrypt(plaintext: string, key: string): EncryptionResult {
  const iv = generateIV();
  const cipher = crypto.createCipher(ENCRYPTION_CONFIG.ALGORITHM, key);
  cipher.setAutoPadding(true);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv
  };
}

export function decrypt({ encrypted, iv, key }: DecryptionParams): string {
  const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.ALGORITHM, key);
  decipher.setAutoPadding(true);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encryptPassword(password: string, masterPassword: string, salt: string): EncryptionResult {
  const key = generateEncryptionKey(masterPassword, salt);
  return encrypt(password, key);
}

export function decryptPassword(
  encryptedPassword: string, 
  iv: string, 
  masterPassword: string, 
  salt: string
): string {
  const key = generateEncryptionKey(masterPassword, salt);
  return decrypt({
    encrypted: encryptedPassword,
    iv,
    key
  });
}

export function secureRandom(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}