// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { getDashboardData } from "@/app/dashboardactions";
import { requireUser } from "@/app/utils/hooks";

export async function GET(request: Request) {
  const session = await requireUser();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const data = await getDashboardData(userId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching dashboard data" },
      { status: 500 },
    );
  }
}
