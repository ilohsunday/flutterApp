const express = require("express");
const axios = require("axios");
//require("dotenv").config();

const app = express();
app.use(express.json());

// Example: cross-post to Facebook (later we’ll add Twitter, IG, etc.)
app.post("/post/facebook", async (req, res) => {
  const { message } = req.body;
  const token = process.env.FACEBOOK_USER_TOKEN; // stored in Render env
  const pageId = process.env.FACEBOOK_PAGE_ID;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${pageId}/feed`,
      { message, access_token: token }
    );
    res.json({ success: true, response: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Cross-posting backend is running 🚀");
});

// Port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
