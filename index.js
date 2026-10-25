require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MONGO_URL, JWT_SECRET } = process.env;
const missingEnv = !MONGO_URL || !JWT_SECRET;
if (missingEnv) {
  console.error("Missing MONGO_URL or JWT_SECRET in environment variables.");
  if (!process.env.VERCEL) process.exit(1);
}

const app = express();
// Hosts like Render/Railway give you PORT. Locally it falls back to your old port.
const port = process.env.PORT || process.env.SERVER_PORT || 8765;

// CORS_ORIGINS = comma separated list, e.g. https://zephyr-full-36aw.vercel.app,http://localhost:5173
// If it's not set, every origin is allowed (fine for testing, set it before going live).
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  })
);

app.get("/", (req, res) => res.json({ status: "Aetheria API is running" }));

// connect to MongoDB once and reuse the connection (works locally and on Vercel)
let connecting;
const connectDB = () => {
  if (!connecting) {
    connecting = mongoose
      .connect(MONGO_URL, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => {
        connecting = undefined;
        throw err;
      });
  }
  return connecting;
};

app.use(async (req, res, next) => {
  if (missingEnv) {
    return res
      .status(500)
      .json({ message: "Server not configured: set MONGO_URL and JWT_SECRET" });
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/products", require("./api/products/router"));
app.use("/api/users", require("./api/users/router"));
app.use("/api/brands", require("./api/brands/router"));
app.use("/api/category", require("./api/categories/router"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Vercel runs the exported app itself; locally we start the server
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
