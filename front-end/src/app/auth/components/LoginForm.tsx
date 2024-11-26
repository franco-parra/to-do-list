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
import { loginFormSchema } from "../schemas/loginFormSchema";
import { InvalidCredentials } from "../errors/InvalidCredentials";
import { InternalServerError } from "../errors/InternalServerError";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { toast } = useToast();
  const { push } = useRouter();
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    const userData = {
      user: {
        email: values.email,
        password: values.password,
      },
    };

    try {
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

      localStorage.setItem(
        "jwt",
        response.headers.get("authorization")?.split("Bearer ")[1] || ""
      );
      push("/tasks");
    } catch (error: unknown) {
      if (error instanceof InvalidCredentials) {
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
    <Form {...loginForm}>
      <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
        <FormField
          control={loginForm.control}
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
          control={loginForm.control}
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
          Iniciar Sesión
        </Button>
      </form>
    </Form>
  );
}
