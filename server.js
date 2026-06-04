import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("🚀 GROQ KEY:", !!process.env.GROQ_API_KEY);

const groq = process.env.GROQ_API_KEY
? new Groq({
apiKey: process.env.GROQ_API_KEY
})
: null;

// ================= ROOT =================

app.get("/", (req, res) => {
res.json({
status: "OK",
message: "TeeniWood API Running"
});
});

app.get("/health", (req, res) => {
res.json({
status: "ok",
groq: !!process.env.GROQ_API_KEY
});
});

app.get("/api/test", (req, res) => {
res.json({
success: true
});
});

// ================= SAFE CONTENT =================

function safeContent(topic = "Demo", raw = "") {
return {
title: "🔥 " + topic,
description: raw || "AI generated content",
seo_keywords: [topic, "viral", "ai"],
hashtags: ["#viral", "#ai", "#shorts"],
tags: ["youtube", "ai"],
hooks: [
"🔥 Watch till end!",
"😱 Crazy!",
"🚀 Viral Story!"
],
script: Array.from({ length: 10 }, (_, i) => ({
scene: "Scene " + (i + 1),
video_prompt:
"Ultra cinematic 5-second short video, 4K quality, dramatic lighting, emotional atmosphere about " +
topic +
". Scene " +
(i + 1) +
". Hollywood cinematic, shallow depth of field, film grain, dramatic color grading, ultra realistic, 9:16 vertical format.",
voice_over: "Narration for scene " + (i + 1)
}))
};
}

// ================= GENERATE =================

app.post("/api/generate", async (req, res) => {
try {

```
const topic = req.body.topic;
const language = req.body.language || "Hindi";

if (!topic) {
  return res.json({
    success: false,
    content: safeContent("Demo")
  });
}

if (!groq) {
  throw new Error("GROQ_API_KEY missing");
}

const seed = Date.now();

const prompt =
```

`Return ONLY valid JSON.

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
"script": [
{
"scene": "",
"video_prompt": "",
"voice_over": ""
}
]
}

IMPORTANT:

* Generate EXACTLY 10 scenes.
* Script must contain 10 objects.
* Every object must contain:
  scene
  video_prompt
  voice_over
* Every video_prompt should be ultra cinematic.
* 4K quality.
* Hollywood style.
* Dramatic lighting.
* Emotional storytelling.
* Ultra realistic.
* 9:16 vertical format.
* Story must continue from Scene 1 to Scene 10.
* Return ONLY valid JSON.`;

  const completion =
  await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
  {
  role: "user",
  content: prompt
  }
  ],
  temperature: 0.8
  });

  const text =
  completion?.choices?.[0]?.message?.content || "";

  let cleaned = text
  .replace(/`json/g, "")
      .replace(/`/g, "")
  .trim();

  let data;

  try {

  ```
  data = JSON.parse(cleaned);

  if (!Array.isArray(data.script)) {
    data.script = [];
  }

  data.script = data.script.map((item, index) => ({
    scene:
      item.scene ||
      "Scene " + (index + 1),

    video_prompt:
      item.video_prompt || "",

    voice_over:
      item.voice_over || ""
  }));
  ```

  } catch (e) {

  ```
  console.log("JSON Parse Failed");
  console.log(text);

  data = safeContent(topic, text);
  ```

  }

  return res.json({
  success: true,
  content: data
  });

  } catch (error) {

  console.error("🔥 ERROR:", error);

  return res.status(500).json({
  success: false,
  error: error.message,
  content: safeContent(
  req.body?.topic || "Demo",
  error.message
  )
  });
  }
  });

// ================= START =================

app.listen(PORT, () => {
console.log("🚀 Server running on port", PORT);
});
