export interface ApiResponse<T> {
  message: string;
  status: "success" | "error";
  data: T | null;
  errors?: null | { [key: string]: string };
}

export interface TaskDto {
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
