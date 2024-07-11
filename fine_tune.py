from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))

file_id = "file-pdGqBPbHm1jf5FdyOFO7dNw8"

response = client.fine_tuning.jobs.create(
  training_file=file_id, 
  model="gpt-3.5-turbo"
)
 
print(response)