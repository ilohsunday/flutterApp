import express from "express";

const app = express();
app.use(express.json());

// --- Home route ---
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// --- Publish Post to Page ---
app.post("/publish", async (req, res) => {
  const { pageId, pageAccessToken, message } = req.body;

  if (!pageId || !pageAccessToken || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/${pageId}/feed?message=${encodeURIComponent(
        message
      )}&access_token=${pageAccessToken}`,
      { method: "POST" }
    );

    const data = await fbRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
