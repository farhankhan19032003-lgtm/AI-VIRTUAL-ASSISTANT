import express from "express";

import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// =====================================================
// GET CURRENT USER
// =====================================================

userRouter.get(
  "/current",
  isAuth,
  getCurrentUser
);

// =====================================================
// UPDATE ASSISTANT
// =====================================================

userRouter.post(
  "/update",
  isAuth,
  upload.single("assistantImage"),
  updateAssistant
);

// =====================================================
// ASK TO ASSISTANT
// =====================================================

userRouter.post(
  "/asktoassistant",
  isAuth,
  askToAssistant
);

export default userRouter;