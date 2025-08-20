import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// ✅ Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Facebook App credentials (set them in Render environment)
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = "https://your-app.onrender.com/callback"; // change to your Render URL

// --- Home (Login Page) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Dashboard Page ---
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// --- Facebook Login Route ---
app.get("/login", (req, res) => {
  const fbAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=pages_manage_posts,pages_show_list,pages_read_engagement`;

  res.redirect(fbAuthUrl);
});

// --- Callback after Facebook login ---
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("❌ No code returned from Facebook");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&code=${code}`
    );
    const tokenData = await response.json();

    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    // ✅ Redirect to dashboard with token
    res.redirect(`/dashboard?token=${tokenData.access_token}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));