from huggingface_hub import InferenceClient
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os
import ast
import re

# Load environment variables
load_dotenv()

# Configuration
HF_MODEL = os.getenv("HF_MODEL")
HF_TOKEN = os.getenv("HF_TOKEN")

# Application constants
MAX_RETRIES = 3
BASE_PROMPT = """Dada una tarea, genera una lista de entre 1 a 8 subtareas que permitan resolverla. 
Usa textos con no más de 128 caracteres."""

# Example conversations to guide the model's responses
EXAMPLE_CONVERSATIONS = [
    {"role": "user", "content": f"{BASE_PROMPT}\n\nTarea: Aprender inglés"},
    {"role": "assistant", "content": "['Aprender el alfabeto y la pronunciación', 'Construir vocabulario básico', 'Estudiar gramática', 'Practicar la escucha', 'Leer en inglés', 'Escribir en inglés', 'Hablar inglés', 'Usar recursos']"},
    {"role": "user", "content": "Tarea: Ir de vacaciones a Torres del Paine, Chile"},
    {"role": "assistant", "content": "['Investigar y elegir fechas', 'Reservar alojamiento', 'Planificar transporte', 'Definir itinerario', 'Preparar equipo', 'Comprar entradas', 'Organizar comidas']"},
    {"role": "user", "content": "Tarea: Aprender el framework NextJS"},
    {"role": "assistant", "content": "['Aprender los fundamentos de React', 'Configurar un entorno de desarrollo', 'Explorar la estructura de un proyecto Next.js', 'Aprender a crear páginas y enrutamiento', 'Integrar datos y APIs']"},
]

app = FastAPI()

def create_messages(task: str):
    """
    Creates the message array for the API request by copying the examples
    and appending the new task
    """
    messages = EXAMPLE_CONVERSATIONS.copy()
    messages.append({"role": "user", "content": f"Tarea: {task}"})
    return messages


@app.post("/generate-items")
def generate_tasks(task: str):
    # Verify that credentials are properly configured
    if not HF_MODEL or not HF_TOKEN:
        raise HTTPException(status_code=500, detail="Hugging Face credentials are not configured")

    attempt = 0
    last_error = None

    while attempt < MAX_RETRIES:
        try:
            client = InferenceClient(model=HF_MODEL, token=HF_TOKEN)
            completion = client.chat.completions.create(
                messages=create_messages(task), 
                max_tokens=500,
                temperature=0.1 # Controls response randomness
            )

            # Extract the list from the response using regex
            content = completion.choices[0].message.content
            print('content', content)
            content = re.search("\[(.*?)\]", content)

            if not content:
                raise ValueError(f"Could not extract a valid list from the response. Response: {content}")
            
            # Parse the string representation of the list into a Python list
            items = ast.literal_eval(f"[{content.group(1)}]")
            return {
                "status": "success", 
                "attempts": attempt + 1,
                "data": { 
                    "task": { 
                        "title": task, 
                        "items": items 
                    }
                }
            }
        except Exception as e:
            attempt += 1
            last_error = str(e)
            if attempt < MAX_RETRIES:
                continue

    # Return error response if all retries failed   
    return {
        "status": "error",
        "message": f"Error after {MAX_RETRIES} attempts. Last error: {last_error}",
        "data": None
    }