import { NextResponse } from "next/server";
import { requireUser } from "./utils/hooks";
import prisma from "./utils/db";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query the Business model for the business associated with the current user.
  const business = await prisma.business.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  return NextResponse.json(business);
}
