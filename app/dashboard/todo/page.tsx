"use client";

import { useState, useEffect } from "react";
import { Todo } from "@prisma/client";
import { ListTodo } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTodoData, setNewTodoData] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch todos from API when the page loads
  useEffect(() => {
    const fetchAllTodos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/todo");
        const contentType = res.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Received non-JSON response:", text);
          throw new Error("Non-JSON response received");
        }
        const data = await res.json();
        setTodos(data.todos.reverse());
      } catch (error) {
        console.error("Failed to fetch todos:", error);
        alert("An error occurred while fetching todos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTodos();
  }, []);

  // Handle input changes for new todo
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewTodoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add a new todo via API
  const addNewTodo = async () => {
    if (!newTodoData.title) {
      alert("Title is required!");
      return;
    }

    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodoData),
      });
      const data = await res.json();
      setTodos((prevTodos) => [data.todo, ...prevTodos]);
      setIsCreating(false);
      setNewTodoData({ title: "", content: "" });
    } catch (error) {
      console.error("Failed to create todo:", error);
      alert("An error occurred while creating the todo.");
    }
  };

  // Delete a todo via API
  const deleteTodo = async (todoId: string) => {
    try {
      await fetch("/api/todo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: todoId }),
      });
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
    } catch (error) {
      console.error("Failed to delete todo:", error);
      alert("An error occurred while deleting the todo.");
    }
  };

  // Toggle completion status via API
  const toggleTodoStatus = async (todoId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/todo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: todoId, completed: !currentStatus }),
      });
      const data = await res.json();
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId
            ? { ...todo, completed: data.todo.completed }
            : todo,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle todo status:", error);
      alert("An error occurred while updating the todo status.");
    }
  };

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Todos</CardTitle>
              <CardDescription>
                Manage your{" "}
                <span className="text-green-500 font-semibold">Todos</span>{" "}
                right here
              </CardDescription>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className={buttonVariants()}
            >
              <span className="font-semibold flex gap-2 items-center">
                <ListTodo size={20} />
                Create New Todo
              </span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {isCreating && (
            <div className="create-todo-form mt-6 space-y-4">
              <h2 className="text-xl font-semibold">Todo</h2>
              <input
                type="text"
                name="title"
                value={newTodoData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                name="content"
                value={newTodoData.content}
                onChange={handleInputChange}
                placeholder="Enter todo content"
                className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addNewTodo}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                Add Todo
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-center mt-6">Loading todos...</p>
          ) : (
            <div className="todos-list mt-6 space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="todo-item p-4 border-t  border-gray-300 shadow-md"
                >
                  <div className="todo-header flex justify-between items-center">
                    <div className="todo-title flex-1 gap-4 ml-3 flex">
                      <h2 className="text-lg font-bold">{todo.title}</h2>
                    </div>
                    <div className="delete-icon items-center mt-2">
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="todo-content mt-2">
                    <p
                      className={`ml-3 ${
                        todo.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.content}
                    </p>
                    <button
                      onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                      className={`mt-2 px-4 py-2 rounded-md ${
                        todo.completed ? "bg-green-500" : "bg-gray-300"
                      } text-white`}
                    >
                      {todo.completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
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

export default TodoPage;
