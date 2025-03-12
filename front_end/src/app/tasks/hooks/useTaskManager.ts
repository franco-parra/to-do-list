import { useCallback, useMemo, useState } from "react";
import { Task } from "../types/task";
import { taskService } from "../services/taskService";
import { TaskItem } from "../types/taskItem";
import { LLMResponseError } from "../errors/LLMResponseError";
import { InternalServerError } from "@/app/auth/errors/InternalServerError";
import { ServerNotRespondingError } from "@/app/auth/errors/ServerNotRespondingError";
import { UnexpectedError } from "@/app/auth/errors/UnexpectedError";

export function useTaskManager(
  task: Task,
  onUpdate: (task: Task) => Promise<boolean>
) {
  const [editedTask, setEditedTask] = useState(task);
  const [lastSavedTask, setLastSavedTask] = useState(task);
  const [newItemContent, setNewItemContent] = useState("");
  const [updatingItemIds, setUpdatingItemIds] = useState(new Set<number>());
  const [error, setError] = useState<
    | LLMResponseError
    | InternalServerError
    | ServerNotRespondingError
    | UnexpectedError
    | null
  >(null);

  const hasChanges = useMemo(() => {
    return JSON.stringify(editedTask) !== JSON.stringify(lastSavedTask);
  }, [editedTask, lastSavedTask]);

  const updateTitle = useCallback((newTitle: string) => {
    setEditedTask((oldTask) => ({ ...oldTask, title: newTitle }));
  }, []);

  const toggleItem = useCallback((itemId: number) => {
    setEditedTask((oldTask) => ({
      ...oldTask,
      items: oldTask.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  const updateItem = useCallback((itemId: number, newText: string) => {
    setEditedTask((oldTask) => ({
      ...oldTask,
      items: oldTask.items.map((item) =>
        item.id === itemId ? { ...item, content: newText } : item
      ),
    }));
  }, []);

  const deleteItem = useCallback((itemId: number) => {
    setEditedTask((oldTask) => ({
      ...oldTask,
      items: oldTask.items.map((item) =>
        item.id === itemId ? { ...item, isDeleted: true } : item
      ),
    }));
  }, []);

  const addItem = useCallback(() => {
    const trimmedContent = newItemContent.trim();
    if (trimmedContent) {
      setEditedTask((oldTask) => ({
        ...oldTask,
        items: [
          ...oldTask.items,
          {
            id: Date.now(),
            taskId: oldTask.id,
            content: trimmedContent,
            completed: false,
            isUpdated: false,
            isDeleted: false,
            isNew: true,
          },
        ],
      }));
      setNewItemContent("");
    }
  }, [newItemContent]);

  // Crear una nueva variable de estado que contenga los errores, y desde TaskItem, rescatamos dicho error para mostrarlo en un toast.
  const generateItems = useCallback(async () => {
    setUpdatingItemIds((oldUpdatingItemIds) =>
      new Set(oldUpdatingItemIds).add(task.id)
    );

    try {
      const newTaskItems: Array<TaskItem> = await taskService.generateTaskItems(
        editedTask
      );
      setEditedTask((oldTask: Task) => {
        const oldTaskItems = oldTask.items.map((item) => ({
          ...item,
          isDeleted: true,
        }));
        const items = oldTaskItems.concat(newTaskItems);
        return { ...oldTask, items };
      });

      return true;
    } catch (error: unknown) {
      if (
        error instanceof LLMResponseError ||
        error instanceof InternalServerError ||
        error instanceof ServerNotRespondingError
      ) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new UnexpectedError(error.message));
      }
      return false;
    } finally {
      setUpdatingItemIds((oldUpdatingItemIds) => {
        const newUpdatingItemIds = new Set(oldUpdatingItemIds);
        newUpdatingItemIds.delete(task.id);
        return newUpdatingItemIds;
      });
    }
  }, [editedTask.title]);

  const saveChanges = useCallback(async () => {
    if (editedTask.isPersisted) {
      const success = await onUpdate({ ...editedTask });
      if (success) {
        setLastSavedTask(editedTask);
      }
    }
  }, [editedTask, lastSavedTask]);

  const restoreLastSaved = useCallback(() => {
    setEditedTask(lastSavedTask);
  }, [lastSavedTask]);

  const getProgress = useCallback(() => {
    const completedItems = editedTask.items.filter(
      (item) => !item.isDeleted && item.completed
    ).length;
    const totalItems = editedTask.items.length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  }, [editedTask.items]);

  return {
    editedTask,
    newItemContent,
    setNewItemContent,
    hasChanges,
    updateTitle,
    toggleItem,
    updateItem,
    deleteItem,
    addItem,
    saveChanges,
    restoreLastSaved,
    getProgress,
    generateItems,
    updatingItemIds,
    error,
  };
}
