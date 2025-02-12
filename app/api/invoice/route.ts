// File: app/api/invoice/route.ts
import { createInvoice } from "@/app/invoiceActions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const invoice = await createInvoice(formData);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
