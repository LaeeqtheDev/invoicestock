import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { NextRequest, NextResponse } from "next/server";
import { StockSchema } from "@/app/utils/zodSchema";

type Params = Promise<{ stockid: string }>;

// **GET: Fetch stock details**
export async function GET(
  req: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stock = await prisma.stock.findUnique({
      where: {
        id: params.stockid, // Using 'stockid' from URL params
        userId: session.user.id, // Ensuring the stock belongs to the logged-in user
      },
    });

    if (!stock) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(stock); // Returning the stock data as a JSON response
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// **PATCH: Update stock details**
export async function PATCH(
  req: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validationResult = StockSchema.partial().safeParse(body);

    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.errors[0]?.message || "Validation failed";
      return new NextResponse(JSON.stringify({ message: errorMessage }), {
        status: 400,
      });
    }

    const stock = await prisma.stock.update({
      where: {
        id: params.stockid,
        userId: session.user.id,
      },
      data: validationResult.data, // The validated data to update the stock
    });

    return NextResponse.json(stock); // Returning the updated stock as a JSON response
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// **DELETE: Remove stock entry**
export async function DELETE(
  req: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.stock.delete({
      where: {
        id: params.stockid,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 }); // Returning 204 (No Content) status after deletion
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// **PUT: Replace stock entry**
export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const session = await requireUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updatedStock = await prisma.stock.update({
      where: {
        id: params.stockid,
        userId: session.user.id,
      },
      data: body,
    });

    return NextResponse.json(updatedStock, { status: 200 });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
