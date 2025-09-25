import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PASSWORD_CONFIG } from '../utils/constants';

export async function hashMasterPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_ROUNDS);
}

export async function verifyMasterPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createPasswordHash(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashData(data: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

export function createHMAC(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyHMAC(data: string, secret: string, signature: string): boolean {
  const expectedSignature = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}