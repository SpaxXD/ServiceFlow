import crypto from 'crypto';

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function formatDate(date: Date): string {
  return date.toISOString();
}
