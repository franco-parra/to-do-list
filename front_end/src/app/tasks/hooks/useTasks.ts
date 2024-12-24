import { useState, useCallback } from "react";
import { Task } from "../types/task";
import { taskService } from "@/app/tasks/services/taskService";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await taskService.fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error fetching tasks"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(() => {
    const newTask: Task = {
      id: Date.now(),
      title: "",
      items: [],
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((oldTasks) =>
        oldTasks.filter((oldTask) => oldTask.id !== taskId)
      );
    } catch (error: unknown) {
      console.log("error:", error);
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}
