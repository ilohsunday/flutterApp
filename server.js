const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// --------------------
// Load Facebook App Config from environment
// --------------------
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// (Optional for now: still allow direct Page posting for your page)
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

// --------------------
// Post directly to your Page (current mode)
// --------------------
async function postToFacebookPage(message) {
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_TOKEN) {
    throw new Error("Missing PAGE_ID or PAGE_TOKEN in environment");
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}/feed`;
    const response = await axios.post(url, {
      message,
      access_token: FACEBOOK_PAGE_TOKEN,
    });

    return response.data;
  } catch (err) {
    console.error("Facebook Page Post Error:", err.response?.data || err.message);
    throw new Error(
      "Failed to post to Facebook Page: " +
        JSON.stringify(err.response?.data || err.message)
    );
  }
}

// --------------------
// Route for posting
// --------------------
app.post("/publish", async (req, res) => {
  const { platform, message } = req.body;

  try {
    let response;
    if (platform === "facebook") {
      response = await postToFacebookPage(message);
    } else {
      return res.status(400).json({ error: "Platform not supported yet" });
    }

    res.json({ success: true, platform, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Debug route: show app config
// --------------------
app.get("/config", (req, res) => {
  res.json({
    FACEBOOK_APP_ID: FACEBOOK_APP_ID ? "✅ set" : "❌ missing",
    FACEBOOK_APP_SECRET: FACEBOOK_APP_SECRET ? "✅ set" : "❌ missing",
    FACEBOOK_PAGE_ID: FACEBOOK_PAGE_ID ? "✅ set" : "❌ missing",
    FACEBOOK_PAGE_TOKEN: FACEBOOK_PAGE_TOKEN ? "✅ set" : "❌ missing",
  });
});

// --------------------
// Home Route
// --------------------
app.get("/", (req, res) => {
  res.send("✅ Cross-Posting App is running. Use POST /publish to publish content.");
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
