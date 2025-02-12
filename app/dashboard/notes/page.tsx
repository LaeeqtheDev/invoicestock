"use client";

import { useState, useEffect } from "react";
import { Note } from "@prisma/client";
import { ListTodo } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNoteData, setNewNoteData] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch notes from the API when the page loads
  useEffect(() => {
    const fetchAllNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notes");
        if (!res.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await res.json();
        setNotes(data.notes.reverse());
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        alert("An error occurred while fetching notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotes();
  }, []);

  // Handle input change for the new note form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewNoteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add a new note via the API
  const addNewNote = async () => {
    if (!newNoteData.title) {
      alert("Title is required!");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNoteData),
      });
      if (!res.ok) {
        throw new Error("Failed to create note");
      }
      const data = await res.json();
      setNotes((prevNotes) => [data.note, ...prevNotes]);
      setIsCreating(false);
      setNewNoteData({ title: "", content: "" });
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("An error occurred while creating the note.");
    }
  };

  // Delete a note via the API
  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete note");
      }
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("An error occurred while deleting the note.");
    }
  };

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Notes</CardTitle>
              <CardDescription>
                Manage your{" "}
                <span className="text-green-500 font-semibold">Notes</span>{" "}
                right here
              </CardDescription>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className={buttonVariants()}
            >
              <span className="font-semibold flex gap-2 items-center">
                <ListTodo size={20} />
                Create New Note
              </span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {isCreating && (
            <div className="create-note-form mt-6 space-y-4">
              <h2 className="text-xl font-semibold">Note</h2>
              <input
                type="text"
                name="title"
                value={newNoteData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                name="content"
                value={newNoteData.content}
                onChange={handleInputChange}
                placeholder="Enter note content"
                className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addNewNote}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                Add Note
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-center mt-6">Loading notes...</p>
          ) : (
            <div className="notes-list mt-6 space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="note-item p-4 border rounded-md border-gray-300 shadow-md"
                >
                  <div className="note-header flex justify-between items-center">
                    <div className="note-title flex-1 gap-4 ml-3 flex">
                      <h2 className="text-lg font-bold">{note.title}</h2>
                    </div>
                    <div className="delete-icon items-center mt-2">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="note-content mt-2">
                    <p className="ml-3">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesPage;
