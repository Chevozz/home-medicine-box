// DELETE /api/medicines/[id] – Delete a medicine (authenticated)
// GET    /api/medicines/[id] – Get a single medicine (authenticated)
// PUT    /api/medicines/[id] – Update a medicine (authenticated)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET: Single medicine
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const medicine = await prisma.medicine.findFirst({
      where: { id, user_id: userId },
    });
    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }
    return NextResponse.json(medicine);
  } catch (error) {
    console.error("GET /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 }
    );
  }
}

// PUT: Update a medicine
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.medicine.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const data: Record<string, any> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.type !== undefined) data.type = body.type;
    if (body.dosage_instructions !== undefined) data.dosage_instructions = body.dosage_instructions;
    if (body.stock_quantity !== undefined) {
      const stock = parseInt(body.stock_quantity, 10);
      if (!Number.isNaN(stock) && stock >= 0) data.stock_quantity = stock;
    }
    if (body.expiry_date !== undefined) {
      const expiry = new Date(body.expiry_date);
      if (!Number.isNaN(expiry.getTime())) data.expiry_date = expiry;
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update medicine", details: [error?.message ?? String(error)] },
      { status: 500 }
    );
  }
}

// DELETE: Remove a medicine
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership before deleting
    const existing = await prisma.medicine.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    await prisma.medicine.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Medicine deleted" });
  } catch (error) {
    console.error("DELETE /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete medicine" },
      { status: 500 }
    );
  }
}