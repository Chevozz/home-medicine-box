// POST /api/auth/reset-password
// Execute password reset - verify token and update password

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ResetPasswordPayload {
  token?: string;
  newPassword?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPasswordPayload;
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    return NextResponse.json({
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}