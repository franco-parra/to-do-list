import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Es inválido" }),
  password: z.string().min(6, { message: "Es demasiado corto (6 caracteres mínimo)" }),
});
