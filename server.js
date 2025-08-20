const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// ===== ROUTES =====

// Login route (already working for Facebook)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// After login success → redirect to dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Scheduler page
app.get("/scheduler", (req, res) => {
  res.sendFile(path.join(__dirname, "scheduler.html"));
});

// Example API for posting to FB (placeholder)
app.post("/api/post", (req, res) => {
  const { message, scheduledTime } = req.body;
  console.log("New post:", message, "Scheduled:", scheduledTime);
  res.json({ success: true, message: "Post scheduled successfully!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));