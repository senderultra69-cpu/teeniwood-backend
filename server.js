import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const groq = new Groq({
apiKey: process.env.GROQ_API_KEY
});

// Health Check
app.get("/", (req, res) => {
res.json({
status: "TeeniWood AI Backend Running 🚀",
time: new Date().toISOString()
});
});

// Test Route
app.get("/api/test", (req, res) => {
res.json({
success: true,
message: "Backend Working 🚀"
});
});

// AI Generate Route
app.post("/api/generate", async (req, res) => {

try {

```
const { topic } = req.body;

if (!topic) {
  return res.status(400).json({
    error: "Topic required"
  });
}

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  temperature: 0.8,
  messages: [
    {
      role: "system",
      content: `
```

Return ONLY valid JSON.

Format:

{
"title":"",
"description":"",
"hashtags":[],
"tags":[],
"hooks":[],
"script":[]
}
`        },
        {
          role: "user",
          content:`
Create viral YouTube content for:

Topic: ${topic}

Generate:

* SEO title
* Description
* Hashtags
* Tags
* 3 Hooks
* 5 Script Scenes

Return JSON only.
`
}
]
});

```
const raw =
  completion.choices[0].message.content;

let parsed;

try {
  parsed = JSON.parse(raw);
} catch {
  parsed = {
    title: topic,
    description: raw,
    hashtags: [],
    tags: [],
    hooks: [],
    script: []
  };
}

res.json({
  success: true,
  content: parsed
});
```

} catch (error) {

```
console.error(error);

res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

app.listen(PORT, () => {
console.log(
`TeeniWood AI running on port ${PORT}`
);
});
