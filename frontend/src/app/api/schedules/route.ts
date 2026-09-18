// GET /api/schedules - List schedules for the authenticated user
// POST /api/schedules - Create a new schedule

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const ScheduleSchema = z.object({
  medicine_id: z.string(),
  time_to_take: z.string().min(1), // Format HH:mm
  frequency: z.string().min(1),    // Daily, Weekly, etc.
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
      orderBy: { created_at: "desc" },
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

// POST: Create a new schedule
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ScheduleSchema.parse(body);

    // Verify medicine ownership before creating schedule
    const medicine = await prisma.medicine.findFirst({
      where: { id: parsed.medicine_id, user_id: userId },
    });
    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found or not owned by user" },
        { status: 404 }
      );
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        medicine_id: parsed.medicine_id,
        time_to_take: parsed.time_to_take,
        frequency: parsed.frequency,
      },
      include: { medicine: true },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/schedules error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid schedule data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
