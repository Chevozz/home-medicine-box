// GET /api/medicines - List all medicines
// POST /api/medicines - Create a new medicine

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MedicineSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1),
  type: z.string().min(1),
  dosage_instructions: z.string(),
  stock_quantity: z.number().int().nonnegative(),
  expiry_date: z.string().datetime(),
});

export const dynamic = "force-dynamic";

// GET: List all medicines
export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
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
  try {
    const body = await request.json();
    const parsed = MedicineSchema.parse(body);

    const newMedicine = await prisma.medicine.create({
      data: parsed,
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/medicines error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid medicine data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    );
  }
}
