app.post("/api/generate", async (req, res) => {
try {
const { topic } = req.body;

```
if (!topic) {
  return res.status(400).json({
    error: "Topic required"
  });
}

res.json({
  success: true,
  content: {
    title: `🔥 ${topic} Viral Story`,
    description: `Generated content for ${topic}`,
    hashtags: ["#viral", "#teeniwood"],
    tags: ["viral", "youtube"],
    hooks: ["Hook 1", "Hook 2", "Hook 3"],
    script: ["Scene 1", "Scene 2", "Scene 3"]
  }
});
```

} catch (error) {
console.error(error);

```
res.status(500).json({
  success: false,
  error: error.message
});
```

}
});
