// GET /api/logs - List consumption logs for the authenticated user
// POST /api/logs - Record a new consumption log

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

console.log("[Route Handler] /api/logs route loaded");

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

// GET: List logs for the authenticated user
export async function GET(request: Request) {
  console.log("[Route Handler] GET /api/logs called");
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.consumptionLog.findMany({
      where: { user_id: userId },
      include: { medicine: true, schedule: true },
      orderBy: { consumed_at: "desc" },
    });
    return NextResponse.json(logs, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
  );
}

// POST: Record a new consumption log
export async function POST(request: Request) {
  console.log("[Route Handler] POST /api/logs called");
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    console.log("[Route Handler] No user found in token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("[Route Handler] POST /api/logs body:", body);

    const { medicine_id, status, schedule_id } = body;

    // Basic validation
    if (!medicine_id || typeof medicine_id !== "string") {
      console.log("[Route Handler] Invalid medicine_id:", medicine_id);
      return NextResponse.json({ error: "medicine_id is required and must be a string" }, { status: 400 });
    }
    if (status !== "Taken" && status !== "Missed") {
      console.log("[Route Handler] Invalid status:", status);
      return NextResponse.json({ error: "status must be 'Taken' or 'Missed'" }, { status: 400 });
    }

    // Find medicine to verify ownership
    const medicine = await prisma.medicine.findFirst({
      where: { id: medicine_id, user_id: userId },
    });

    if (!medicine) {
      console.error("[Route Handler] Medicine not found or not owned:", medicine_id);
      return NextResponse.json(
        { error: "Medicine not found or not owned by user" },
        { status: 404 }
      );
    }

    // If schedule_id provided, verify it belongs to this medicine
    let finalScheduleId: string | null = null;
    if (schedule_id) {
      const schedule = await prisma.schedule.findFirst({
        where: { id: schedule_id, medicine_id: medicine_id },
      });
      if (schedule) {
        finalScheduleId = schedule.id;
        console.log("[Route Handler] Found schedule:", schedule.id);
      } else {
        console.log("[Route Handler] Schedule not found, creating log without schedule_id");
      }
    }

    // Use transaction to ensure atomicity: create log + decrement stock (if Taken)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create consumption log
      const newLog = await tx.consumptionLog.create({
        data: {
          user_id: userId,
          medicine_id: medicine_id,
          status: status,
          schedule_id: finalScheduleId,
        },
        include: {
          medicine: true,
          schedule: true,
        },
      });

      // 2. If status is "Taken", decrement stock_quantity atomically
      if (status === "Taken") {
        const updatedMedicine = await tx.medicine.update({
          where: { id: medicine_id },
          data: {
            stock_quantity: { decrement: 1 },
          },
        });
        console.log("[Route Handler] Stock decremented:", updatedMedicine.name, "new stock:", updatedMedicine.stock_quantity);
      }

      return newLog;
    });

    console.log("[Route Handler] Log created:", result.id);

    // Revalidate caches for all affected pages
    revalidatePath("/history");
    revalidatePath("/dashboard");
    revalidatePath("/medicines");

    return NextResponse.json(
      { success: true, message: "Log recorded", log: result },
      { status: 201, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  } catch (error: any) {
    console.error("[Route Handler] POST /api/logs error:", error);
    console.error("[Route Handler] Stack trace:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to record consumption log" },
      { status: 500 }
    );
  }
}