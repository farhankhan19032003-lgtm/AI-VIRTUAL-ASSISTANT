import axios from "axios";
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

export const userDataContext = createContext();

function UserContext({ children }) {
  // =====================================================
  // SERVER
  // =====================================================

  const serverUrl = "https://ai-virtual-assistant-backend-apkp.onrender.com";

  // =====================================================
  // USER STATE
  // =====================================================

  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // =====================================================
  // IMAGE STATES
  // =====================================================

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // =====================================================
  // HISTORY STATES
  // =====================================================

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const handleCurrentUser = useCallback(async () => {
    try {
      setLoadingUser(true);

      console.log("====================================");
      console.log("GETTING CURRENT USER");
      console.log("====================================");

      const result = await axios.get(
        `${serverUrl}/api/user/current`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      );

      console.log(
        "CURRENT USER RESPONSE:",
        result.data
      );

      if (
        result.data?.success &&
        result.data?.user
      ) {
        setUserData(result.data.user);

        console.log(
          "CURRENT USER SET:",
          result.data.user
        );
      } else {
        console.warn(
          "No authenticated user found."
        );

        setUserData(null);
        setHistory([]);
      }
    } catch (error) {
      console.error(
        "CURRENT USER ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      setUserData(null);
      setHistory([]);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // =====================================================
  // GET HISTORY
  // =====================================================

  const getHistory = useCallback(async () => {
    try {
      if (!userData) {
        setHistory([]);
        return [];
      }

      setLoadingHistory(true);

      console.log("====================================");
      console.log("GETTING USER HISTORY");
      console.log("====================================");

      const result = await axios.get(
        `${serverUrl}/api/history`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      );

      console.log(
        "HISTORY RESPONSE:",
        result.data
      );

      if (
        result.data?.success &&
        Array.isArray(result.data?.history)
      ) {
        setHistory(result.data.history);

        return result.data.history;
      }

      setHistory([]);

      return [];
    } catch (error) {
      console.error(
        "GET HISTORY ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      setHistory([]);

      return [];
    } finally {
      setLoadingHistory(false);
    }
  }, [userData]);

  // =====================================================
  // SAVE HISTORY
  // =====================================================

  const saveHistory = useCallback(
    async ({
      userMessage,
      assistantResponse,
      action = "general",
      language = "English",
    }) => {
      try {
        if (!userData) {
          console.warn(
            "HISTORY NOT SAVED: User not logged in."
          );

          return null;
        }

        if (
          !userMessage ||
          !String(userMessage).trim()
        ) {
          console.warn(
            "HISTORY NOT SAVED: Empty user message."
          );

          return null;
        }

        console.log("====================================");
        console.log("SAVING HISTORY");
        console.log("====================================");

        const result = await axios.post(
          `${serverUrl}/api/history/save`,
          {
            userMessage: String(
              userMessage
            ).trim(),

            assistantResponse: String(
              assistantResponse || ""
            ).trim(),

            action: String(
              action || "general"
            ).trim(),

            language: String(
              language || "English"
            ).trim(),
          },
          {
            withCredentials: true,
            timeout: 15000,

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        console.log(
          "HISTORY SAVE RESPONSE:",
          result.data
        );

        if (
          result.data?.success &&
          result.data?.history
        ) {
          setHistory((previousHistory) => [
            result.data.history,
            ...previousHistory,
          ]);

          return result.data.history;
        }

        return null;
      } catch (error) {
        console.error(
          "SAVE HISTORY ERROR:",
          error?.response?.data ||
            error?.message ||
            error
        );

        return null;
      }
    },
    [userData]
  );

  // =====================================================
  // DELETE ONE HISTORY
  // =====================================================

  const deleteHistory = useCallback(
    async (historyId) => {
      try {
        if (!historyId) {
          return false;
        }

        console.log(
          "DELETING HISTORY:",
          historyId
        );

        const result = await axios.delete(
          `${serverUrl}/api/history/${historyId}`,
          {
            withCredentials: true,
            timeout: 15000,
          }
        );

        console.log(
          "DELETE HISTORY RESPONSE:",
          result.data
        );

        if (result.data?.success) {
          setHistory((previousHistory) =>
            previousHistory.filter(
              (item) =>
                item._id !== historyId
            )
          );

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "DELETE HISTORY ERROR:",
          error?.response?.data ||
            error?.message ||
            error
        );

        return false;
      }
    },
    []
  );

  // =====================================================
  // CLEAR ALL HISTORY
  // =====================================================

  const clearHistory = useCallback(
    async () => {
      try {
        console.log(
          "CLEARING ALL HISTORY"
        );

        const result = await axios.delete(
          `${serverUrl}/api/history`,
          {
            withCredentials: true,
            timeout: 15000,
          }
        );

        console.log(
          "CLEAR HISTORY RESPONSE:",
          result.data
        );

        if (result.data?.success) {
          setHistory([]);

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "CLEAR HISTORY ERROR:",
          error?.response?.data ||
            error?.message ||
            error
        );

        return false;
      }
    },
    []
  );

  // =====================================================
  // AI RESPONSE
  // =====================================================

  const getGeminiResponse = useCallback(
    async (command) => {
      const cleanCommand = String(
        command || ""
      ).trim();

      // -------------------------------------------------
      // EMPTY COMMAND
      // -------------------------------------------------

      if (!cleanCommand) {
        return {
          success: false,
          type: "general",
          userInput: "",
          response:
            "Please tell me how I can help you.",
          language: "English",
          confidence: 1,
          requiresInternet: false,
          requiresVision: false,
          requiresDocument: false,
          requiresExecution: false,
          action: "general",
        };
      }

      try {
        console.log(
          "===================================="
        );

        console.log(
          "SENDING COMMAND TO BACKEND:"
        );

        console.log(cleanCommand);

        console.log(
          "===================================="
        );

        const result = await axios.post(
          `${serverUrl}/api/user/asktoassistant`,
          {
            command: cleanCommand,
          },
          {
            withCredentials: true,
            timeout: 30000,

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        console.log(
          "FULL AI BACKEND RESPONSE:",
          result.data
        );

        const responseText =
          result.data?.response ||
          result.data?.message ||
          "";

        const responseLanguage =
          result.data?.language ||
          "English";

        const responseAction =
          result.data?.action ||
          "general";

        // -------------------------------------------------
        // SAVE HISTORY
        // -------------------------------------------------

        if (
          result.data?.success !== false &&
          cleanCommand
        ) {
          await saveHistory({
            userMessage: cleanCommand,

            assistantResponse:
              responseText,

            action:
              responseAction,

            language:
              responseLanguage,
          });
        }

        return result.data;
      } catch (error) {
        console.error(
          "===================================="
        );

        console.error(
          "AI RESPONSE ERROR"
        );

        console.error(
          "STATUS:",
          error?.response?.status
        );

        console.error(
          "DATA:",
          error?.response?.data
        );

        console.error(
          "MESSAGE:",
          error?.message
        );

        console.error(
          "===================================="
        );

        return {
          success: false,
          type: "general",
          userInput: cleanCommand,
          response:
            "Sorry, I could not connect to the AI server.",
          language: "English",
          confidence: 0,
          requiresInternet: false,
          requiresVision: false,
          requiresDocument: false,
          requiresExecution: false,
          action: "general",
          error: true,
        };
      }
    },
    [saveHistory]
  );

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    if (userData) {
      getHistory();
    } else {
      setHistory([]);
    }
  }, [userData, getHistory]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    // SERVER
    serverUrl,

    // USER
    userData,
    setUserData,
    loadingUser,
    handleCurrentUser,

    // IMAGES
    frontendImage,
    setFrontendImage,

    backendImage,
    setBackendImage,

    selectedImage,
    setSelectedImage,

    // AI
    getGeminiResponse,

    // HISTORY
    history,
    setHistory,
    loadingHistory,
    getHistory,
    saveHistory,
    deleteHistory,
    clearHistory,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;
