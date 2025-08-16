const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// --------------------
// Facebook Posting Function
// --------------------
async function postToFacebook(message) {
  const pageAccessToken = process.env.FACEBOOK_USER_TOKEN;
  const url = `https://graph.facebook.com/v21.0/me/feed`;

  try {
    const response = await axios.post(url, {
      message: message,
      access_token: pageAccessToken,
    });
    return response.data;
  } catch (err) {
    console.error("Facebook Post Error:", err.response?.data || err.message);
    throw new Error("Failed to post to Facebook");
  }
}

// --------------------
// Root Route (For Testing)
// --------------------
app.get("/", (req, res) => {
  res.send("✅ Cross-Posting API is live on Render!");
});

// --------------------
// Publish Route
// --------------------
app.post("/publish", async (req, res) => {
  const { platform, message } = req.body;

  try {
    let response;
    if (platform === "facebook") {
      response = await postToFacebook(message);
    } else {
      return res.status(400).json({ error: "Platform not supported yet" });
    }

    res.json({ success: true, platform, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
