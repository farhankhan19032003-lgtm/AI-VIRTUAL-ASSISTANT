
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import openaiResponse from "../openai.js";
import moment from "moment";

import {
  getConversationContext,
  addUserMessage,
  addAssistantMessage,
  limitHistory,
} from "../services/conversation.js";

// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUser = async (req, res) => {
  try {
    const userId =
      req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(
      "Get Current User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

// =====================================================
// UPDATE ASSISTANT
// =====================================================

export const updateAssistant = async (req, res) => {
  try {
    const userId =
      req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const assistantName =
      req.body?.assistantName;

    if (
      assistantName !== undefined &&
      String(assistantName).trim()
    ) {
      user.assistantName =
        String(assistantName).trim();
    }

    // =================================================
    // UPLOAD CUSTOM IMAGE
    // =================================================

    if (req.file) {
      const uploadedImage =
        await uploadOnCloudinary(
          req.file.path
        );

      if (uploadedImage?.secure_url) {
        user.assistantImage =
          uploadedImage.secure_url;
      }
    }

    // =================================================
    // SAVE PREDEFINED IMAGE
    // =================================================

    if (
      req.body?.imageUrl &&
      String(req.body.imageUrl).trim()
    ) {
      user.assistantImage =
        String(req.body.imageUrl).trim();
    }

    // =================================================
    // SAVE USER
    // =================================================

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Assistant updated successfully",
      user,
    });

  } catch (error) {
    console.error(
      "Update Assistant Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update assistant",
      error: error.message,
    });
  }
};

// =====================================================
// ASK TO ASSISTANT
// =====================================================

export const askToAssistant = async (req, res) => {
  try {
    const userId =
      req.userId || req.user?._id;

    // =================================================
    // AUTH CHECK
    // =================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // =================================================
    // GET COMMAND
    // =================================================

    const {
      command,
      userInput,
    } = req.body || {};

    const finalCommand =
      String(
        command ||
        userInput ||
        ""
      ).trim();

    if (!finalCommand) {
      return res.status(400).json({
        success: false,
        message: "Command is required",
      });
    }

    // =================================================
    // GET USER
    // =================================================

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // USER / ASSISTANT NAME
    // =================================================

    const assistantName =
      user.assistantName ||
      user.name ||
      "Nova";

    const userName =
      user.name ||
      "User";

    // =================================================
    // GET CONVERSATION MEMORY
    // =================================================

    const conversationContext =
      getConversationContext(
        user.history || []
      );

    // =================================================
    // LOG REQUEST
    // =================================================

    console.log(
      "===================================="
    );

    console.log(
      "ASK TO ASSISTANT"
    );

    console.log(
      "USER:",
      userName
    );

    console.log(
      "ASSISTANT:",
      assistantName
    );

    console.log(
      "COMMAND:",
      finalCommand
    );

    console.log(
      "CONVERSATION MEMORY:",
      conversationContext
    );

    console.log(
      "===================================="
    );

    // =================================================
    // OPENAI RESPONSE
    // =================================================

    const result =
      await openaiResponse(
        finalCommand,
        assistantName,
        userName,
        conversationContext
      );

    console.log(
      "OPENAI RESULT:",
      result
    );

    // =================================================
    // GET EXISTING HISTORY
    // =================================================

    let updatedHistory =
      Array.isArray(user.history)
        ? [...user.history]
        : [];

    // =================================================
    // SAVE USER MESSAGE
    // =================================================

    updatedHistory =
      addUserMessage(
        updatedHistory,
        finalCommand
      );

    // =================================================
    // SAVE ASSISTANT RESPONSE
    // =================================================

    if (
      result?.response &&
      String(result.response).trim()
    ) {
      updatedHistory =
        addAssistantMessage(
          updatedHistory,
          result.response
        );
    }

    // =================================================
    // LIMIT HISTORY
    // =================================================

    updatedHistory =
      limitHistory(
        updatedHistory,
        12
      );

    // =================================================
    // SAVE HISTORY TO MONGODB
    // =================================================

    user.history =
      updatedHistory;

    await user.save();

    console.log(
      "CONVERSATION SAVED"
    );

    console.log(
      "HISTORY ITEMS:",
      updatedHistory.length
    );

    // =================================================
    // FINAL RESPONSE
    // =================================================

    console.log(
      "FINAL ASSISTANT RESPONSE:",
      result
    );

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "Ask To Assistant Error:",
      error
    );

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,

      type: "general",

      userInput:
        req.body?.command ||
        req.body?.userInput ||
        "",

      response:
        "Sorry, I couldn't process your request right now.",

      language: "English",

      confidence: 0,

      requiresInternet: false,

      requiresVision: false,

      requiresDocument: false,

      requiresExecution: false,

      action: "general",

      sources: [],
    });
  }
};

