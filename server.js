import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("🚀 GEMINI KEY:", !!process.env.GEMINI_API_KEY);
console.log("🚀 GROQ KEY:", !!process.env.GROQ_API_KEY);

const genAI = process.env.GEMINI_API_KEY
? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
: null;

const groq = process.env.GROQ_API_KEY
? new Groq({
apiKey: process.env.GROQ_API_KEY
})
: null;

app.get("/", (req, res) => {
res.json({
status: "OK",
message: "TeeniWood API Running"
});
});

app.get("/health", (req, res) => {
res.json({
status: "ok",
gemini: !!process.env.GEMINI_API_KEY,
groq: !!process.env.GROQ_API_KEY
});
});

app.get("/api/test", (req, res) => {
res.json({
success: true
});
});

function safeContent(topic = "Demo", raw = "") {
return {
title: `🔥 ${topic}`,
description: raw || "AI generated content",
seo_keywords: [topic, "viral", "ai"],
hashtags: ["#viral", "#ai", "#shorts"],
tags: ["youtube", "ai"],
hooks: [
"🔥 Watch till end!",
"😱 Crazy!",
"🚀 Viral story!"
],
script: [
{
scene: "0-5 sec",
text: `Hook: ${topic}`,
voice_over: "Start",
visual: "cinematic"
}
]
};
}

app.post("/api/generate", async (req, res) => {
try {

```
const {
  topic,
  engine = "groq",
  language = "Hindi"
} = req.body;

if (!topic) {
  return res.json({
    success: false,
    content: safeContent("Demo")
  });
}

const seed = Date.now();
let text = "";

if (engine === "gemini" && genAI) {

  const prompt = `
```

Return ONLY valid JSON.

Topic: ${topic}
Language: ${language}
Seed: ${seed}

{
"title": "",
"description": "",
"seo_keywords": [],
"hashtags": [],
"tags": [],
"hooks": [],
"script": []
}
`;

```
  const models = [
    "gemini-2.0-flash",
    "gemini-2.5-flash"
  ];

  let success = false;

  for (const modelName of models) {
    try {

      const model = genAI.getGenerativeModel({
        model: modelName
      });

      const result =
        await model.generateContent(prompt);

      const response =
        await result.response;

      text = response.text();

      success = true;
      break;

    } catch (err) {
      console.log(
        "Gemini Failed:",
        modelName
      );
    }
  }

  if (!success) {
    console.log(
      "Switching to Groq..."
    );
  }
}

if (!text) {

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
```

Return ONLY JSON.

Topic: ${topic}
Language: ${language}
Seed: ${seed}

{
"title": "",
"description": "",
"seo_keywords": [],
"hashtags": [],
"tags": [],
"hooks": [],
"script": []
}
`
}
]
});

````
  text =
    completion?.choices?.[0]?.message?.content ||
    "";
}

let cleaned = (text || "")
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .replace(/^[^{]*/, "")
  .trim();

let data;

try {
  data = JSON.parse(cleaned);
} catch {
  data = safeContent(topic, text);
}

return res.json({
  success: true,
  content: data
});
````

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message,
  content: safeContent(
    req.body?.topic || "Demo",
    error.message
  )
});
```

}
});

app.listen(PORT, () => {
console.log(
"🚀 Server running on port",
PORT
);
});
