import History from "../models/history.models.js";

// =====================================================
// SAVE HISTORY
// =====================================================

export const saveHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ---------------------------------------------------
    // REQUEST DATA
    // ---------------------------------------------------

    const {
      userMessage,
      assistantResponse,
      action,
      language,
    } = req.body;

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!userMessage || !String(userMessage).trim()) {
      return res.status(400).json({
        success: false,
        message: "User message is required",
      });
    }

    // ---------------------------------------------------
    // CREATE HISTORY
    // ---------------------------------------------------

    const history = await History.create({
      user: userId,

      userMessage: String(userMessage).trim(),

      assistantResponse: String(
        assistantResponse || ""
      ).trim(),

      action: String(
        action || "general"
      ).trim(),

      language: String(
        language || "English"
      ).trim(),
    });

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "History saved",
      history,
    });
  } catch (error) {
    console.error("SAVE HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save history",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// GET HISTORY
// =====================================================

export const getHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ---------------------------------------------------
    // GET USER HISTORY
    // ---------------------------------------------------

    const history = await History.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("GET HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get history",
    });
  }
};

// =====================================================
// DELETE ONE HISTORY
// =====================================================

export const deleteHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;

    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ---------------------------------------------------
    // DELETE
    // ---------------------------------------------------

    const deleted = await History.findOneAndDelete({
      _id: id,
      user: userId,
    });

    // ---------------------------------------------------
    // NOT FOUND
    // ---------------------------------------------------

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "History deleted",
    });
  } catch (error) {
    console.error("DELETE HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete history",
    });
  }
};

// =====================================================
// DELETE ALL HISTORY
// =====================================================

export const clearHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ---------------------------------------------------
    // DELETE ALL USER HISTORY
    // ---------------------------------------------------

    await History.deleteMany({
      user: userId,
    });

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "History cleared",
    });
  } catch (error) {
    console.error("CLEAR HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear history",
    });
  }
};