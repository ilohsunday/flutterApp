const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // allow frontend requests

// --------------------
// Facebook Posting Function
// --------------------
async function postToFacebook(message) {
  const userAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // 👈 Token from Render env
  const url = `https://graph.facebook.com/v21.0/me/feed`;

  try {
    const response = await axios.post(url, {
      message: message,
      access_token: userAccessToken,
    });
    return response.data;
  } catch (err) {
    // Log full error in server console
    console.error("Facebook Post Error:", err.response?.data || err.message);

    // Throw error with more details
    throw new Error(
      JSON.stringify(err.response?.data || { message: err.message })
    );
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
    res.status(500).json({
      error: "Failed to post to Facebook",
      details: err.message, // 👈 Show Facebook error details here
    });
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
