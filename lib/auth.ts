import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}