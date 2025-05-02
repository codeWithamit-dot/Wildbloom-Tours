import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { userId, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await prisma.resetPasswordToken.deleteMany({ where: { userId } });

  return NextResponse.json({ message: 'Password reset successfully' });
}