const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");   // 👈 add this

const app = express();
app.use(bodyParser.json());
app.use(cors()); // 👈 allow requests from anywhere

// --------------------
// Facebook Posting Function
// --------------------
async function postToFacebook(message) {
  const userAccessToken = process.env.FACEBOOK_USER_TOKEN; // 👈 token from Render env
  const url = `https://graph.facebook.com/v21.0/me/feed`;

  try {
    const response = await axios.post(url, {
      message: message,
      access_token: userAccessToken,
    });
    return response.data;
  } catch (err) {
    console.error("Facebook Post Error:", err.response?.data || err.message);
    throw new Error("Failed to post to Facebook");
  }
}

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
