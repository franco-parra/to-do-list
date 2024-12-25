import { TaskItem } from "./taskItem";

export interface Task {
  id: number;
  title: string;
  items: TaskItem[];
  isPersisted: boolean;
}
