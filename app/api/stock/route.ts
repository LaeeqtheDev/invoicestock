import { NextResponse } from "next/server";
import { StockSchema } from "@/app/utils/zodSchema";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Check if stockBarcode is provided, otherwise throw error
    if (!body.stockBarcode) {
      return new NextResponse(
        JSON.stringify({ message: "Stock barcode is required" }),
        { status: 400 },
      );
    }

    const validationResult = StockSchema.safeParse(body);

    if (!validationResult.success) {
      // Return only the first error message for better readability
      const errorMessage =
        validationResult.error.errors[0]?.message || "Validation failed";
      return new NextResponse(JSON.stringify({ message: errorMessage }), {
        status: 400,
      });
    }

    const stock = await prisma.stock.create({
      data: {
        ...validationResult.data,
        userId: session.user.id,
      },
    });

    return new NextResponse(JSON.stringify(stock), { status: 201 });
  } catch (error) {
    console.error("Error while creating stock:", error); // Log the error for debugging
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await requireUser();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stocks = await prisma.stock.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Error while fetching stocks:", error); // Log the error for debugging
    return new NextResponse("Internal Error", { status: 500 });
  }
}
