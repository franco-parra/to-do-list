import { string } from "zod";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalServerError";
import { InvalidCredentials } from "../errors/InvalidCredentials";

export const registerUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const userData = { user: { name, email, password } };
  const response = await fetch("http://localhost:3001/users?locale=es", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();

    if ("errors" in data) {
      throw new ValidationError(data["errors"]);
    } else {
      throw new InternalServerError();
    }
  }

  const jwt = response.headers.get("authorization")?.split("Bearer ")[1] || "";
  return jwt;
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const userData = { user: { email, password } };
  const response = await fetch("http://localhost:3001/users/sign_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();

    if ("errors" in data) {
      throw new InvalidCredentials();
    } else {
      throw new InternalServerError();
    }
  }

  const jwt = response.headers.get("authorization")?.split("Bearer ")[1] || "";
  return jwt;
};
