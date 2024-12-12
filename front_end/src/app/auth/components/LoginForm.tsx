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
import { FormFieldInput } from "./form/FormFieldInput";
import Cookies from "js-cookie";

const formFields = [
  { name: "email", type: "email", placeholder: "Correo electrónico" },
  { name: "password", type: "password", placeholder: "Contraseña" },
] as const;

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

  const handleError = (error: unknown) => {
    const standardizedError =
      error instanceof TypeError
        ? new ServerNotRespondingError()
        : error instanceof InvalidCredentials ||
          error instanceof InternalServerError
        ? error
        : new UnexpectedError((error as Error).message);

    toast({
      title: standardizedError.title,
      description: standardizedError.message,
      variant: "destructive",
    });
  };

  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);

    try {
      const jwt = await loginUser({
        email: values.email,
        password: values.password,
      });
      Cookies.set("jwt", jwt, { expires: 1 });
      push("/tasks");
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...loginForm}>
      <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
        {formFields.map((field) => (
          <FormFieldInput
            key={field.name}
            control={loginForm.control}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
          />
        ))}
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
