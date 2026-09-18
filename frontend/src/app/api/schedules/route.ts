// GET /api/schedules - List schedules for the authenticated user
// POST /api/logs - Record a new consumption log with schedule_id

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const LogSchema = z.object({
  medicine_id: z.string(),
  status: z.enum(["Taken", "Missed"]),
  schedule_id: z.string().optional(),  // Optional - link to specific schedule
});

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

// GET: List schedules for the authenticated user, including medicine name
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: { medicine: { user_id: userId } },
      include: { medicine: true },
      orderBy: { time_to_take: "asc" },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET /api/schedules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST: Record a new consumption log (can include schedule_id)
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = LogSchema.parse(body);

    // Verify medicine ownership
    const medicine = await prisma.medicine.findFirst({
      where: { id: parsed.medicine_id, user_id: userId },
    });
    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found or not owned by user" },
        { status: 404 }
      );
    }

    const newLog = await prisma.consumptionLog.create({
      data: {
        user_id: userId,
        medicine_id: parsed.medicine_id,
        status: parsed.status,
        schedule_id: parsed.schedule_id || undefined,
      },
      include: {
        medicine: true,
        schedule: true,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/logs error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid log data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to record log" },
      { status: 500 }
    );
  }
}
