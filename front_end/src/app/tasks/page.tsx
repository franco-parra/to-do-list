"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskItem from "./components/TaskItem";

// Datos de ejemplo
const initialTasks: Array<{
  id: number;
  title: string;
  items: Array<{ id: number; text: string; completed: boolean }>;
  isNewTask?: boolean;
}> = [
  {
    id: 1,
    title: "Proyecto A",
    items: [
      { id: 1, text: "Tarea 1", completed: true },
      { id: 2, text: "Tarea 2", completed: false },
      { id: 3, text: "Tarea 3", completed: true },
    ],
  },
  {
    id: 2,
    title: "Proyecto B",
    items: [
      { id: 1, text: "Tarea 1", completed: false },
      { id: 2, text: "Tarea 2", completed: false },
    ],
  },
];

export default function TaskList() {
  const [tasks, setTasks] = useState(initialTasks);

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: "",
      items: [],
      isNewTask: true,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: {
    id: number;
    title: string;
    items: Array<{ id: number; text: string; completed: boolean }>;
    isNewTask?: boolean;
  }) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Tareas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            isNewTask={task.isNewTask}
          />
        ))}
      </div>
      <Button className="mt-4" onClick={addTask}>
        <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
      </Button>
    </div>
  );
}
