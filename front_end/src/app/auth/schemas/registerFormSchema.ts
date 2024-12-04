import { z } from "zod";

export const registerFormSchema = z.object({
  name: z.string().min(1, {message: "Es demasiado corto (1 carácter mínimo)"}),
  email: z.string().email({ message: "Es inválido" }),
  password: z.string().min(6, { message: "Es demasiado corto (6 caracteres mínimo)" }),
});
