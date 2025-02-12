// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import {
  fetchTodos,
  createTodo,
  toggleTodoCompleted,
  deleteTodoAPI,
} from "@/app/todoActions";

export async function GET() {
  try {
    const todos = await fetchTodos();
    return NextResponse.json({ todos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const todo = await createTodo(body);
    return NextResponse.json({ todo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // Assuming body contains { id, completed }
    const todo = await toggleTodoCompleted(body.id, body.completed);
    return NextResponse.json({ todo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteTodoAPI(id);
    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
