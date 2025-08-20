import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";

const app = express();
app.use(express.json());

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// ✅ Serve static files (CSS/JS/images if you have them)
app.use(express.static(__dirname));

// --- Routes to serve HTML pages ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/scheduler", (req, res) => {
  res.sendFile(path.join(__dirname, "scheduler.html"));
});

// --- Login route (redirect to Facebook OAuth) ---
app.get("/login", (req, res) => {
  const redirectUri = "https://flutterapp-9u2n.onrender.com/callback";
  const fbAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=pages_manage_posts,pages_show_list,pages_read_engagement`;

  res.redirect(fbAuthUrl);
});

// --- Callback after Facebook login ---
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("❌ No code returned from Facebook");

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${encodeURIComponent(
        "https://flutterapp-9u2n.onrender.com/callback"
      )}&code=${code}`
    );

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    // ✅ Redirect back to dashboard with token
    res.redirect(`/?token=${tokenData.access_token}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Get User Pages ---
app.get("/pages", async (req, res) => {
  const userToken = req.query.token;
  if (!userToken) return res.status(400).json({ error: "Missing user token" });

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${userToken}`
    );
    const data = await fbRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Publish Post Immediately ---
app.post("/publish", async (req, res) => {
  const { pageId, pageAccessToken, message } = req.body;

  if (!pageId || !pageAccessToken || !message)
    return res.status(400).json({ error: "Missing required fields" });

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

// --- Schedule Post (using node-cron) ---
let scheduledPosts = [];
app.post("/schedule", (req, res) => {
  const { pageId, pageAccessToken, message, time } = req.body;
  if (!pageId || !pageAccessToken || !message || !time)
    return res.status(400).json({ error: "Missing required fields" });

  const job = cron.schedule(time, async () => {
    try {
      await fetch(
        `https://graph.facebook.com/${pageId}/feed?message=${encodeURIComponent(
          message
        )}&access_token=${pageAccessToken}`,
        { method: "POST" }
      );
      console.log("✅ Scheduled post published:", message);
    } catch (err) {
      console.error("❌ Error publishing scheduled post:", err.message);
    }
  });

  scheduledPosts.push({ pageId, message, time, job });
  res.json({ success: true, scheduledPosts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));