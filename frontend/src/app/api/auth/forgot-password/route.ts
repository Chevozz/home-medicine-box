// POST /api/auth/forgot-password
// Request password reset - generates token and sends email via Gmail SMTP

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

interface ForgotPasswordPayload {
  email?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordPayload;
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user - always return success for security (don't reveal if email exists)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success response for security
    const successMessage =
      "Jika email terdaftar, instruksi reset telah dikirim ke email Anda.";

    if (!user) {
      return NextResponse.json({ message: successMessage });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendResetEmail(email: string, resetUrl: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("EMAIL_USER or EMAIL_PASS not configured. Skipping email send.");
    // Fallback: log reset URL for development
    console.log("DEV MODE - Reset URL:", resetUrl);
    return;
  }

  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify connection (optional but good for debugging)
    await transporter.verify();
    console.log("SMTP connection verified");

    await transporter.sendMail({
      from: `"MedTracker" <${emailUser}>`,
      to: email,
      subject: "Reset Password MedTracker",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">Reset Password MedTracker</h1>
          <p>Anda meminta untuk mereset password akun Anda.</p>
          <p>Klik tombol di bawah ini untuk membuat password baru (berlaku 15 menit):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #059669; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Jika Anda tidak meminta ini, abaikan email ini. Link akan kedaluwarsa dalam 15 menit.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">MedTracker - Home Medicine Tracker</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    // Don't throw - email failure shouldn't break the flow
  }
}