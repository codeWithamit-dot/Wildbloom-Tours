import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  const { email, otp } = await request.json();
  const token = await prisma.resetPasswordToken.findFirst({
    where: { token: otp, user: { email }, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  if (!token) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  return NextResponse.json({ message: 'OTP verified', userId: token.userId });
}