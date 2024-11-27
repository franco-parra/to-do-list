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
import { ServerNotRespondingError } from "../errors/ServerNotRespondingError";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Server } from "lucide-react";
import { useState } from "react";
import { UnexpectedError } from "../errors/UnexpectedError";
import { loginUser } from "../services/userService";

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
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);

    try {
      const jwt = await loginUser({
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("jwt", jwt);
      push("/tasks");
    } catch (error: unknown) {
      let standardizedError:
        | InvalidCredentials
        | InternalServerError
        | ServerNotRespondingError
        | UnexpectedError
        | null = null;

      if (error instanceof TypeError) {
        standardizedError = new ServerNotRespondingError();
      } else if (
        error instanceof InvalidCredentials ||
        error instanceof InternalServerError
      ) {
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
    } finally {
      setIsLoading(false);
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Cargando
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>
    </Form>
  );
}
