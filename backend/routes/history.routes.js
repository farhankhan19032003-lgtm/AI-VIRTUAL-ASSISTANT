import express from "express";

import {
  saveHistory,
  getHistory,
  deleteHistory,
  clearHistory,
} from "../controllers/history.controllers.js";

import isAuth from "../middlewares/isAuth.js";

// =====================================================
// ROUTER
// =====================================================

const historyRouter = express.Router();

// =====================================================
// SAVE HISTORY
// POST /api/history/save
// =====================================================

historyRouter.post(
  "/save",
  isAuth,
  saveHistory
);

// =====================================================
// GET HISTORY
// GET /api/history
// =====================================================

historyRouter.get(
  "/",
  isAuth,
  getHistory
);

// =====================================================
// DELETE ONE HISTORY
// DELETE /api/history/:id
// =====================================================

historyRouter.delete(
  "/:id",
  isAuth,
  deleteHistory
);

// =====================================================
// DELETE ALL HISTORY
// DELETE /api/history
// =====================================================

historyRouter.delete(
  "/",
  isAuth,
  clearHistory
);

// =====================================================
// EXPORT
// =====================================================

export default historyRouter;