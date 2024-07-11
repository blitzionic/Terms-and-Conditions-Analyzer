from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))

def open_file(filePath):
  with open(filePath, 'r', encoding='utf-8') as infile:
    return infile.read().strip()
  
def save_file(filePath, content):
  with open(filePath, 'a', encoding='utf-8') as outfile:
    outfile.write(content)

api_key = os.getenv("OPENAI_API_KEY") 
OpenAI.api_key = api_key
file_path = "./.jsonl/tos_fine_tuning.jsonl"


with open(file_path, "rb") as file:
  response = client.files .create(
    file = file,
    purpose = 'fine-tune'
  )

file_id = response.id
print(f"successfully uploaded file with id: {file_id}")


