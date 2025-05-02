import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendEmail } from '../../../../lib/server-utils';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email } = await request.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.resetPasswordToken.create({
    data: {
      token: otp,
      userId: user.id,
      expiresAt,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is ${otp}. It expires in 15 minutes.`,
  });

  return NextResponse.json({ message: 'OTP sent to email' });
}