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
      content: `Return ONLY valid JSON:
```

{
"title": "",
"description": "",
"hashtags": [],
"tags": [],
"hooks": [],
"script": []
}`        },
        {
          role: "user",
          content:`Create viral YouTube content for topic: ${topic}

Generate:

* SEO title
* Description
* Hashtags
* Tags
* 3 Hooks
* 5 Script Scenes

Return JSON only.`
}
]
});

```
const raw = completion.choices[0].message.content;

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
