// src/app/notesActions.server.ts
import { revalidatePath } from "next/cache";
import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import { Note } from "@prisma/client";

/** Fetch all notes for the authenticated user */
export async function fetchNotes(): Promise<Note[]> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return notes;
}

/** Create a new note */
export async function createNote({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<Note> {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const newNote = await prisma.note.create({
    data: {
      title,
      content,
      userId: session.user.id,
    },
  });

  // Revalidate the home page (or a specific path)
  revalidatePath("/");
  return newNote;
}

/** Update an existing note */
export async function updateNoteAPI(
  noteId: string,
  { title, content }: { title: string; content: string },
): Promise<Note> {
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: { title, content },
  });
  revalidatePath("/");
  return updatedNote;
}

/** Delete a note by ID */
export async function deleteNoteAPI(noteId: string): Promise<void> {
  await prisma.note.delete({
    where: { id: noteId },
  });
  revalidatePath("/");
}
