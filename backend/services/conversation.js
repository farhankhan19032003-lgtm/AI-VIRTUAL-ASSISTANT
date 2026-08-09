// =====================================================
// CONVERSATION MEMORY SERVICE
// =====================================================

const MAX_HISTORY_ITEMS = 12;

// =====================================================
// GET RECENT HISTORY
// =====================================================

export const getConversationContext = (
  history = []
) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim()
    )
    .slice(-MAX_HISTORY_ITEMS);
};

// =====================================================
// ADD USER MESSAGE
// =====================================================

export const addUserMessage = (
  history,
  message
) => {
  const currentHistory =
    Array.isArray(history)
      ? history
      : [];

  const cleanMessage =
    String(message || "").trim();

  if (!cleanMessage) {
    return currentHistory;
  }

  currentHistory.push(
    `User: ${cleanMessage}`
  );

  return currentHistory;
};

// =====================================================
// ADD ASSISTANT MESSAGE
// =====================================================

export const addAssistantMessage = (
  history,
  message
) => {
  const currentHistory =
    Array.isArray(history)
      ? history
      : [];

  const cleanMessage =
    String(message || "").trim();

  if (!cleanMessage) {
    return currentHistory;
  }

  currentHistory.push(
    `Assistant: ${cleanMessage}`
  );

  return currentHistory;
};

// =====================================================
// LIMIT HISTORY
// =====================================================

export const limitHistory = (
  history,
  maxItems = MAX_HISTORY_ITEMS
) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.slice(-maxItems);
};

// =====================================================
// FORMAT HISTORY FOR OPENAI
// =====================================================

export const formatHistoryForAI = (
  history = []
) => {
  const recentHistory =
    getConversationContext(history);

  if (!recentHistory.length) {
    return "No previous conversation.";
  }

  return recentHistory.join("\n");
};