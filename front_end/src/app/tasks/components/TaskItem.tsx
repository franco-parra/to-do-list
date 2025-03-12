"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Plus, Save, RotateCcw, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskManager } from "../hooks/useTaskManager";
import { Task } from "../types/task";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  isDeleting,
  isUpdating,
}: {
  task: Task;
  onUpdate: (task: Task) => Promise<boolean>;
  onDelete: (task: Task) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}) {
  const { toast } = useToast();
  const taskManager = useTaskManager(task, onUpdate);

  useEffect(() => {
    if (taskManager.error) {
      toast({
        title: taskManager.error.title,
        description: taskManager.error.message,
        variant: "destructive",
      });
    }
  }, [taskManager.error]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex gap-2">
          <Input
            value={taskManager.editedTask.title}
            onChange={(e) => taskManager.updateTitle(e.target.value)}
            className="text-lg font-semibold"
            placeholder="Nueva tarea"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => taskManager.generateItems()}
                  disabled={taskManager.updatingItemIds.has(task.id)}
                >
                  {taskManager.updatingItemIds.has(task.id) ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generar ítems</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-black h-2.5 rounded-full"
            style={{ width: `${taskManager.getProgress()}%` }}
          ></div>
        </div>
        <div className="space-y-2">
          {taskManager.editedTask.items.map(
            (item) =>
              !item.isDeleted && (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => taskManager.deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar ítem</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )
          )}
          <div className="flex space-x-2 mt-2">
            <Input
              value={taskManager.newItemContent}
              onChange={(e) => taskManager.setNewItemContent(e.target.value)}
              placeholder="Nuevo ítem"
              className="flex-grow"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    onClick={taskManager.addItem}
                    size="icon"
                    disabled={taskManager.newItemContent.trim() === ""}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agregar nuevo ítem</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={taskManager.restoreLastSaved}
                disabled={!taskManager.hasChanges}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restaurar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  onClick={taskManager.saveChanges}
                  disabled={!taskManager.hasChanges || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(task)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}
