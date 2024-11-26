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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ServerNotRespondingError } from "../errors/ServerNotRespondingError";
import { UnexpectedError } from "../errors/UnexpectedError";

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
  const [isLoading, setIsLoading] = useState(false);

  const onRegister = async (values: z.infer<typeof registerFormSchema>) => {
    const userData = {
      user: {
        name: values.name,
        email: values.email,
        password: values.password,
      },
    };

    setIsLoading(true);

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
      if (error instanceof ValidationError) {
        for (const key in error.errors) {
          registerForm.setError(key as "name" | "email" | "password", {
            message: `${capitalizeFirstLetter(key)} ${error.errors[key].join(
              ", "
            )}`,
          });
        }
      } else {
        let standardizedError:
          | ServerNotRespondingError
          | InternalServerError
          | UnexpectedError
          | null = null;

        if (error instanceof TypeError) {
          standardizedError = new ServerNotRespondingError();
        } else if (error instanceof InternalServerError) {
          standardizedError = error;
        } else {
          const typedError = error as Error;
          standardizedError = new UnexpectedError(typedError.message);
        }

        toast({
          title: standardizedError.title,
          description: standardizedError.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Cargando
            </>
          ) : (
            "Registrarse"
          )}
        </Button>
      </form>
    </Form>
  );
}
