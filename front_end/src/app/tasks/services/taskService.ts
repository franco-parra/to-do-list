import Cookies from "js-cookie";
import { ApiResponse, TaskApiData, Task } from "@/app/tasks/types/task.types";
import { transformKeys } from "@/app/tasks/utils/transformKeys";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const taskService = {
  async fetchTasks(): Promise<Task[]> {
    const token = Cookies.get("jwt");
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: ApiResponse<TaskApiData> = await response.json();

    return transformKeys(data.data?.tasks || []).map(
      ({ id, title, items }) => ({
        id,
        title,
        items: items.map(({ id, content, completed }) => ({
          id,
          content,
          completed,
        })),
      })
    );
  },
};
