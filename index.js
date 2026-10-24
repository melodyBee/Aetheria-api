require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MONGO_URL, JWT_SECRET } = process.env;
if (!MONGO_URL || !JWT_SECRET) {
  console.error("Missing MONGO_URL or JWT_SECRET in environment variables.");
  process.exit(1);
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

app.use("/api/products", require("./api/products/router"));
app.use("/api/users", require("./api/users/router"));
app.use("/api/brands", require("./api/brands/router"));
app.use("/api/category", require("./api/categories/router"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
