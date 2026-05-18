import { createHmac, timingSafeEqual } from 'node:crypto';

export type DemoTokenPayload = {
  sub: string;
  role: 'SELLER' | 'ADMIN';
  exp: number;
};

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be set to a string of at least 16 characters in production.');
  }
  return 'kvytech-demo-dev-secret-change-me';
}

function signPayload(payloadJson: string): string {
  return createHmac('sha256', getSecret()).update(payloadJson).digest('hex');
}

export function signDemoToken(sub: string, role: 'SELLER' | 'ADMIN'): string {
  const payload: DemoTokenPayload = {
    sub,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadJson = JSON.stringify(payload);
  const sig = signPayload(payloadJson);
  return Buffer.from(payloadJson, 'utf8').toString('base64url') + '.' + sig;
}

export function verifyDemoToken(token: string): DemoTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = signPayload(payloadJson);
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload: DemoTokenPayload;
  try {
    payload = JSON.parse(payloadJson) as DemoTokenPayload;
  } catch {
    return null;
  }
  if (typeof payload.sub !== 'string' || (payload.role !== 'SELLER' && payload.role !== 'ADMIN')) {
    return null;
  }
  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
  return payload;
}

export function getDemoPassword(): string {
  return process.env.DEMO_AUTH_PASSWORD ?? 'demo';
}
