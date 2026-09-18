// GET /api/dashboard - Aggregate stats for the authenticated user
// Returns: totalMedicines, todaySchedule (count + list), criticalStock, nearExpiry

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get today's date range (00:00:00 to 23:59:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Single query batch — counts + today's schedule list with medicine names
    const [totalMedicines, criticalStock, nearExpiry, todaySchedules, todayLogs] = await Promise.all([
      prisma.medicine.count({ where: { user_id: userId } }),
      prisma.medicine.count({
        where: { user_id: userId, stock_quantity: { lte: 2 } },
      }),
      prisma.medicine.count({
        where: {
          user_id: userId,
          expiry_date: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 86400000),
          },
        },
      }),
      prisma.schedule.findMany({
        where: { medicine: { user_id: userId } },
        include: { medicine: true },
        orderBy: { time_to_take: "asc" },
      }),
      prisma.consumptionLog.findMany({
        where: {
          user_id: userId,
          consumed_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: { schedule_id: true, status: true },
      }),
    ]);

    // Filter today's schedules: only show schedules that haven't been taken yet
    // Skip if already taken today
    const takenScheduleIds = todayLogs
      .filter(log => log.status === "Taken")
      .map(log => log.schedule_id);

    const todaysSchedule = todaySchedules.filter((s) => {
      // Only show schedules for hours 06:00 to 22:00
      const h = parseInt(s.time_to_take.slice(0, 2), 10);
      if (h < 6 || h > 22) return false;
      // Skip if already taken today
      if (takenScheduleIds.includes(s.id)) return false;
      return true;
    });

    return NextResponse.json({
      totalMedicines,
      criticalStock,
      nearExpiry,
      todaySchedules: todaysSchedule,
      todayScheduleCount: todaysSchedule.length,
    }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  }
}

export function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
  );
}