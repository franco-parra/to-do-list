from huggingface_hub import InferenceClient
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
import os
import ast
import re

class Task(BaseModel):
    title: str

class Item(BaseModel):
    content: str

class ResponseModel(BaseModel):
    status: str
    message: str
    data: Optional[list[Item]] = None
    errors: Optional[list] = None

class InvalidListError(Exception):
    def __init__(self, message: str, status_code: int):
        self.message = message
        self.status_code = status_code

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

# CORS configuration
origins = ["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def create_messages(task: str):
    """
    Creates the message array for the API request by copying the examples
    and appending the new task
    """
    messages = EXAMPLE_CONVERSATIONS.copy()
    messages.append({"role": "user", "content": f"Tarea: {task}"})
    return messages

@app.exception_handler(InvalidListError)
async def invalid_list_handler(request: Request, exc: InvalidListError):
    content = ResponseModel(status="error", message=exc.message).model_dump()
    return JSONResponse(status_code=exc.status_code, content=content)

@app.post("/generate-items", response_model=ResponseModel)
def generate_tasks(task: Task):
    # Verify that credentials are properly configured
    if not HF_MODEL or not HF_TOKEN:
        return ResponseModel(
            status="error", 
            message="Hugging Face credentials are not configured"
        )

    attempt = 0
    last_error = None

    while attempt < MAX_RETRIES:
        try:
            client = InferenceClient(model=HF_MODEL, token=HF_TOKEN)
            completion = client.chat.completions.create(
                messages=create_messages(task.title), 
                max_tokens=500,
                temperature=0.1 # Controls response randomness
            )

            # Extract the list from the response using regex
            content = completion.choices[0].message.content
            cleaned_content = re.search(r"\[(.*?)\]", content)

            # Parse the string representation of the list into a Python list
            try:
                contents: list[str] = ast.literal_eval(f"[{cleaned_content.group(1)}]")
                data = [Item(content=c).model_dump() for c in contents]
                return ResponseModel(
                    status="success", 
                    message="Task items successfully generated", 
                    data=data
                )
            except Exception as e:
                raise InvalidListError(f"The LLM response produced a string that cannot be transformed into a list. Response: {content}", status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            attempt += 1
            last_error = e
            if attempt < MAX_RETRIES:
                continue

    # Return error response if all retries failed   
    raise last_error