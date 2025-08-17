const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// --------------------
// Post directly to Page
// --------------------
async function postToFacebookPage(message) {
  const pageId = process.env.FACEBOOK_PAGE_ID;  // use environment variable
  const pageAccessToken = process.env.FACEBOOK_PAGE_TOKEN;

  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const response = await axios.post(url, {
      message: message,
      access_token: pageAccessToken,
    });
    console.log("✅ Post success:", response.data);
  } catch (err) {
    console.error("❌ Facebook Page Post Error:", err.response?.data || err.message);
  }
}

// --------------------
// Test Direct Post on Startup
// --------------------
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server started… sending test post to Facebook page...");
  postToFacebookPage("🚀 Hello from server.js direct post!");
});
