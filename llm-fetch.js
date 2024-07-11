import OpenAI from "openai";
import dotenv from 'dotenv';
import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from 'fs/promises';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use OPENAI_API_KEY
});

const filePath = "./parsed-text/adidas-parsed-text.txt";

const systemPrompt = `
Please analyze the following Terms and Conditions text and extract the key points. Structure the output in the following JSON format:

{
    "toc_analysis": {
        "summary": "Brief summary of the ToC...",
        "sections": [
            {
                "title": "Section Title",
                "content": "Detailed content of the section...",
                "highlights": [
                    "Key point 1",
                    "Key point 2",
                    ...
                ]
            },
            ...
        ],
        "metadata": {
            "document_title": "Title of the document",
            "last_updated": "Date of the last update",
            "author": "Author of the document"
        }
    }
}
`;


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    let response = "" 
    const stream = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0125:personal::9jtCCJzU",
      messages: [
        { role: "system", content: systemPrompt }, 
        { role: "user", content: fileContent} 
      ],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      response += content; // Accumulate the content
    }
    res.write(`${response}\n\n`); // Send all content at once
    res.end(); 
    
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).send("Error occurred while generating completion");
  } finally {
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});
