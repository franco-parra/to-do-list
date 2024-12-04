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
import { registerUser } from "../services/userService";
import { FormFieldInput } from "./form/FormFieldInput";

const formFields = [
  { name: "name", type: "text", placeholder: "Nombre" },
  { name: "email", type: "email", placeholder: "Correo electrónico" },
  { name: "password", type: "password", placeholder: "Contraseña" },
] as const;

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

  const handleError = (error: unknown) => {
    if (error instanceof ValidationError) {
      Object.entries(error.errors).forEach(([key, messages]) => {
        registerForm.setError(key as "name" | "email" | "password", {
          message: `${messages
            .map((message) => capitalizeFirstLetter(message))
            .join(". ")}`,
        });
      });
      return;
    }

    const standardizedError =
      error instanceof TypeError
        ? new ServerNotRespondingError()
        : error instanceof InternalServerError
        ? error
        : new UnexpectedError((error as Error).message);

    toast({
      title: standardizedError.title,
      description: standardizedError.message,
      variant: "destructive",
    });
  };

  const onRegister = async (values: z.infer<typeof registerFormSchema>) => {
    setIsLoading(true);

    try {
      const jwt = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("jwt", jwt);
      push("/tasks");
    } catch (error: unknown) {
      handleError(error);
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
        {formFields.map((field) => (
          <FormFieldInput
            key={field.name}
            control={registerForm.control}
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
            "Registrarse"
          )}
        </Button>
      </form>
    </Form>
  );
}
