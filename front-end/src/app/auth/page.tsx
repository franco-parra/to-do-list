"use client";

import { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

class ValidationError extends Error {
  errors: { [key: string]: string[] };

  constructor(errors: { [key: string]: string[] }) {
    super("Uno o más campos fueron rechazados debido a sus formatos.");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

class InternalServerError extends Error {
  constructor() {
    super("El servidor no ha respondido adecuadamente.");
    this.name = "InternalServerError";
  }
}

class InvalidCredentials extends Error {
  constructor() {
    super("El usuario o la contraseña son incorrectos.");
    this.name = "InvalidCredentials";
  }
}

function capitalizeFirstLetter(text: string) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const { push } = useRouter();
  const loginFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const registerFormSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  });
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isLogin ? "Iniciar Sesión" : "Registrarse"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="login"
            onValueChange={(value) => setIsLogin(value === "login")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  className="space-y-4"
                  onSubmit={registerForm.handleSubmit(onLogin)}
                >
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
                          <Input
                            type="password"
                            placeholder="Contraseña"
                            {...field}
                          />
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
            </TabsContent>
            <TabsContent value="register">
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
                          <Input
                            type="password"
                            placeholder="Contraseña"
                            {...field}
                          />
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
