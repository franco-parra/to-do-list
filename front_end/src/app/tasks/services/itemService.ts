import Cookies from "js-cookie";
import { TaskItem } from "../types/taskItem";
import { ResourceUpdateError } from "../errors/ResourceUpdateError";
import { InternalServerError } from "@/app/auth/errors/InternalServerError";
import { ServerNotRespondingError } from "@/app/auth/errors/ServerNotRespondingError";
import { ResourceDeletionError } from "../errors/ResourceDeletionError";
import { ResourceCreationError } from "../errors/ResourceCreationError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const itemService = {
  async updateItem(item: TaskItem) {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${item.taskId}/items/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({
            item: {
              content: item.content,
              completed: item.completed,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if ("errors" in data) {
          console.log("error", data);
          throw new ResourceUpdateError(item);
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
  async deleteItem(item: TaskItem) {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${item.taskId}/items/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
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
  async addItem(item: TaskItem) {
    const token = Cookies.get("jwt");

    try {
      const response = await fetch(`${API_URL}/tasks/${item.taskId}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          item: {
            content: item.content,
            completed: item.completed,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if ("errors" in data) {
          throw new ResourceCreationError(item);
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
};
