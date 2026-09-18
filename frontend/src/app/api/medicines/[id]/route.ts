// DELETE /api/medicines/[id] – Delete a medicine (authenticated)
// GET    /api/medicines/[id] – Get a single medicine (authenticated)
// PUT    /api/medicines/[id] – Update a medicine (authenticated)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
      include: { schedules: true },
    });
    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }
    return NextResponse.json(medicine, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("GET /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
  );
}

// PUT: Update a medicine with custom schedule times
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

    const existing = await prisma.medicine.findFirst({
      where: { id, user_id: userId },
      include: { schedules: true },
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
    if (body.schedule_times !== undefined && Array.isArray(body.schedule_times)) {
      // Validate times
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      const validTimes = body.schedule_times.filter((t: string) => timeRegex.test(t));

      // Update existing schedules and create new ones
      const currentTimes = existing.schedules.map((s) => s.time_to_take);
      const timesToAdd = validTimes.filter((t: string) => !currentTimes.includes(t));
      const timesToRemove = currentTimes.filter((t: string) => !validTimes.includes(t));

      await prisma.schedule.deleteMany({
        where: { id: { in: existing.schedules.filter((s) => timesToRemove.includes(s.time_to_take)).map((s) => s.id) } },
      });

      await prisma.schedule.createMany({
        data: timesToAdd.map((time_to_take: string) => ({
          medicine_id: id,
          time_to_take,
          frequency: "Daily",
        })),
        skipDuplicates: true,
      });

      // Update UserSchedule entries
      await prisma.userSchedule.deleteMany({
        where: { medicine_id: id, user_id: userId },
      });

      await prisma.userSchedule.createMany({
        data: validTimes.map((time_to_take: string) => ({
          user_id: userId,
          medicine_id: id,
          name: `${body.name || existing.name} - ${time_to_take}`,
          time_to_take,
          recurrence: "DAILY",
        })),
      });
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data,
      include: { schedules: true },
    });

    // Revalidate caches
    revalidatePath("/dashboard");
    revalidatePath("/medicines");

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
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

    const existing = await prisma.medicine.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    await prisma.schedule.deleteMany({ where: { medicine_id: id } });
    await prisma.userSchedule.deleteMany({ where: { medicine_id: id } });

    await prisma.medicine.delete({
      where: { id },
    });

    // Revalidate caches
    revalidatePath("/dashboard");
    revalidatePath("/medicines");

    return NextResponse.json({ message: "Medicine deleted" }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("DELETE /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete medicine" },
      { status: 500 }
    );
  }
}
