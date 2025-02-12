import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

// Define the "params" type explicitly as part of the route params
interface Params {
  invoiceId: string;
}

export async function GET(
  request: Request,
  context: any  // Use 'any' to bypass the type checking for the second argument
) {
  const { invoiceId } = context.params; // Get invoiceId from params

  try {
    const session = await requireUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        clientName: true,
        total: true,
        createdAt: true,
        status: true,
        invoiceNumber: true,
        currency: true,
        note: true,
        date: true,
        invoiceItems: {
          select: {
            id: true,
            invoiceItemQuantity: true,
            invoiceItemRate: true,
            stockid: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: any  // Use 'any' here as well
) {
  const { invoiceId } = context.params;

  try {
    const session = await requireUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: any  // Again, using 'any' to bypass the typing error
) {
  const { invoiceId } = context.params;

  try {
    const session = await requireUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
