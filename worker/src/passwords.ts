import { Buffer } from 'node:buffer';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { beijingNow } from '@simcare/shared';
import { check, token } from './core';
export const passwordSchema = z
  .string()
  .min(8, '密码至少需要 8 个字符')
  .max(64, '密码最多 64 个字符');
const parameters = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 };
const prefix = 'scrypt:16384:8:5';
async function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 32, parameters, (error, key) => (error ? reject(error) : resolve(key))),
  );
}
export async function encodePassword(password: string) {
  const salt = token();
  const key = await derive(password, salt);
  return (
    prefix + ':' + salt + ':' + Array.from(key, (b) => b.toString(16).padStart(2, '0')).join('')
  );
}
export async function verifyPassword(password: string, encoded?: string) {
  const parts = (encoded ?? '').split(':');
  const valid =
    parts.length === 6 &&
    parts.slice(0, 4).join(':') === prefix &&
    /^[a-f0-9]{64}$/.test(parts[4] ?? '') &&
    /^[a-f0-9]{64}$/.test(parts[5] ?? '');
  const actual = await derive(password, valid ? parts[4]! : '0'.repeat(64));
  return valid && timingSafeEqual(actual, Buffer.from(parts[5]!, 'hex'));
}
export type Credential = { encoded: string; version: string };
export async function credential(db: D1Database, userId: string) {
  return db
    .prepare('SELECT encoded,version FROM password_credentials WHERE user_id=?')
    .bind(userId)
    .first<Credential>();
}
export function credentialCheck(db: D1Database, userId: string, version: string) {
  return check(db, 'EXISTS(SELECT 1 FROM password_credentials WHERE user_id=? AND version=?)', [
    userId,
    version,
  ]);
}
export function putPassword(db: D1Database, userId: string, encoded: string) {
  return db
    .prepare(
      'INSERT INTO password_credentials(user_id,encoded,version,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET encoded=excluded.encoded,version=excluded.version,updated_at=excluded.updated_at',
    )
    .bind(userId, encoded, crypto.randomUUID(), beijingNow());
}
