// src/app/todoActions.server.ts
import { parseWithZod } from "@conform-to/zod";
import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import { Todo } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { todoSchema } from "./utils/zodSchema"; // if needed for validation

// Fetch all todos for the authenticated user
export async function fetchTodos(): Promise<Todo[]> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return await prisma.todo.findMany({
    where: { userId: session.user.id },
  });
}

// Create a new todo
export async function createTodo(todoData: {
  title: string;
  content?: string;
  completed?: boolean;
}): Promise<Todo> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  if (!todoData.title) {
    throw new Error("Title is required");
  }
  const todo = await prisma.todo.create({
    data: {
      title: todoData.title,
      content: todoData.content ?? null,
      completed: todoData.completed ?? false,
      userId: session.user.id,
    },
  });
  return todo;
}

// Toggle completed status for a todo
export async function toggleTodoCompleted(
  id: string,
  completed: boolean,
): Promise<Todo> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { completed },
  });
  return updatedTodo;
}

// Delete a todo
export async function deleteTodoAPI(todoId: string): Promise<void> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  await prisma.todo.delete({
    where: { id: todoId },
  });
}
