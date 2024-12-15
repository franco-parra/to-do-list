"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    items: Array<{ id: number; text: string; completed: boolean }>;
    isNewTask?: boolean;
  };
  onUpdate: (task: TaskItemProps["task"]) => void;
  onDelete: (taskId: number) => void;
  isNewTask?: boolean;
}

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  isNewTask = false,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(isNewTask);
  const [editedTask, setEditedTask] = useState(task);
  const [newItemText, setNewItemText] = useState("");

  const updateTitle = (newTitle: string) => {
    setEditedTask({ ...editedTask, title: newTitle });
  };

  const toggleItem = (itemId: number) => {
    setEditedTask({
      ...editedTask,
      items: editedTask.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const updateItem = (itemId: number, newText: string) => {
    setEditedTask({
      ...editedTask,
      items: editedTask.items.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
    });
  };

  const deleteItem = (itemId: number) => {
    setEditedTask({
      ...editedTask,
      items: editedTask.items.filter((item) => item.id !== itemId),
    });
  };

  const addItem = () => {
    if (newItemText.trim()) {
      setEditedTask({
        ...editedTask,
        items: [
          ...editedTask.items,
          { id: Date.now(), text: newItemText, completed: false },
        ],
      });
      setNewItemText("");
    }
  };

  const saveChanges = () => {
    onUpdate({ ...editedTask, isNewTask: false });
    setIsEditing(false);
  };

  const completedItems = editedTask.items.filter(
    (item) => item.completed
  ).length;
  const totalItems = editedTask.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {isEditing ? (
          <Input
            value={editedTask.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold"
          />
        ) : (
          <CardTitle className="text-lg">{editedTask.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            {editedTask.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex space-x-2 mt-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Nuevo ítem"
                className="flex-grow"
              />
              <Button onClick={addItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {editedTask.items.map((item) => (
              <li
                key={item.id}
                className={`flex items-center space-x-2 ${
                  item.completed ? "line-through text-gray-500" : ""
                }`}
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        {!isNewTask && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        )}
        {isEditing ? (
          <Button size="sm" onClick={saveChanges}>
            <Save className="mr-2 h-4 w-4" /> Guardar
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
