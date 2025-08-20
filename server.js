import express from "express";
import bodyParser from "body-parser";
import cron from "node-cron";

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for scheduled posts (you can later use a DB)
let scheduledPosts = [];

// --- POST NOW route ---
app.post("/post-now", async (req, res) => {
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

// --- SCHEDULE POST route ---
app.post("/schedule-post", (req, res) => {
  const { pageId, pageAccessToken, message, scheduleTime } = req.body;

  if (!pageId || !pageAccessToken || !message || !scheduleTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Save to in-memory storage
  scheduledPosts.push({ pageId, pageAccessToken, message, scheduleTime });
  res.json({ success: true, message: "✅ Post scheduled!" });
});

// --- Cron job to check scheduled posts every minute ---
cron.schedule("* * * * *", async () => {
  const now = new Date();

  scheduledPosts = scheduledPosts.filter(async (post) => {
    const scheduledTime = new Date(post.scheduleTime);

    if (scheduledTime <= now) {
      // Time reached → publish post
      try {
        await fetch(
          `https://graph.facebook.com/${post.pageId}/feed?message=${encodeURIComponent(
            post.message
          )}&access_token=${post.pageAccessToken}`,
          { method: "POST" }
        );
        console.log("✅ Post published:", post.message);
      } catch (err) {
        console.error("❌ Failed to publish scheduled post", err.message);
      }
      return false; // remove it from the list
    }
    return true;
  });
});

// --- Serve dashboard.html ---
app.get("/dashboard", (req, res) => {
  res.sendFile("dashboard.html", { root: "./" });
});

// --- Serve scheduler.html ---
app.get("/scheduler", (req, res) => {
  res.sendFile("scheduler.html", { root: "./" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));