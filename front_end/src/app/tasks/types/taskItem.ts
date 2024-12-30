export interface TaskItem {
  id: number;
  taskId: number;
  content: string;
  completed: boolean;
  isDeleted: boolean;
  isUpdated: boolean;
  isNew: boolean;
}
