import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma.js';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'RESIDENT';
  condominiumId: string;
};

const secret = () => process.env.JWT_SECRET ?? 'change-me-in-production';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret(), { expiresIn: '8h' });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, secret()) as AuthUser;
}

export async function authenticate(authorization?: string): Promise<AuthUser | null> {
  if (!authorization?.startsWith('Bearer ')) return null;
  try {
    const payload = verifyToken(authorization.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, condominiumId: user.condominiumId };
  } catch {
    return null;
  }
}
