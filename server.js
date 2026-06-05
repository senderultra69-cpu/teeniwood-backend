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

function safeContent(topic = "Demo") {
  return {
    title: "🔥 " + topic,
    description:
      "This is a complete cinematic story about " +
      topic +
      ". Emotional storytelling with drama, suspense and inspiration.",

    seo_keywords: [
      topic,
      "viral story",
      "cinematic video",
      "youtube shorts",
      "ai video",
      "storytelling",
      "4k video",
      "hollywood style",
      "viral content",
      "short film"
    ],

    hashtags: [
      "#viral",
      "#shorts",
      "#story",
      "#cinematic",
      "#trending",
      "#reels",
      "#youtube",
      "#ai",
      "#motivation",
      "#viralvideo"
    ],

    tags: [
      topic,
      "viral",
      "shorts",
      "story",
      "cinematic",
      "youtube",
      "reels",
      "ai"
    ],

    hooks: [
      "🔥 Watch till end!",
      "😱 Unexpected ending!",
      "🚀 Viral story!",
      "💥 You won't believe this!",
      "🎬 A story that changes everything!"
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

    const prompt = `
Return ONLY valid JSON.

Topic: ${topic}

Selected Language: ${language}

IMPORTANT LANGUAGE RULES:
- Generate ALL content strictly in ${language}.
- Title must be in ${language}.
- Description must be in ${language}.
- Hooks must be in ${language}.
- Voice_over must be in ${language}.
- Do not mix languages.
- If Urdu selected then output only Urdu.
- If Hindi selected then output only Hindi.
- If English selected then output only English.
- Tags, hashtags and SEO keywords should match the selected language.

{
  "title":"",
  "description":"",
  "seo_keywords":[],
  "hashtags":[],
  "tags":[],
  "hooks":[],
  "script":[
    {
      "scene":"",
      "video_prompt":"",
      "voice_over":""
    }
  ]
}

IMPORTANT:
- Generate EXACTLY 10 scenes.
- Generate EXACTLY 10 hooks.
- Generate EXACTLY 20 SEO keywords.
- Generate EXACTLY 30 hashtags.
- Generate EXACTLY 25 tags.
- Description minimum 500 words.
- script must contain 10 objects.
- Every object must contain scene, video_prompt and voice_over.
- Story must continue from Scene 1 to Scene 10.
- Every video_prompt must be ultra cinematic.
- 4K quality.
- Hollywood style.
- Dramatic lighting.
- Emotional atmosphere.
- Ultra realistic.
- 9:16 vertical format.
- Return ONLY valid JSON.
`;

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
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
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

    } catch (e) {
      console.log("JSON Parse Failed");
      console.log(text);

      data = safeContent(topic);
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
        req.body?.topic || "Demo"
      )
    });
  }
});

// ================= START =================

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
