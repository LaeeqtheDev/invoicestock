// File: app/api/invoice/return/[invoiceId]/route.ts

import {
  returnInvoiceAction,
  InvoiceReturnData,
} from "@/app/invoiceReturnAction";
import { NextResponse } from "next/server";

type Params = Promise<{ invoiceId: string }>;

export async function PATCH(
  request: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const { invoiceId } = params; // Extract invoiceId

    const body = await request.json();
    // Here, body should match the InvoiceReturnData interface.
    // (Optionally, validate using Zod here.)

    const updatedInvoice = await returnInvoiceAction(
      invoiceId,
      body as InvoiceReturnData
    );

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
