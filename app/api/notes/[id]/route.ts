import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

type Params = Promise<{ id: string }>;

export async function DELETE(
  request: Request,
  context: { params: Params }
) {
  try {
    const params = await context.params; // Await params due to async changes
    const { id } = params; // Extract note ID

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete the note" },
      { status: 500 }
    );
  }
}
