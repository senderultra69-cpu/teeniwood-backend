app.get("/api/groq-test", async (req, res) => {

try {

```
const completion =
  await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: "Say hello from Groq"
      }
    ]
  });

res.json({
  success: true,
  reply:
    completion.choices[0].message.content
});
```

} catch (error) {

```
res.status(500).json({
  success: false,
  error: error.message
});
```

}

});
