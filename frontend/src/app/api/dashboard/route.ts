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
    // Single query batch — counts + today's schedule list with medicine names
    const [totalMedicines, criticalStock, nearExpiry, todaySchedules] = await Promise.all([
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
    ]);

    return NextResponse.json({
      totalMedicines,
      criticalStock,
      nearExpiry,
      todaySchedules,
      todayScheduleCount: todaySchedules.length,
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