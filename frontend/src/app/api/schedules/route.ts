// GET /api/schedules - List all schedules
// POST /api/schedules - Create a new schedule

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ScheduleSchema = z.object({
  medicine_id: z.string(),
  time_to_take: z.string().min(1), // Format HH:mm
  frequency: z.string().min(1), // Daily, Weekly, etc.
});

export const dynamic = "force-dynamic";

// GET: List all schedules
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
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
  try {
    const body = await request.json();
    const parsed = ScheduleSchema.parse(body);

    const newSchedule = await prisma.schedule.create({
      data: parsed,
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
