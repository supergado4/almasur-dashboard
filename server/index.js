require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const authRoutes  = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");
const statsRoutes = require("./routes/stats");

// Fail fast if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET no está definido. El servidor no puede arrancar de forma segura.");
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("CORS bloqueado para origen: " + origin));
    },
    credentials: true,
  })
);

// ── BODY PARSER ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/stats", statsRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/api/health", function(_req, res) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use(function(err, _req, res, _next) {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log("API server running on port " + PORT);
  console.log("CORS allowed origins: " + allowedOrigins.join(", "));
});
