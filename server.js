const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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
// Serve Frontend Form
// --------------------
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cross-Posting App</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
          button { padding: 10px 20px; background: green; color: white; border: none; cursor: pointer; }
          button:hover { background: darkgreen; }
        </style>
      </head>
      <body>
        <h1>Post to Facebook</h1>
        <form method="POST" action="/publish">
          <textarea name="message" placeholder="Type your message here..."></textarea>
          <input type="hidden" name="platform" value="facebook" />
          <button type="submit">Publish</button>
        </form>
      </body>
    </html>
  `);
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

    res.send(`
      <html>
        <body style="font-family: Arial; margin: 40px;">
          <h2>✅ Successfully posted to ${platform}!</h2>
          <p><strong>Message:</strong> ${message}</p>
          <p><a href="/">Back</a></p>
        </body>
      </html>
    `);
  } catch (err) {
    res.send(`
      <html>
        <body style="font-family: Arial; margin: 40px;">
          <h2>❌ Failed to post</h2>
          <p>${err.message}</p>
          <p><a href="/">Back</a></p>
        </body>
      </html>
    `);
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
