import mongoose from "mongoose";

// =====================================================
// HISTORY SCHEMA
// =====================================================

const historySchema = new mongoose.Schema(
  {
    // ===================================================
    // USER
    // ===================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ===================================================
    // USER MESSAGE
    // ===================================================

    userMessage: {
      type: String,
      required: true,
      trim: true,
    },

    // ===================================================
    // ASSISTANT RESPONSE
    // ===================================================

    assistantResponse: {
      type: String,
      default: "",
      trim: true,
    },

    // ===================================================
    // ACTION
    // ===================================================

    action: {
      type: String,
      default: "general",
      trim: true,
    },

    // ===================================================
    // LANGUAGE
    // ===================================================

    language: {
      type: String,
      default: "English",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// MODEL
// =====================================================

const History = mongoose.model("History", historySchema);

export default History;