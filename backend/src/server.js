require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicines.routes");
const scheduleRoutes = require("./routes/schedules.routes");
const logRoutes = require("./routes/logs.routes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/logs", logRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server (skip in test)
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;
