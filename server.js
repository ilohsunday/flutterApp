import express from "express";

const app = express();
app.use(express.json());

// Environment variables: set these on Render
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// --- Home route ---
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./" }); // Serve your index.html
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
    res.json(tokenData); // Returns access token info for testing
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Publish Post to Page ---
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
