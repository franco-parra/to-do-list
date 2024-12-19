"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskItem from "./components/TaskItem";
import { transformKeys } from "@/utils/transformKeys";
import { Task, ApiResponse, TaskApiData } from "@/types/task.types";
import { useTasks } from "@/hooks/useTasks";

export default function TaskList() {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
