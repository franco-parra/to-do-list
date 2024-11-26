import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "../schemas/registerFormSchema";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalServerError";
import { capitalizeFirstLetter } from "../utils/stringUtils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const { toast } = useToast();
  const { push } = useRouter();
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onRegister = async (values: z.infer<typeof registerFormSchema>) => {
    const userData = {
      user: {
        name: values.name,
        email: values.email,
        password: values.password,
      },
    };

    try {
      const response = await fetch("http://localhost:3001/users", {
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

      localStorage.setItem(
        "jwt",
        response.headers.get("authorization")?.split("Bearer ")[1] || ""
      );
      push("/tasks");
    } catch (error: unknown) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        if (error instanceof ValidationError) {
          for (const key in error.errors) {
            registerForm.setError(key as "name" | "email" | "password", {
              message: `${capitalizeFirstLetter(key)} ${error.errors[key].join(
                ", "
              )}`,
            });
          }
        }

        toast({
          title: "Algo salió mal",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Algo salió mal",
          description: "Desconocemos el error.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Form {...registerForm}>
      <form
        className="space-y-4"
        onSubmit={registerForm.handleSubmit(onRegister)}
      >
        <FormField
          control={registerForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" placeholder="Nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Registrarse
        </Button>
      </form>
    </Form>
  );
}
