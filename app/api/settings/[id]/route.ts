// File: app/api/settings/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

// Define the Zod schema for the settings data.
const settingsSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required" }),
  businessAddress: z.string().min(1, { message: "Business address is required" }),
  businessEmail: z.string().email({ message: "Must be a valid email address" }),
  businessEIN: z.string().min(1, { message: "Business EIN is required" }),
  businessVAT: z.string().min(1, { message: "Business VAT is required" }),
});

type Params = Promise<{ id: string }>;

// **GET: Return business settings for the given ID if the current user owns it.**
export async function GET(
  request: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the business that belongs to the current user with the given ID.
    const business = await prisma.business.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
      select: {
        businessName: true,
        businessAddress: true,
        businessEmail: true,
        businessEIN: true,
        businessVAT: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// **PATCH: Update the business settings for the given ID.**
export async function PATCH(
  request: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const updatedBusiness = await prisma.business.update({
      where: { id: params.id },
      data: {
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        businessEmail: data.businessEmail,
        businessEIN: data.businessEIN,
        businessVAT: data.businessVAT,
      },
    });

    return NextResponse.json({ success: true, business: updatedBusiness });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
