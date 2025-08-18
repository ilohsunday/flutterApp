import express from "express";
import fetch from "node-fetch";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }));

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = "https://flutterapp-9u2n.onrender.com/callback"; // change if needed

// 🔹 Step 1: Login route
app.get("/login", (req, res) => {
  const fbAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
  res.redirect(fbAuthUrl);
});

// 🔹 Step 2: Callback from Facebook
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("❌ No code returned from Facebook");

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) return res.json(tokenData);

    const userAccessToken = tokenData.access_token;
    req.session.userAccessToken = userAccessToken;

    // 🔹 Fetch user’s pages
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${userAccessToken}`);
    const pagesData = await pagesRes.json();

    // Redirect back to frontend with pages JSON in query
    res.redirect(`/?pages=${encodeURIComponent(JSON.stringify(pagesData.data || []))}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Error during callback");
  }
});

// 🔹 Step 3: Publish post to selected page
app.post("/publish", async (req, res) => {
  const { pageId, pageAccessToken, message } = req.body;

  try {
    const postRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: pageAccessToken }),
    });

    const postData = await postRes.json();
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to publish post" });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
