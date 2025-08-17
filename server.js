const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// --------------------
// Post directly to Page with Page Token
// --------------------
async function postToFacebookPage(message) {
  const pageId = process.env.FACEBOOK_PAGE_ID; // Put your Page ID here
  const pageAccessToken = process.env.FACEBOOK_PAGE_TOKEN; // Permanent Page Token

  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const response = await axios.post(url, {
      message: message,
      access_token: pageAccessToken,
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
// Publish Route
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
