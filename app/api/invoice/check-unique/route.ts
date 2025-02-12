// File: app/api/invoice/check-unique/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceNumber = searchParams.get("invoiceNumber");
  if (!invoiceNumber) {
    return NextResponse.json(
      { error: "Missing invoiceNumber" },
      { status: 400 },
    );
  }

  try {
    // Check if an invoice with this number already exists.
    const existing = await prisma.invoice.findFirst({
      where: { invoiceNumber: Number(invoiceNumber) },
    });
    return NextResponse.json({ unique: existing ? false : true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
