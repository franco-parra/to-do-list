export interface TaskItem {
  id: number;
  content: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  items: TaskItem[];
}

export interface ApiResponse<T> {
  message: string;
  status: "success" | "error";
  data: T | null;
}

export interface TaskApiData {
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
}
export interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
}
