"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskItem from "./components/TaskItem";
import { transformKeys } from "@/utils/transformKeys";
import { Task, ApiResponse, TaskApiData } from "@/types/task.types";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = Cookies.get("jwt");
      const response = await fetch("http://localhost:3001/tasks", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse<TaskApiData> = await response.json();
      setTasks(
        transformKeys(data.data?.tasks || []).map(({ id, title, items }) => ({
          id,
          title,
          items: items.map(({ id, content, completed }) => ({
            id,
            content,
            completed,
          })),
        }))
      );
    };
    fetchTasks();
  }, []);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now(),
      title: "",
      items: [],
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Tareas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        ))}
      </div>
      <Button className="mt-4" onClick={addTask}>
        <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
      </Button>
    </div>
  );
}
