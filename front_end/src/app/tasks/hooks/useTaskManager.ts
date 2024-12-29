import { useCallback, useMemo, useState } from "react";
import { Task } from "../types/task";

export function useTaskManager(
  task: Task,
  onUpdate: (task: Task) => Promise<boolean>
) {
  const [editedTask, setEditedTask] = useState(task);
  const [lastSavedTask, setLastSavedTask] = useState(task);
  const [newItemContent, setNewItemContent] = useState("");

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
      items: oldTask.items.filter((item) => item.id !== itemId),
    }));
  }, []);

  const addItem = useCallback(() => {
    if (newItemContent.trim()) {
      setEditedTask((oldTask) => ({
        ...oldTask,
        items: [
          ...oldTask.items,
          { id: Date.now(), content: newItemContent, completed: false },
        ],
      }));
      setNewItemContent("");
    }
  }, [newItemContent]);

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
      (item) => item.completed
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
  };
}
