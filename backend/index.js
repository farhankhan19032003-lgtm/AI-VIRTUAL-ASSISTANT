import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import historyRouter from "./routes/history.routes.js";

// =====================================================
// CREATE APP
// =====================================================

const app = express();

// =====================================================
// PORT
// =====================================================

const PORT = process.env.PORT || 8000;

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.use("/api/history", historyRouter);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Virtual Assistant Backend is running",
  });
});

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    // =================================================
    // CONNECT MONGODB
    // =================================================

    await connectDb();

    console.log("====================================");
    console.log("DATABASE: CONNECTED");

    // =================================================
    // OPENAI CONFIGURATION
    // =================================================

    console.log(
      "OPENAI API KEY:",
      process.env.OPENAI_API_KEY
        ? "LOADED"
        : "MISSING"
    );

    console.log(
      "OPENAI MODEL:",
      process.env.OPENAI_MODEL || "NOT SET"
    );

    console.log("====================================");

    // =================================================
    // START SERVER
    // =================================================

    app.listen(PORT, () => {
      console.log(
        `Server started on port ${PORT}`
      );

      console.log(
        `http://localhost:${PORT}`
      );

      console.log(
        `History API: http://localhost:${PORT}/api/history`
      );
    });
  } catch (error) {
    console.error(
      "SERVER START ERROR:",
      error
    );

    process.exit(1);
  }
};

// =====================================================
// START
// =====================================================

startServer();