"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Trash2, Plus, Save, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskManager } from "../hooks/useTaskManager";
import { TaskItemProps } from "../types/task.types";

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const taskManager = useTaskManager(task, onUpdate);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Input
          value={taskManager.editedTask.title}
          onChange={(e) => taskManager.updateTitle(e.target.value)}
          className="text-lg font-semibold"
          placeholder="Nueva tarea"
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-black h-2.5 rounded-full"
            style={{ width: `${taskManager.getProgress()}%` }}
          ></div>
        </div>
        <div className="space-y-2">
          {taskManager.editedTask.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => taskManager.toggleItem(item.id)}
              />
              <Input
                value={item.content}
                onChange={(e) =>
                  taskManager.updateItem(item.id, e.target.value)
                }
                className={`flex-grow ${
                  item.completed ? "line-through text-gray-500" : ""
                }`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => taskManager.deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex space-x-2 mt-2">
            <Input
              value={taskManager.newItemContent}
              onChange={(e) => taskManager.setNewItemContent(e.target.value)}
              placeholder="Nuevo ítem"
              className="flex-grow"
            />
            <Button onClick={taskManager.addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={taskManager.restoreLastSaved}
          disabled={!taskManager.hasChanges}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar
        </Button>
        <div className="space-x-2">
          <Button
            size="sm"
            onClick={taskManager.saveChanges}
            disabled={!taskManager.hasChanges}
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
