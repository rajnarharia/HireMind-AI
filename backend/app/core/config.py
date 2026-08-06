import os

from dotenv import load_dotenv
from groq import Groq
import os

client = Groq(
    api_key=os.getenv("GROQ_API_KEY", "gsk_placeholder_do_not_use_in_prod")
)

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "llama-3.3-70b-versatile"
)