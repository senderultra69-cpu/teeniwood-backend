dekho ye he pahle ye diya tha aapne abhi dala to cal rha he import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🟢 HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "TeeniWood AI Backend Running 🚀",
    time: new Date().toISOString()
  });
});

// 🟢 TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working 🚀"
  });
});

// 🟢 MAIN GENERATE API
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, niche, engine } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required"
      });
    }

    const result = {
      title: `🔥 ${topic} Viral Story`,
      topic: topic,
      niche: niche || "General",
      engine: engine || "groq",

      description: `This is a viral AI generated story for ${topic}. Perfect for YouTube & Reels 🚀`,

      hashtags: [
        "#viral",
        "#teeniwood",
        "#ai",
        "#youtube",
        "#reels"
      ],

      tags: [
        "viral story",
        "ai video",
        "youtube shorts",
        "trending",
        "teeniwood ai"
      ],

      hooks: [
        "😱 You won't believe this story!",
        "🔥 Emotional viral twist incoming!",
        "🚀 This will blow your mind!"
      ],

      script: [
        {
          scene: "0-5 sec",
          text: `Hook scene about ${topic}`,
          visual: "Cinematic dramatic intro"
        },
        {
          scene: "5-10 sec",
          text: "Story begins with emotional setup",
          visual: "Village / cinematic background"
        },
        {
          scene: "10-15 sec",
          text: "Conflict and struggle begins",
          visual: "Dramatic tension scene"
        }
      ]
    };

    res.json({
      success: true,
      content: result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`TeeniWood AI running on port ${PORT}`);
});
