import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Bienvenido a Focus Flow
      </h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Organiza tus tareas de manera eficiente. Crea listas, añade ítems y
        mantén un seguimiento de tu progreso.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/auth">Comenzar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth">Iniciar Sesión</Link>
        </Button>
      </div>
    </div>
  );
}
