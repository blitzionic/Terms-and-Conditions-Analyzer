import OpenAI from "openai";
import dotenv from 'dotenv';
import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from 'fs/promises';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const filePaths = {
    lyft: "./parsed-text/Lyft-parsed-text.txt",
    paypal: "./parsed-text/PayPal-parsed-text.txt",
    google: "./parsed-text/Google-parsed-text.txt",
};

const systemPrompt = `
Please analyze the following Terms and Conditions text and identify the out of place lines that are not usually present in the type of contract that was submitted. Structure the output in the following JSON format:

{
    "toc_analysis": {
        "summary": "Brief summary of the ToC...",
        "sections": [
            {
                "title": "Section Title",
                "content": "Detailed content of the section...",
                "highlights": [
                    "Potential red flag 1",
                    "Potential red flag 2",
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

const readFromFile = (filePath) => {
    return fs.readFile(filePath, 'utf-8');
};

const chatCompletion = (fileContent) => {
    return openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: fileContent} 
        ],
        stream: true,
      });
}

const streamModel = (stream) => {
    let response = "";
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    response += content; 
                }
                resolve(response);
            }
            catch (error){
                reject(error);
            }
        })();
    });
};

app.get("/analyze/:service", async (req, res) => {
    const service = req.params.service;
    const filePath = filePaths[service];

    if(!filePath){
        res.status(500).send("Invalid service");
        return;
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    readFromFile(filePath)
      .then(contentFile => chatCompletion(contentFile))
      .then(stream => streamModel(stream))
      .then(response => {
        res.write(`${response}\n\n`);
      })
      .catch(error => {
        console.error("OpenAI API Error:", error);
        res.status(500).send("Error occurred while generating completion");
      })
      .finally(() => {
        res.end();
      });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});