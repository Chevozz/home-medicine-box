// POST /api/auth/signup
// Register a new user (name, email, password)

import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface SignupPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;
    const { name, email, password } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password & persist
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password_hash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(
      { message: "User registered", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
