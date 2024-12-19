"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskItem from "./components/TaskItem";

type KeyTransformer<T> = T extends object
  ? T extends Array<infer U>
    ? Array<KeyTransformer<U>>
    : {
        [K in keyof T as K extends string ? FormatKey<K> : K]: KeyTransformer<
          T[K]
        >;
      }
  : T;

type FormatKey<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<FormatKey<U>>}`
  : S;

function transformKeys<T>(objectOrArray: T): KeyTransformer<T> {
  if (typeof objectOrArray !== "object" || objectOrArray === null)
    return objectOrArray as KeyTransformer<T>;

  if (Array.isArray(objectOrArray)) {
    return objectOrArray.map(transformKeys) as KeyTransformer<T>;
  }

  let transformedObject: any = {};

  for (const key in objectOrArray) {
    const formattedKey = formatKeyToCamel(key);
    transformedObject[formattedKey] = transformKeys(objectOrArray[key]);
  }
  return transformedObject;
}

function formatKeyToCamel(str: string) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}

export default function TaskList() {
  const [tasks, setTasks] = useState<
    Array<{
      id: number;
      title: string;
      items: Array<{
        completed: boolean;
        content: string;
        id: number;
      }>;
    }>
  >([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = Cookies.get("jwt");
      const response = await fetch("http://localhost:3001/tasks", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: {
        message: string;
        status: "success" | "error";
        data: null | {
          tasks: Array<{
            createdAt: string;
            description: string;
            dueDate: string;
            id: number;
            title: string;
            updatedAt: string;
            userId: number;
            items: Array<{
              completed: boolean;
              content: string;
              createdAt: string;
              id: number;
              taskId: number;
              updatedAt: string;
            }>;
          }>;
        };
      } = await response.json();
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
    const newTask = {
      id: Date.now(),
      title: "",
      items: [],
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: {
    id: number;
    title: string;
    items: Array<{ id: number; content: string; completed: boolean }>;
  }) => {
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
