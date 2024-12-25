import { useState, useCallback } from "react";
import { Task } from "../types/task";
import { taskService } from "@/app/tasks/services/taskService";
import { ServerNotRespondingError } from "@/app/auth/errors/ServerNotRespondingError";
import { InternalServerError } from "@/app/auth/errors/InternalServerError";
import { UnexpectedError } from "@/app/auth/errors/UnexpectedError";
import { ResourceDeletionError } from "../errors/ResourceDeletionError";
import { ResourceRetrievalError } from "../errors/ResourceRetrievalError";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<
    | ServerNotRespondingError
    | ResourceDeletionError
    | InternalServerError
    | UnexpectedError
    | null
  >(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await taskService.fetchTasks();
      setTasks(
        data.map(({ id, title, items }) => ({
          id,
          title,
          items: items.map(({ id, content, completed }) => ({
            id,
            content,
            completed,
          })),
          isPersisted: true,
        }))
      );
    } catch (error: unknown) {
      if (
        error instanceof ServerNotRespondingError ||
        error instanceof ResourceRetrievalError ||
        error instanceof InternalServerError
      ) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new UnexpectedError(error.message));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(() => {
    const newTask: Task = {
      id: Date.now(),
      title: "",
      items: [],
      isPersisted: false,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    try {
      if (task.isPersisted) {
        await taskService.deleteTask(task.id);
      }
      setTasks((oldTasks) =>
        oldTasks.filter((oldTask) => oldTask.id !== task.id)
      );
    } catch (error: unknown) {
      if (
        error instanceof ServerNotRespondingError ||
        error instanceof ResourceDeletionError ||
        error instanceof InternalServerError
      ) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new UnexpectedError(error.message));
      }
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
