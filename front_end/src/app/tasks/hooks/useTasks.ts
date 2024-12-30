import { useState, useCallback } from "react";
import { Task } from "../types/task";
import { taskService } from "@/app/tasks/services/taskService";
import { ServerNotRespondingError } from "@/app/auth/errors/ServerNotRespondingError";
import { InternalServerError } from "@/app/auth/errors/InternalServerError";
import { UnexpectedError } from "@/app/auth/errors/UnexpectedError";
import { ResourceDeletionError } from "../errors/ResourceDeletionError";
import { ResourceRetrievalError } from "../errors/ResourceRetrievalError";
import { ResourceUpdateError } from "../errors/ResourceUpdateError";
import { itemService } from "../services/itemService";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingTaskIds, setDeletingTaskIds] = useState(new Set<number>());
  const [updatingTaskIds, setUpdatingTaskIds] = useState(new Set<number>());
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
          items: items.map(({ id, taskId, content, completed }) => ({
            id,
            taskId,
            content,
            completed,
            isUpdated: false,
            isDeleted: false,
            isNew: false,
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

  const updateTask = useCallback(
    async (updatedTask: Task): Promise<boolean> => {
      setUpdatingTaskIds(
        (oldUpdatingTaskIds) => new Set(oldUpdatingTaskIds.add(updatedTask.id))
      );

      try {
        let promises = [
          taskService.updateTask(updatedTask),
          ...updatedTask.items.map((item) =>
            item.isDeleted
              ? itemService.deleteItem(item)
              : item.isNew
              ? itemService.addItem(item)
              : itemService.updateItem(item)
          ),
        ];

        await Promise.all(promises);
        setTasks((prev) =>
          prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        return true;
      } catch (error: unknown) {
        if (
          error instanceof ServerNotRespondingError ||
          error instanceof ResourceUpdateError ||
          error instanceof InternalServerError
        ) {
          setError(error);
        } else if (error instanceof Error) {
          setError(new UnexpectedError(error.message));
        }
        return false;
      } finally {
        setUpdatingTaskIds((oldUpdatingTaskIds) => {
          const newUpdatingTaskIds = new Set(oldUpdatingTaskIds);
          newUpdatingTaskIds.delete(updatedTask.id);
          return newUpdatingTaskIds;
        });
      }
    },
    []
  );

  const deleteTask = useCallback(async (task: Task) => {
    setDeletingTaskIds(
      (oldDeletingTaskIds) => new Set(oldDeletingTaskIds.add(task.id))
    );

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
    } finally {
      setDeletingTaskIds((oldDeletingTaskIds) => {
        const newDeletingTaskIds = new Set(oldDeletingTaskIds);
        newDeletingTaskIds.delete(task.id);
        return newDeletingTaskIds;
      });
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
    deletingTaskIds,
    updatingTaskIds,
  };
}
