// GET /api/medicines - List all medicines
// POST /api/medicines - Create a new medicine

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// Helper: extract user ID from Authorization header
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

// GET: List all medicines
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const medicines = await prisma.medicine.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(medicines);
  } catch (error) {
    console.error("GET /api/medicines error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

// POST: Create a new medicine
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Field-level validation so the client knows exactly what's wrong.
    const errors: string[] = [];
    if (!body.name || typeof body.name !== "string")
      errors.push("name is required and must be a string");
    if (!body.type || typeof body.type !== "string")
      errors.push("type is required and must be a string");
    if (typeof body.dosage_instructions !== "string")
      errors.push("dosage_instructions must be a string");
    if (body.stock_quantity === undefined || body.stock_quantity === null || body.stock_quantity === "")
      errors.push("stock_quantity is required");
    if (!body.expiry_date) errors.push("expiry_date is required");
    if (errors.length > 0) {
      return NextResponse.json({ error: "Invalid medicine data", details: errors }, { status: 400 });
    }

    // Coerce to the shapes Prisma expects.
    const stock_quantity = parseInt(body.stock_quantity, 10);
    if (Number.isNaN(stock_quantity) || stock_quantity < 0) {
      return NextResponse.json(
        { error: "Invalid medicine data", details: ["stock_quantity must be a non-negative integer"] },
        { status: 400 }
      );
    }

    const expiry = new Date(body.expiry_date);
    if (Number.isNaN(expiry.getTime())) {
      return NextResponse.json(
        { error: "Invalid medicine data", details: ["expiry_date is not a valid date"] },
        { status: 400 }
      );
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        user_id: userId,
        name: body.name,
        type: body.type,
        dosage_instructions: body.dosage_instructions ?? "",
        stock_quantity,
        expiry_date: expiry,
      },
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/medicines error:", error);
    return NextResponse.json(
      { error: "Failed to create medicine", details: [error?.message || String(error)] },
      { status: 500 }
    );
  }
}