// app/api/business/route.ts

import { NextResponse } from "next/server";
import { createBusinessSchema } from "@/app/utils/zodSchema";
// adjust the path if needed
import { requireUser } from "@/app/utils/hooks";
import prisma from "@/app/utils/db";

// implement or adjust your session logic

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the client
    const body = await request.json();

    // Validate the incoming data using Zod
    const parseResult = createBusinessSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    // Get the current user session
    const session = await requireUser();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Create the business in the database
    const business = await prisma.business.create({
      data: {
        ...parseResult.data,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, business });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get the current user session
    const session = await requireUser();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the Business model for the business associated with the current user.
    // Use the select option to explicitly return only the desired fields.
    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        businessType: true,
        businessName: true,
        businessAddress: true,
        businessPhone: true,
        businessEmail: true,
        businessEIN: true,
        businessVAT: true,
        businessLogo: true,
        returnPolicy: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
