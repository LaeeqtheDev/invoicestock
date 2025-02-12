// src/app/api/notes/route.ts
import { NextResponse } from "next/server";
import {
  fetchNotes,
  createNote,
  updateNoteAPI,
  deleteNoteAPI,
} from "@/app/noteActions";

// GET: Fetch all notes
export async function GET() {
  try {
    const notes = await fetchNotes();
    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = await createNote({
      title: body.title,
      content: body.content,
    });
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing note
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // Expecting { id, title, content } in the request body
    const note = await updateNoteAPI(body.id, {
      title: body.title,
      content: body.content,
    });
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a note
export async function DELETE(request: Request) {
  try {
    const body = await request.json(); // expecting { id }
    await deleteNoteAPI(body.id);
    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
