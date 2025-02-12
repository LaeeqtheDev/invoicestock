"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

type Params = Promise<{ invoiceId: string }>;

export async function PATCH(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params since it's now a promise
    const { invoiceId } = params; // Extract invoiceId

    const session = await requireUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the invoice status to "PAID"
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
