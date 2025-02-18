import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import {
 
  invoiceSchema,
  onboardingSchema,
  StockSchema,
} from "./utils/zodSchema";
import { Todo } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Create the Invoice first
  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: new Date(submission.value.date),

      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
      invoiceItems: {
        create: submission.value.invoiceItems.map((item: any) => ({
          stockid: item.stockid,
          invoiceItemQuantity: item.invoiceItemQuantity,
          invoiceItemRate: item.invoiceItemRate,
        })),
      },
    },
  });

  // Update stock quantities and create invoice items…
  const invoiceItemsData = submission.value.invoiceItems.map(
    async (item: any) => {
      await prisma.stock.update({
        where: { id: item.stockid },
        data: {
          quantity: {
            decrement: item.invoiceItemQuantity,
          },
        },
      });
      return prisma.invoiceItem.create({
        data: {
          invoiceId: data.id,
          stockid: item.stockid,
          invoiceItemQuantity: item.invoiceItemQuantity,
          invoiceItemRate: item.invoiceItemRate,
        },
      });
    },
  );
  await Promise.all(invoiceItemsData);

  // Send email with invoice details

  // If printInvoice is set, redirect with a query param so the invoice list can trigger printing.
  if (formData.get("CreateInvoice")) {
    return redirect(`/dashboard/invoices?printInvoice=true&id=${data.id}`);
  }
  return redirect("/dashboard/invoices");
}

export async function createStock(prevState: any, formData: FormData) {
  const session = await requireUser();

  if (!session.user?.id) {
    throw new Error("User ID is required");
  }

  // Make sure your StockSchema includes:
  // stockImage: z.string().optional()
  const submission = parseWithZod(formData, {
    schema: StockSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.stock.create({
    data: {
      id: submission.value.id,
      stockBarcode: submission.value.stockBarcode,
      stockName: submission.value.stockName,
      category: submission.value.category,
      subCategory: submission.value.subCategory,
      status: submission.value.status,
      quantity: submission.value.quantity,
      stockRate: submission.value.stockRate,
      sellingRate: submission.value.sellingRate,
      supplier: submission.value.supplier,
      purchaseDate: submission.value.purchaseDate,
      expiryDate: submission.value.expiryDate,
      stockLocation: submission.value.stockLocation,
      discountAllowed: submission.value.discountAllowed,
      VAT: submission.value.VAT,
      SKU: submission.value.SKU,
      // **Include the image URL here:**
      stockImage: submission.value.stockImage,
      userId: session.user.id,
    },
  });

  return { success: true, data };
}

// Fetch todos for the authenticated user

export async function fetchTodos() {
  // Your fetch logic here
  const session = await requireUser(); // Ensure user is authenticated
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  // Fetch todos for the authenticated user
  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
    },
  });
  /// Return the todos
  return todos;
}
// Create a new todo
export async function createTodo(todoData: {
  title: string;
  content?: string;
  completed?: boolean;
}): Promise<Todo> {
  const session = await requireUser(); // Ensure user is authenticated
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  if (!todoData.title) {
    throw new Error("Title is required");
  }

  try {
    const todo = await prisma.todo.create({
      data: {
        title: todoData.title,
        content: todoData.content ?? null,
        completed: todoData.completed ?? false,
        userId: session.user.id, // Associate the todo with the authenticated user
      },
    });

    return todo;
  } catch (error) {
    console.error("Error saving todo:", error);
    throw new Error("Failed to save the todo");
  }
}

// Toggle completed status for a todo
export async function toggleTodoCompleted(
  id: string,
  completed: boolean,
): Promise<Todo> {
  const session = await requireUser(); // Ensure user is authenticated
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { completed },
    });

    return updatedTodo;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw new Error("Failed to update todo");
  }
}

// Delete a todo
export async function deleteTodoAPI(todoId: string): Promise<void> {
  const session = await requireUser(); // Ensure user is authenticated
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw new Error("Failed to delete todo");
  }
}

// Fetch all notes
export const fetchNotes = async () => {
  try {
    const session = await requireUser(); // Get the authenticated user
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const notes = await prisma.note.findMany({
      where: { userId: session.user.id }, // Fetch notes for the authenticated user
      orderBy: { createdAt: "desc" }, // Order by creation date
    });

    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Failed to fetch notes.");
  }
};
// Create a new note
export const createNote = async ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  try {
    const session = await requireUser(); // Get the authenticated user
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        userId: session.user.id, // Assign the userId properly
      },
    });
    revalidatePath("/"); // Revalidate the home page
    return newNote;
  } catch (error) {
    console.error("Error creating note:", error);
    throw new Error("Failed to create note.");
  }
};

// Update an existing note
export const updateNoteAPI = async (
  noteId: string,
  { title, content }: { title: string; content: string },
) => {
  try {
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { title, content },
    });
    revalidatePath("/");
    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note.");
  }
};

// Delete a note
export const deleteNoteAPI = async (noteId: string) => {
  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note.");
  }
};
export async function onboardUser(formData: FormData): Promise<void> {
  // Get the authenticated session (and user ID)
  const session = await requireUser();

  // Validate the incoming form data using your Zod schema
  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    // Use submission.error to indicate what went wrong with the data
    throw new Error("Invalid form data: " + JSON.stringify(submission.error));
  }

  // Update the user record with the onboarding details
  await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      firstName: submission.value.firstName,
      secondName: submission.value.secondName,
      address: submission.value.address,
    },
  });

  // Redirect the user to the dashboard upon successful update
  redirect("/dashboard");
}
