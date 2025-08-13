import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    msg: "Hello from the backend",
    status: "running"
  });
});
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,  
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});


async function main() {
  const stream = await openai.chat.completions.create({
    model: "anthropic/claude-sonnet-4",
    stream: true,
    max_tokens: 200,
    messages: [
      { 
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "create a simple hello world program in java"
          }
        ]
      }
    ],
    
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
  }
}
async function startServer() {
  try {
    await main();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();