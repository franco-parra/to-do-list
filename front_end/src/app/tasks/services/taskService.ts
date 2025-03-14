import Cookies from "js-cookie";
import {
  ApiResponse,
  FastApiResponse,
  TaskApiData,
  TaskDto,
} from "../types/api";
import { LLMResponseError } from "../errors/LLMResponseError";
import { Task } from "../types/task";
import { transformKeys } from "@/app/tasks/utils/transformKeys";
import { ResourceDeletionError } from "../errors/ResourceDeletionError";
import { InternalServerError } from "@/app/auth/errors/InternalServerError";
import { ResourceRetrievalError } from "../errors/ResourceRetrievalError";
import { ServerNotRespondingError } from "@/app/auth/errors/ServerNotRespondingError";
import { ResourceUpdateError } from "../errors/ResourceUpdateError";
import { TaskItem } from "../types/taskItem";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const INFERENCE_API_URL = "http://localhost:8000";

export const taskService = {
  async fetchTasks() {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse<{ tasks: TaskDto[] }> = await response.json();

      if (!response.ok) {
        if ("errors" in data) {
          throw new ResourceRetrievalError();
        } else {
          throw new InternalServerError();
        }
      }

      return transformKeys(data.data?.tasks || []);
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        throw new ServerNotRespondingError();
      } else {
        throw error;
      }
    }
  },
  async deleteTask(taskId: number): Promise<void> {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "delete",
      });

      if (!response.ok) {
        const data: ApiResponse<null> = await response.json();

        if ("errors" in data) {
          throw new ResourceDeletionError();
        } else {
          throw new InternalServerError();
        }
      }
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        throw new ServerNotRespondingError();
      } else {
        throw error;
      }
    }
  },
  async updateTask(task: Task) {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ task: { title: task.title } }),
      });

      if (!response.ok) {
        const data: ApiResponse<null> = await response.json();

        if ("errors" in data) {
          throw new ResourceUpdateError(task);
        } else {
          throw new InternalServerError();
        }
      }
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        throw new ServerNotRespondingError();
      } else {
        throw error;
      }
    }
  },
  async generateTaskItems(task: Task): Promise<Array<TaskItem>> {
    try {
      const response = await fetch(`${INFERENCE_API_URL}/generate-items`, {
        method: "POST",
        body: JSON.stringify({ title: task.title }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: ApiResponse<Array<{ content: string }>> =
        await response.json();

      if (!response.ok) {
        if ("status" in data && data["status"] === "error") {
          throw new LLMResponseError();
        } else {
          throw new InternalServerError();
        }
      }

      return (
        data.data?.map((item, index) => ({
          id: Date.now() + index,
          taskId: task.id,
          content: item.content,
          completed: false,
          isUpdated: false,
          isDeleted: false,
          isPersisted: false,
          isNew: true,
        })) || []
      );
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        throw new ServerNotRespondingError();
      } else {
        throw error;
      }
    }
  },
};
