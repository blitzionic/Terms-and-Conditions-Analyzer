import OpenAI from "openai";
import dotenv from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use OPENAI_API_KEY
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say this is a test" }],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.end(); // End the response after the stream finishes
    
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
