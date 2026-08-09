import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import bg from "../assets/authBg.png";
import { userDataContext } from "../context/userContext";

function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,

    history,
    loadingHistory,
    deleteHistory,
    clearHistory,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // =====================================================
  // REFS
  // =====================================================

  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const networkRetryRef = useRef(0);

  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const awakeRef = useRef(false);

  const mountedRef = useRef(true);
  const startingRef = useRef(false);

  const shouldListenRef = useRef(true);

  // =====================================================
  // STATES
  // =====================================================

  const [statusText, setStatusText] =
    useState("Ready");

  const [isListening, setIsListening] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [heardText, setHeardText] =
    useState("");

  const [responseText, setResponseText] =
    useState("");

  const [showHistory, setShowHistory] =
    useState(false);

  const [loginGreetingShown, setLoginGreetingShown] =
    useState(false);

  // =====================================================
  // ASSISTANT NAME
  // =====================================================

  const assistantName = useMemo(() => {
    return (
      String(
        userData?.assistantName ||
          "Jarvis"
      ).trim() || "Jarvis"
    );
  }, [userData]);

  // =====================================================
  // ASSISTANT IMAGE
  // =====================================================

  const assistantImage = useMemo(() => {
    return String(
      userData?.assistantImage ||
        userData?.image ||
        userData?.profileImage ||
        ""
    ).trim();
  }, [userData]);

  // =====================================================
  // CLEAR RESTART TIMER
  // =====================================================

  const clearRestartTimer =
    useCallback(() => {
      if (restartTimerRef.current) {
        clearTimeout(
          restartTimerRef.current
        );

        restartTimerRef.current = null;
      }
    }, []);

  // =====================================================
  // STOP EVERYTHING
  // =====================================================

  const stopEverything =
    useCallback(() => {
      clearRestartTimer();

      shouldListenRef.current = false;

      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn(
          "Speech synthesis cancel error:",
          error
        );
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Already stopped.
        }
      }

      listeningRef.current = false;
      speakingRef.current = false;
      processingRef.current = false;
      awakeRef.current = false;
      startingRef.current = false;

      if (mountedRef.current) {
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(false);
        setStatusText("Ready");
      }
    }, [clearRestartTimer]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      stopEverything();

      await axios.get(
        `${serverUrl}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );

      setUserData(null);

      navigate("/signin");
    } catch (error) {
      console.error(
        "Logout Error:",
        error?.response?.data ||
          error?.message ||
          error
      );
    }
  };

  // =====================================================
  // WAKE WORDS
  // =====================================================

  const getWakeWords =
    useCallback(() => {
      const name = assistantName
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      if (!name) {
        return [
          "jarvis",
          "hey jarvis",
          "hello jarvis",
        ];
      }

      const words = [
        name,
        `hey ${name}`,
        `hello ${name}`,
        `hi ${name}`,
        `ok ${name}`,
        `okay ${name}`,
        `${name} please`,
      ];

      if (name !== "jarvis") {
        words.push("jarvis");
        words.push("hey jarvis");
        words.push("hello jarvis");
      }

      return [...new Set(words)];
    }, [assistantName]);

  // =====================================================
  // FIND WAKE WORD
  // =====================================================

  const findWakeWord =
    useCallback(
      (text) => {
        const transcript = String(
          text || ""
        )
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

        if (!transcript) {
          return null;
        }

        const wakeWords =
          getWakeWords();

        const sortedWords = [
          ...wakeWords,
        ].sort(
          (a, b) =>
            b.length - a.length
        );

        for (const word of sortedWords) {
          const escaped =
            word.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );

          const regex =
            new RegExp(
              `^(?:${escaped})(?:\\s|[,.:;!?]|$)`,
              "i"
            );

          if (
            regex.test(transcript)
          ) {
            return word;
          }
        }

        return null;
      },
      [getWakeWords]
    );

  // =====================================================
  // REMOVE WAKE WORD
  // =====================================================

  const removeWakeWord =
    useCallback(
      (transcript, wakeWord) => {
        if (!wakeWord) {
          return String(
            transcript || ""
          ).trim();
        }

        const text = String(
          transcript || ""
        ).trim();

        return text
          .slice(
            String(wakeWord).length
          )
          .replace(
            /^[\s,.:;!?-]+/,
            ""
          )
          .trim();
      },
      []
    );

  // =====================================================
  // SPEAK
  // =====================================================

  const speak = useCallback(
    (text, language = "English") => {
      return new Promise(
        (resolve) => {
          const cleanText =
            String(text || "")
              .trim();

          if (!cleanText) {
            resolve();
            return;
          }

          console.log(
            "Assistant Speaking:",
            cleanText
          );

          try {
            window.speechSynthesis.cancel();
          } catch {
            // Ignore.
          }

          if (
            recognitionRef.current
          ) {
            try {
              recognitionRef.current.stop();
            } catch {
              // Ignore.
            }
          }

          listeningRef.current =
            false;

          speakingRef.current =
            true;

          startingRef.current =
            false;

          if (mountedRef.current) {
            setIsListening(false);
            setIsThinking(false);
            setIsSpeaking(true);
            setStatusText(
              "Speaking"
            );
          }

          const utterance =
            new SpeechSynthesisUtterance(
              cleanText
            );

          const selectedLanguage =
            String(
              language || "English"
            ).toLowerCase();

          if (
            selectedLanguage.includes(
              "hindi"
            ) ||
            selectedLanguage.includes(
              "hinglish"
            ) ||
            selectedLanguage.includes(
              "urdu"
            )
          ) {
            utterance.lang =
              "hi-IN";
          } else {
            utterance.lang =
              "en-US";
          }

          utterance.rate = 1.05;
          utterance.pitch = 1;
          utterance.volume = 1;

          let finished = false;

          const finishSpeaking =
            () => {
              if (finished) {
                return;
              }

              finished = true;

              speakingRef.current =
                false;

              if (
                mountedRef.current
              ) {
                setIsSpeaking(false);
              }

              resolve();
            };

          utterance.onend =
            finishSpeaking;

          utterance.onerror =
            finishSpeaking;

          try {
            window.speechSynthesis.speak(
              utterance
            );
          } catch (error) {
            console.error(
              "Speech synthesis error:",
              error
            );

            speakingRef.current =
              false;

            if (
              mountedRef.current
            ) {
              setIsSpeaking(false);
            }

            resolve();
          }
        }
      );
    },
    []
  );

  // =====================================================
  // RESPONSE EXTRACTOR
  // =====================================================

  const getResponseText =
    useCallback((data) => {
      if (!data) {
        return "";
      }

      const possibleFields = [
        "response",
        "answer",
        "message",
        "reply",
        "text",
      ];

      for (
        const field of possibleFields
      ) {
        if (
          typeof data[field] ===
            "string" &&
          data[field].trim()
        ) {
          return data[field].trim();
        }
      }

      return "";
    }, []);

  // =====================================================
  // OPEN WEBSITE
  // =====================================================

  const openWebsite =
    useCallback((url) => {
      if (!url) {
        return false;
      }

      try {
        const newWindow =
          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          );

        if (newWindow) {
          try {
            newWindow.opener =
              null;
          } catch {
            // Ignore.
          }

          console.log(
            "Website opened in new tab."
          );

          return true;
        }

        window.location.href =
          url;

        return true;
      } catch (error) {
        console.error(
          "Website opening error:",
          error
        );

        try {
          window.location.href =
            url;

          return true;
        } catch {
          return false;
        }
      }
    }, []);

  // =====================================================
  // CLEAN SEARCH QUERY
  // =====================================================

  const cleanSearchQuery =
    useCallback(
      (text, words = []) => {
        let query =
          String(text || "").trim();

        words.forEach((word) => {
          if (!word) {
            return;
          }

          const escaped =
            String(word).replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );

          query = query.replace(
            new RegExp(
              `\\b${escaped}\\b`,
              "gi"
            ),
            ""
          );
        });

        return query
          .replace(
            /[,.!?]+/g,
            " "
          )
          .replace(
            /\s+/g,
            " "
          )
          .trim();
      },
      []
    );

  // =====================================================
  // NORMALIZE ACTION
  // =====================================================

  const normalizeAction =
    useCallback(
      (rawAction, input) => {
        const action =
          String(
            rawAction || ""
          )
            .trim()
            .toLowerCase()
            .replace(
              /[\s-]+/g,
              "_"
            );

        const command =
          String(input || "")
            .trim()
            .toLowerCase();

        const aliases = {
          instagram:
            "instagram_open",
          open_instagram:
            "instagram_open",
          instagram_open:
            "instagram_open",

          facebook:
            "facebook_open",
          open_facebook:
            "facebook_open",
          facebook_open:
            "facebook_open",

          youtube:
            "youtube_open",
          open_youtube:
            "youtube_open",
          youtube_open:
            "youtube_open",

          linkedin:
            "linkedin_open",
          open_linkedin:
            "linkedin_open",
          linkedin_open:
            "linkedin_open",

          github:
            "github_open",
          open_github:
            "github_open",
          github_open:
            "github_open",

          gmail:
            "gmail_open",
          open_gmail:
            "gmail_open",
          gmail_open:
            "gmail_open",

          whatsapp:
            "whatsapp_open",
          open_whatsapp:
            "whatsapp_open",
          whatsapp_open:
            "whatsapp_open",

          telegram:
            "telegram_open",
          open_telegram:
            "telegram_open",
          telegram_open:
            "telegram_open",

          spotify:
            "spotify_open",
          open_spotify:
            "spotify_open",
          spotify_open:
            "spotify_open",

          netflix:
            "netflix_open",
          open_netflix:
            "netflix_open",
          netflix_open:
            "netflix_open",

          chatgpt:
            "chatgpt_open",
          open_chatgpt:
            "chatgpt_open",
          chatgpt_open:
            "chatgpt_open",

          gemini:
            "gemini_open",
          open_gemini:
            "gemini_open",
          gemini_open:
            "gemini_open",
        };

        if (aliases[action]) {
          return aliases[action];
        }

        const openWords = [
          "open",
          "kholo",
          "khol",
          "chalao",
          "launch",
          "start",
        ];

        const hasOpenWord =
          openWords.some(
            (word) =>
              command.includes(word)
          );

        if (hasOpenWord) {
          if (
            command.includes(
              "instagram"
            )
          ) {
            return "instagram_open";
          }

          if (
            command.includes(
              "facebook"
            )
          ) {
            return "facebook_open";
          }

          if (
            command.includes(
              "youtube"
            )
          ) {
            return "youtube_open";
          }

          if (
            command.includes(
              "linkedin"
            )
          ) {
            return "linkedin_open";
          }

          if (
            command.includes("github")
          ) {
            return "github_open";
          }

          if (
            command.includes("gmail")
          ) {
            return "gmail_open";
          }

          if (
            command.includes(
              "whatsapp"
            )
          ) {
            return "whatsapp_open";
          }

          if (
            command.includes(
              "telegram"
            )
          ) {
            return "telegram_open";
          }

          if (
            command.includes(
              "spotify"
            )
          ) {
            return "spotify_open";
          }

          if (
            command.includes(
              "netflix"
            )
          ) {
            return "netflix_open";
          }

          if (
            command.includes(
              "chatgpt"
            )
          ) {
            return "chatgpt_open";
          }

          if (
            command.includes(
              "gemini"
            )
          ) {
            return "gemini_open";
          }
        }

        return action || "general";
      },
      []
    );

  // =====================================================
  // EXECUTE BROWSER ACTION
  // =====================================================

  const executeAction =
    useCallback(
      (data, command) => {
        if (!data) {
          return false;
        }

        const input = String(
          data.userInput ||
            data.command ||
            command ||
            ""
        ).trim();

        const action =
          normalizeAction(
            data.action ||
              data.type ||
              "general",
            input
          );

        console.log(
          "===================================="
        );

        console.log(
          "NORMALIZED ACTION:",
          action
        );

        console.log(
          "ACTION INPUT:",
          input
        );

        console.log(
          "===================================="
        );

        // GOOGLE SEARCH

        if (
          action === "google_search"
        ) {
          const query =
            cleanSearchQuery(
              input,
              [
                "google",
                "search",
                "for",
                "search for",
                "par",
                "pe",
                "karo",
                "kijiye",
              ]
            ) || input;

          return openWebsite(
            `https://www.google.com/search?q=${encodeURIComponent(
              query
            )}`
          );
        }

        // GOOGLE OPEN

        if (
          action === "google_open" ||
          action ===
            "browser_open" ||
          action === "google"
        ) {
          return openWebsite(
            "https://www.google.com"
          );
        }

        // YOUTUBE OPEN

        if (
          action ===
          "youtube_open"
        ) {
          return openWebsite(
            "https://www.youtube.com"
          );
        }

        // YOUTUBE SEARCH

        if (
          action ===
          "youtube_search"
        ) {
          const query =
            cleanSearchQuery(
              input,
              [
                "youtube",
                "search",
                "for",
                "search for",
                "par",
                "pe",
                "karo",
                "kijiye",
              ]
            ) || input;

          return openWebsite(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              query
            )}`
          );
        }

        // YOUTUBE PLAY

        if (
          action ===
            "youtube_play" ||
          action ===
            "music_play" ||
          action ===
            "video_play"
        ) {
          const query =
            cleanSearchQuery(
              input,
              [
                "youtube",
                "play",
                "please play",
                "chalao",
                "chala",
                "bajao",
                "baja do",
                "music",
                "song",
                "gana",
                "gaana",
                "par",
                "pe",
                "karo",
                "kijiye",
              ]
            ) || "music";

          return openWebsite(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              query
            )}`
          );
        }

        // WEBSITES

        const websites = {
          instagram_open:
            "https://www.instagram.com/",

          facebook_open:
            "https://www.facebook.com/",

          linkedin_open:
            "https://www.linkedin.com/",

          github_open:
            "https://github.com/",

          gmail_open:
            "https://mail.google.com/",

          whatsapp_open:
            "https://web.whatsapp.com/",

          telegram_open:
            "https://web.telegram.org/",

          discord_open:
            "https://discord.com/app",

          reddit_open:
            "https://www.reddit.com/",

          twitter_open:
            "https://x.com/",

          spotify_open:
            "https://open.spotify.com/",

          netflix_open:
            "https://www.netflix.com/",

          chatgpt_open:
            "https://chatgpt.com/",

          gemini_open:
            "https://gemini.google.com/",

          canva_open:
            "https://www.canva.com/",

          kaggle_open:
            "https://www.kaggle.com/",

          colab_open:
            "https://colab.research.google.com/",

          stackoverflow_open:
            "https://stackoverflow.com/",

          google_drive_open:
            "https://drive.google.com/",

          google_maps_open:
            "https://maps.google.com/",

          google_docs_open:
            "https://docs.google.com/",

          google_sheets_open:
            "https://sheets.google.com/",

          amazon_open:
            "https://www.amazon.in/",

          flipkart_open:
            "https://www.flipkart.com/",
        };

        if (websites[action]) {
          return openWebsite(
            websites[action]
          );
        }

        // WEATHER

        if (
          action ===
          "weather_show"
        ) {
          return openWebsite(
            `https://www.google.com/search?q=${encodeURIComponent(
              input ||
                "weather today"
            )}`
          );
        }

        // NEWS

        if (
          action ===
            "news_search" ||
          action ===
            "current_affairs"
        ) {
          return openWebsite(
            `https://news.google.com/search?q=${encodeURIComponent(
              input ||
                "latest news today"
            )}`
          );
        }

        // CALCULATOR

        if (
          action ===
          "calculator_open"
        ) {
          return openWebsite(
            "https://www.google.com/search?q=calculator"
          );
        }

        // CAMERA

        if (
          action ===
          "camera_open"
        ) {
          return openWebsite(
            "https://webcamtests.com/"
          );
        }

        console.log(
          "No browser action required:",
          action
        );

        return false;
      },
      [
        cleanSearchQuery,
        normalizeAction,
        openWebsite,
      ]
    );

  // =====================================================
  // START RECOGNITION
  // =====================================================

  const startRecognition =
    useCallback(() => {
      const recognition =
        recognitionRef.current;

      if (!recognition) {
        return;
      }

      if (
        !shouldListenRef.current
      ) {
        return;
      }

      if (
        listeningRef.current ||
        speakingRef.current ||
        processingRef.current ||
        startingRef.current
      ) {
        return;
      }

      try {
        startingRef.current =
          true;

        recognition.start();

        console.log(
          "Recognition start requested"
        );
      } catch (error) {
        startingRef.current =
          false;

        console.log(
          "Recognition start ignored:",
          error?.message
        );
      }
    }, []);

  // =====================================================
  // STOP RECOGNITION
  // =====================================================

  const stopRecognition =
    useCallback(() => {
      const recognition =
        recognitionRef.current;

      clearRestartTimer();

      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Already stopped.
        }
      }

      listeningRef.current =
        false;

      startingRef.current =
        false;

      if (mountedRef.current) {
        setIsListening(false);
      }
    }, [clearRestartTimer]);

  // =====================================================
  // RETURN TO STANDBY
  // =====================================================

  const returnToStandby =
    useCallback(
      (delay = 400) => {
        clearRestartTimer();

        awakeRef.current =
          false;

        processingRef.current =
          false;

        shouldListenRef.current =
          true;

        if (mountedRef.current) {
          setIsThinking(false);
          setIsSpeaking(false);

          setStatusText(
            `Say ${assistantName}`
          );
        }

        restartTimerRef.current =
          setTimeout(() => {
            if (
              mountedRef.current &&
              shouldListenRef.current &&
              !speakingRef.current &&
              !processingRef.current &&
              !listeningRef.current
            ) {
              startRecognition();
            }
          }, delay);
      },
      [
        assistantName,
        clearRestartTimer,
        startRecognition,
      ]
    );

  // =====================================================
  // PROCESS COMMAND
  // =====================================================

  const processCommand =
    useCallback(
      async (command) => {
        const cleanCommand =
          String(command || "").trim();

        if (!cleanCommand) {
          returnToStandby();
          return;
        }

        if (
          processingRef.current
        ) {
          return;
        }

        processingRef.current =
          true;

        awakeRef.current =
          true;

        console.log(
          "================================"
        );

        console.log(
          "USER COMMAND:",
          cleanCommand
        );

        console.log(
          "================================"
        );

        stopRecognition();

        if (mountedRef.current) {
          setIsThinking(true);
          setIsSpeaking(false);
          setStatusText("Thinking");
        }

        try {
          const data =
            await getGeminiResponse(
              cleanCommand
            );

          console.log(
            "FULL BACKEND RESPONSE:",
            data
          );

          // Execute browser action
          executeAction(
            data,
            cleanCommand
          );

          const finalResponse =
            getResponseText(data);

          // Show response text
          if (mountedRef.current) {
            setResponseText(
              finalResponse
            );
          }

          console.log(
            "FINAL RESPONSE:",
            finalResponse
          );

          // Speak response
          if (finalResponse) {
            await speak(
              finalResponse,
              data?.language ||
                "English"
            );
          }

          awakeRef.current =
            false;

          processingRef.current =
            false;

          if (mountedRef.current) {
            setIsThinking(false);
            setIsSpeaking(false);

            setStatusText(
              `Say ${assistantName}`
            );
          }

          clearRestartTimer();

          restartTimerRef.current =
            setTimeout(() => {
              if (
                mountedRef.current &&
                shouldListenRef.current &&
                !speakingRef.current &&
                !processingRef.current
              ) {
                startRecognition();
              }
            }, 450);
        } catch (error) {
          console.error(
            "ASSISTANT ERROR:",
            error
          );

          awakeRef.current =
            false;

          processingRef.current =
            false;

          const errorText =
            "Sorry, I could not connect to the AI server.";

          if (mountedRef.current) {
            setResponseText(
              errorText
            );

            setIsThinking(false);

            setStatusText(
              "Connection error"
            );
          }

          await speak(
            errorText,
            "English"
          );

          returnToStandby(500);
        }
      },
      [
        assistantName,
        clearRestartTimer,
        executeAction,
        getGeminiResponse,
        getResponseText,
        returnToStandby,
        speak,
        startRecognition,
        stopRecognition,
      ]
    );

  // =====================================================
  // SPEECH RECOGNITION
  // =====================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!userData) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText(
        "Speech recognition unavailable"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognitionRef.current =
      recognition;

    // ===================================================
    // CONFIG
    // ===================================================

    recognition.continuous = true;
    recognition.interimResults = false;

    // en-IN works well for English/Hinglish
    recognition.lang = "en-IN";

    recognition.maxAlternatives = 1;

    shouldListenRef.current =
      true;

    awakeRef.current = false;

    // ===================================================
    // ON START
    // ===================================================

    recognition.onstart = () => {
      startingRef.current =
        false;

      listeningRef.current =
        true;

      networkRetryRef.current =
        0;

      if (mountedRef.current) {
        setIsListening(true);

        if (!awakeRef.current) {
          setStatusText(
            `Listening for ${assistantName}`
          );
        } else {
          setStatusText(
            "Listening"
          );
        }
      }

      console.log(
        "Wake-word standby listening"
      );
    };

    // ===================================================
    // ON RESULT
    // ===================================================

    recognition.onresult =
      async (event) => {
        if (
          speakingRef.current ||
          processingRef.current
        ) {
          return;
        }

        const resultIndex =
          event.results.length - 1;

        const result =
          event.results[
            resultIndex
          ];

        if (
          !result ||
          !result.isFinal
        ) {
          return;
        }

        const transcript =
          result[0]?.transcript
            ?.trim()
            ?.toLowerCase();

        if (!transcript) {
          return;
        }

        console.log(
          "HEARD:",
          transcript
        );

        // SHOW LIVE USER TEXT
        if (mountedRef.current) {
          setHeardText(
            transcript
          );
        }

        // =================================================
        // STANDBY
        // =================================================

        if (!awakeRef.current) {
          const wakeWord =
            findWakeWord(
              transcript
            );

          if (!wakeWord) {
            console.log(
              "No wake word. Ignoring command."
            );

            return;
          }

          console.log(
            "WAKE WORD DETECTED:",
            wakeWord
          );

          awakeRef.current =
            true;

          const command =
            removeWakeWord(
              transcript,
              wakeWord
            );

          console.log(
            "COMMAND AFTER WAKE WORD:",
            command
          );

          // =================================================
          // ONLY JARVIS
          // =================================================

          if (!command) {
            stopRecognition();

            const greeting =
              `Hello. How can I help you?`;

            if (mountedRef.current) {
              setResponseText(
                greeting
              );
            }

            await speak(
              greeting,
              "English"
            );

            awakeRef.current =
              false;

            if (mountedRef.current) {
              setStatusText(
                `Say ${assistantName}`
              );
            }

            returnToStandby(400);

            return;
          }

          // =================================================
          // JARVIS + COMMAND
          // =================================================

          await processCommand(
            command
          );

          return;
        }

        // =================================================
        // ALREADY AWAKE
        // =================================================

        const command =
          transcript.trim();

        if (!command) {
          return;
        }

        await processCommand(
          command
        );
      };

    // ===================================================
    // ON ERROR
    // ===================================================

    recognition.onerror =
      (event) => {
        const errorType =
          event?.error;

        console.error(
          "Speech Recognition Error:",
          errorType
        );

        listeningRef.current =
          false;

        startingRef.current =
          false;

        if (mountedRef.current) {
          setIsListening(false);
        }

        // MICROPHONE PERMISSION

        if (
          errorType ===
            "not-allowed" ||
          errorType ===
            "service-not-allowed"
        ) {
          shouldListenRef.current =
            false;

          if (mountedRef.current) {
            setStatusText(
              "Microphone permission required"
            );
          }

          return;
        }

        // INTENTIONAL ABORT

        if (
          errorType === "aborted"
        ) {
          return;
        }

        // NO SPEECH

        if (
          errorType === "no-speech"
        ) {
          if (mountedRef.current) {
            setStatusText(
              `Listening for ${assistantName}`
            );
          }

          return;
        }

        // NETWORK

        if (
          errorType === "network"
        ) {
          networkRetryRef.current +=
            1;

          const retryCount =
            networkRetryRef.current;

          console.warn(
            `Speech network recovery attempt ${retryCount}`
          );

          if (mountedRef.current) {
            setStatusText(
              "Reconnecting microphone"
            );
          }

          clearRestartTimer();

          const retryDelay =
            Math.min(
              1200 * retryCount,
              5000
            );

          restartTimerRef.current =
            setTimeout(() => {
              if (
                mountedRef.current &&
                shouldListenRef.current &&
                !speakingRef.current &&
                !processingRef.current &&
                !listeningRef.current
              ) {
                startRecognition();
              }
            }, retryDelay);

          return;
        }

        if (mountedRef.current) {
          setStatusText(
            `Listening for ${assistantName}`
          );
        }
      };

    // ===================================================
    // ON END
    // ===================================================

    recognition.onend = () => {
      listeningRef.current =
        false;

      startingRef.current =
        false;

      if (mountedRef.current) {
        setIsListening(false);
      }

      console.log(
        "Recognition ended"
      );

      if (
        speakingRef.current ||
        processingRef.current ||
        !shouldListenRef.current
      ) {
        return;
      }

      clearRestartTimer();

      restartTimerRef.current =
        setTimeout(() => {
          if (
            mountedRef.current &&
            shouldListenRef.current &&
            !speakingRef.current &&
            !processingRef.current &&
            !listeningRef.current
          ) {
            startRecognition();
          }
        }, 500);
    };

    // ===================================================
    // INITIAL START
    // ===================================================

    const initialTimer =
      setTimeout(() => {
        if (
          mountedRef.current &&
          shouldListenRef.current &&
          !speakingRef.current &&
          !processingRef.current
        ) {
          startRecognition();
        }
      }, 900);

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      mountedRef.current =
        false;

      clearTimeout(
        initialTimer
      );

      clearRestartTimer();

      shouldListenRef.current =
        false;

      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore.
      }

      try {
        recognition.stop();
      } catch {
        // Ignore.
      }

      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      if (
        recognitionRef.current ===
        recognition
      ) {
        recognitionRef.current =
          null;
      }

      listeningRef.current =
        false;

      speakingRef.current =
        false;

      processingRef.current =
        false;

      awakeRef.current =
        false;

      startingRef.current =
        false;
    };
  }, [
    assistantName,
    clearRestartTimer,
    findWakeWord,
    processCommand,
    removeWakeWord,
    returnToStandby,
    speak,
    startRecognition,
    stopRecognition,
    userData,
  ]);

  // =====================================================
  // LOGIN GREETING
  // =====================================================

  useEffect(() => {
    if (
      !userData ||
      loginGreetingShown
    ) {
      return;
    }

    if (
      typeof window ===
        "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    const timer =
      setTimeout(async () => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setLoginGreetingShown(
          true
        );

        const greetingName =
          String(
            userData?.name ||
              "there"
          ).trim();

        const greeting =
          `Welcome back ${greetingName}. I am ${assistantName}. How can I help you today?`;

        if (mountedRef.current) {
          setResponseText(
            greeting
          );
        }

        await speak(
          greeting,
          "English"
        );

        if (
          mountedRef.current
        ) {
          setStatusText(
            `Say ${assistantName}`
          );
        }
      }, 1400);

    return () =>
      clearTimeout(timer);
  }, [
    userData,
    assistantName,
    loginGreetingShown,
    speak,
  ]);

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError =
    (event) => {
      console.warn(
        "Assistant image could not be loaded:",
        assistantImage
      );

      event.currentTarget.style.display =
        "none";

      const fallback =
        event.currentTarget.parentElement?.querySelector(
          ".assistant-fallback"
        );

      if (fallback) {
        fallback.style.display =
          "flex";
      }
    };

  // =====================================================
  // CORE STATE
  // =====================================================

  const coreStateClass =
    isListening
      ? "core-listening"
      : isThinking
      ? "core-thinking"
      : isSpeaking
      ? "core-speaking"
      : "core-standby";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        overflow-y-auto
        bg-[#020617]
        text-white
        flex
        items-center
        justify-center
        px-3
        py-5
        md:px-8
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          fixed
          inset-0
          bg-cover
          bg-center
          scale-105
        "
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      {/* OVERLAY */}

      <div
        className="
          fixed
          inset-0
          bg-[#020617]/70
        "
      />

      <div
        className="
          fixed
          inset-0
          bg-gradient-to-br
          from-cyan-950/40
          via-transparent
          to-blue-950/50
        "
      />

      {/* =================================================
          AMBIENT GLOWS
      ================================================= */}

      <div
        className="
          fixed
          -top-48
          -left-48
          w-[650px]
          h-[650px]
          rounded-full
          bg-cyan-500/15
          blur-[150px]
          animate-pulse
        "
      />

      <div
        className="
          fixed
          -bottom-48
          -right-48
          w-[650px]
          h-[650px]
          rounded-full
          bg-blue-600/20
          blur-[150px]
          animate-pulse
        "
      />

      {/* =================================================
          PARTICLES
      ================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({
          length: 22,
        }).map((_, index) => (
          <span
            key={index}
            className="
              absolute
              w-1
              h-1
              rounded-full
              bg-cyan-200/40
              animate-particle
            "
            style={{
              left: `${
                (index * 17) % 100
              }%`,

              top: `${
                (index * 29) % 100
              }%`,

              animationDelay: `${
                index * 0.45
              }s`,

              animationDuration: `${
                5 + (index % 5)
              }s`,
            }}
          />
        ))}
      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <main
        className="
          relative
          z-10
          w-full
          max-w-6xl
          min-h-[720px]
          rounded-[42px]
          border
          border-white/10
          bg-white/[0.055]
          backdrop-blur-3xl
          shadow-[0_40px_140px_rgba(0,0,0,0.65)]
          overflow-hidden
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-10
          md:px-10
        "
      >
        {/* TOP LIGHT */}

        <div
          className="
            absolute
            top-0
            left-1/2
            -translate-x-1/2
            w-[70%]
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-300/60
            to-transparent
          "
        />

        {/* HEADER */}

        <div
          className="
            absolute
            top-7
            left-7
            right-7
            flex
            items-center
            justify-between
            z-30
          "
        >
          {/* AI BADGE */}

          <div
            className="
              flex
              items-center
              gap-3
              px-4
              py-2
              rounded-full
              border
              border-cyan-300/15
              bg-black/20
              backdrop-blur-xl
              shadow-lg
            "
          >
            <span
              className="
                relative
                flex
                h-2.5
                w-2.5
              "
            >
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  rounded-full
                  bg-cyan-300
                  opacity-60
                  animate-ping
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_15px_rgba(103,232,249,1)]
                "
              />
            </span>

            <span
              className="
                text-[10px]
                md:text-xs
                tracking-[0.25em]
                uppercase
                text-white/60
                font-semibold
              "
            >
              AI ONLINE
            </span>
          </div>

          {/* STATUS */}

          <div
            className="
              hidden
              sm:flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-white/10
              bg-white/[0.045]
              backdrop-blur-xl
            "
          >
            <span
              className={`
                w-2
                h-2
                rounded-full
                ${
                  isListening
                    ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,1)]"
                    : isThinking
                    ? "bg-blue-300 shadow-[0_0_12px_rgba(147,197,253,1)]"
                    : isSpeaking
                    ? "bg-purple-300 shadow-[0_0_12px_rgba(216,180,254,1)]"
                    : "bg-white/40"
                }
              `}
            />

            <span className="text-xs text-white/55">
              {statusText}
            </span>
          </div>
        </div>

        {/* =================================================
            PREMIUM 3D CORE
        ================================================= */}

        <div
          className={`
            ${coreStateClass}
            relative
            mt-8
            w-[310px]
            h-[310px]
            md:w-[420px]
            md:h-[420px]
            flex
            items-center
            justify-center
            transition-all
            duration-700
          `}
        >
          {/* CORE GLOW */}

          <div
            className="
              absolute
              inset-[15%]
              rounded-full
              blur-[85px]
              core-glow
            "
          />

          {/* OUTER RING */}

          <div
            className="
              absolute
              inset-[1%]
              rounded-full
              border
              border-cyan-300/10
              shadow-[inset_0_0_90px_rgba(34,211,238,0.06)]
            "
          />

          {/* ROTATING RING */}

          <div
            className="
              absolute
              inset-[5%]
              rounded-full
              border
              border-cyan-300/15
              border-t-cyan-200/90
              border-r-transparent
              border-b-transparent
              animate-spin-slow
            "
          />

          {/* SECOND RING */}

          <div
            className="
              absolute
              inset-[10%]
              rounded-full
              border
              border-blue-300/15
              border-b-blue-200/80
              border-l-transparent
              border-r-transparent
              animate-spin-reverse
            "
          />

          {/* THIRD RING */}

          <div
            className="
              absolute
              inset-[16%]
              rounded-full
              border
              border-cyan-200/10
              border-l-cyan-300/60
              border-t-transparent
              animate-spin-slow-fast
            "
          />

          {/* ORBIT DOT */}

          <div
            className="
              absolute
              inset-[5%]
              rounded-full
              animate-spin-slow
            "
          >
            <span
              className="
                absolute
                top-0
                left-1/2
                -translate-x-1/2
                w-3
                h-3
                rounded-full
                bg-cyan-100
                shadow-[0_0_30px_rgba(165,243,252,1)]
              "
            />
          </div>

          {/* SECOND ORBIT */}

          <div
            className="
              absolute
              inset-[10%]
              rounded-full
              animate-spin-reverse
            "
          >
            <span
              className="
                absolute
                bottom-0
                left-1/2
                -translate-x-1/2
                w-2.5
                h-2.5
                rounded-full
                bg-blue-100
                shadow-[0_0_25px_rgba(191,219,254,1)]
              "
            />
          </div>

          {/* RADAR */}

          <div
            className="
              absolute
              inset-[20%]
              rounded-full
              border
              border-cyan-300/10
              listening-radar
            "
          />

          <div
            className="
              absolute
              inset-[25%]
              rounded-full
              border
              border-cyan-300/10
              listening-radar-delay
            "
          />

          {/* CORE SHADOW */}

          <div
            className="
              absolute
              w-[245px]
              h-[245px]
              md:w-[315px]
              md:h-[315px]
              rounded-full
              bg-black/40
              blur-2xl
            "
          />

          {/* ASSISTANT IMAGE */}

          <div
            className="
              relative
              z-20
              w-[205px]
              h-[205px]
              md:w-[275px]
              md:h-[275px]
              rounded-full
              p-[3px]
              bg-gradient-to-br
              from-white/80
              via-cyan-300/40
              to-blue-500/60
              shadow-[0_0_80px_rgba(34,211,238,0.22)]
              animate-float
            "
          >
            <div
              className="
                relative
                w-full
                h-full
                rounded-full
                overflow-hidden
                bg-[#030712]
                border
                border-white/20
              "
            >
              {assistantImage ? (
                <img
                  src={assistantImage}
                  alt={`${assistantName} AI assistant`}
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                    object-center
                    select-none
                    transition-transform
                    duration-700
                    hover:scale-105
                  "
                  draggable="false"
                  onError={
                    handleImageError
                  }
                />
              ) : null}

              {/* FALLBACK */}

              <div
                className={`
                  assistant-fallback
                  absolute
                  inset-0
                  ${
                    assistantImage
                      ? "hidden"
                      : "flex"
                  }
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-cyan-950
                  via-slate-950
                  to-blue-950
                `}
              >
                <div className="text-center">
                  <div
                    className="
                      text-6xl
                      font-black
                      bg-gradient-to-r
                      from-cyan-200
                      to-blue-300
                      bg-clip-text
                      text-transparent
                    "
                  >
                    {assistantName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div
                    className="
                      mt-2
                      text-[9px]
                      tracking-[0.3em]
                      uppercase
                      text-white/40
                    "
                  >
                    AI CORE
                  </div>
                </div>
              </div>

              {/* SHINE */}

              <div
                className="
                  absolute
                  inset-0
                  pointer-events-none
                  bg-gradient-to-tr
                  from-transparent
                  via-white/[0.12]
                  to-transparent
                "
              />

              {/* EDGE */}

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-white/20
                  pointer-events-none
                "
              />
            </div>
          </div>

          {/* WAVEFORM */}

          <div
            className="
              absolute
              z-30
              bottom-[17%]
              left-1/2
              -translate-x-1/2
              flex
              items-center
              justify-center
              gap-[3px]
              h-10
              px-4
              rounded-full
              border
              border-cyan-200/15
              bg-black/30
              backdrop-blur-xl
              waveform-container
            "
          >
            {Array.from({
              length: 11,
            }).map((_, index) => (
              <span
                key={index}
                className="wave-bar"
                style={{
                  animationDelay: `${
                    index * 0.07
                  }s`,
                }}
              />
            ))}
          </div>

          {/* CORE STATUS */}

          <div
            className="
              absolute
              z-30
              top-[18%]
              left-1/2
              -translate-x-1/2
              px-3
              py-1
              rounded-full
              border
              border-cyan-200/10
              bg-black/25
              backdrop-blur-xl
              text-[8px]
              tracking-[0.28em]
              uppercase
              text-cyan-100/50
              whitespace-nowrap
            "
          >
            {isListening
              ? "VOICE INPUT ACTIVE"
              : isThinking
              ? "PROCESSING"
              : isSpeaking
              ? "VOICE OUTPUT"
              : "STANDBY"}
          </div>
        </div>

        {/* =================================================
            ASSISTANT NAME
        ================================================= */}

        <div
          className="
            relative
            z-20
            mt-5
            text-center
          "
        >
          <div
            className="
              text-[10px]
              md:text-xs
              tracking-[0.5em]
              uppercase
              text-cyan-200/45
              font-medium
              mb-2
            "
          >
            PERSONAL AI
          </div>

          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              tracking-tight
              bg-gradient-to-r
              from-white
              via-cyan-100
              to-blue-300
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_30px_rgba(34,211,238,0.18)]
            "
          >
            {assistantName}
          </h1>

          <p
            className="
              mt-3
              text-xs
              md:text-sm
              tracking-[0.35em]
              uppercase
              text-white/35
            "
          >
            Intelligent • Personal • Always Ready
          </p>
        </div>

        {/* =================================================
            LIVE CONVERSATION
        ================================================= */}

        {(heardText ||
          responseText) && (
          <div
            className="
              relative
              z-30
              mt-7
              w-full
              max-w-2xl
              px-2
            "
          >
            {/* USER TEXT */}

            {heardText && (
              <div
                className="
                  mb-4
                  rounded-3xl
                  border
                  border-cyan-300/15
                  bg-cyan-400/[0.045]
                  backdrop-blur-2xl
                  px-6
                  py-5
                  shadow-[0_15px_60px_rgba(0,0,0,0.25)]
                  animate-conversation-in
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      border
                      border-cyan-300/20
                      bg-cyan-400/10
                    "
                  >
                    🎙️
                  </div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.3em]
                      text-cyan-200/50
                      font-semibold
                    "
                  >
                    You said
                  </span>
                </div>

                <p
                  className="
                    text-lg
                    md:text-xl
                    font-semibold
                    leading-relaxed
                    text-white/90
                    text-center
                  "
                >
                  {heardText}
                </p>
              </div>
            )}

            {/* AI RESPONSE */}

            {responseText && (
              <div
                className="
                  rounded-3xl
                  border
                  border-purple-300/15
                  bg-purple-400/[0.045]
                  backdrop-blur-2xl
                  px-6
                  py-5
                  shadow-[0_15px_70px_rgba(0,0,0,0.30)]
                  animate-response-in
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      border
                      border-purple-300/20
                      bg-purple-400/10
                    "
                  >
                    ✦
                  </div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.3em]
                      text-purple-200/60
                      font-semibold
                    "
                  >
                    {assistantName}
                  </span>

                  {isSpeaking && (
                    <span
                      className="
                        ml-auto
                        text-[9px]
                        uppercase
                        tracking-widest
                        text-purple-200/50
                        animate-pulse
                      "
                    >
                      Speaking
                    </span>
                  )}
                </div>

                <p
                  className="
                    text-lg
                    md:text-xl
                    font-semibold
                    leading-relaxed
                    text-center
                    bg-gradient-to-r
                    from-white
                    via-purple-100
                    to-cyan-100
                    bg-clip-text
                    text-transparent
                  "
                >
                  {responseText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            STATUS
        ================================================= */}

        <div
          className={`
            relative
            z-20
            mt-6
            flex
            items-center
            gap-3
            px-6
            py-3
            rounded-full
            border
            backdrop-blur-2xl
            transition-all
            duration-500
            ${
              isListening
                ? "border-cyan-300/30 bg-cyan-400/[0.08]"
                : isThinking
                ? "border-blue-300/25 bg-blue-400/[0.08]"
                : isSpeaking
                ? "border-purple-300/25 bg-purple-400/[0.08]"
                : "border-white/10 bg-black/20"
            }
          `}
        >
          <span
            className={`
              w-3
              h-3
              rounded-full
              ${
                isListening
                  ? "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]"
                  : isThinking
                  ? "bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,1)]"
                  : isSpeaking
                  ? "bg-purple-300 shadow-[0_0_18px_rgba(216,180,254,1)]"
                  : "bg-white/40"
              }
            `}
          />

          <span className="text-sm font-medium text-white/70">
            {statusText}
          </span>
        </div>

        {/* =================================================
            WAKE WORD
        ================================================= */}

        <div
          className="
            relative
            z-20
            mt-5
            text-center
          "
        >
          <p
            className="
              text-xs
              text-white/30
            "
          >
            Say{" "}
            <span
              className="
                text-cyan-200/70
                font-semibold
              "
            >
              "{assistantName}"
            </span>{" "}
            to start
          </p>
        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div
          className="
            relative
            z-20
            mt-8
            flex
            flex-wrap
            justify-center
            gap-3
          "
        >
          {/* CUSTOMIZE */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/customize"
              )
            }
            className="
              px-7
              py-3.5
              rounded-2xl
              border
              border-cyan-300/20
              bg-gradient-to-r
              from-cyan-500/80
              via-cyan-500/70
              to-blue-600/80
              shadow-[0_12px_35px_rgba(6,182,212,0.22)]
              hover:-translate-y-1
              active:scale-95
              transition-all
              font-semibold
            "
          >
            Customize
          </button>

          {/* HISTORY */}

          <button
            type="button"
            onClick={() =>
              setShowHistory(true)
            }
            className="
              px-7
              py-3.5
              rounded-2xl
              border
              border-purple-300/15
              bg-purple-400/[0.07]
              backdrop-blur-xl
              hover:bg-purple-400/[0.14]
              hover:-translate-y-1
              active:scale-95
              transition-all
              font-semibold
              text-white/80
            "
          >
            <span className="mr-2">
              ◈
            </span>
            History
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              px-7
              py-3.5
              rounded-2xl
              border
              border-white/10
              bg-white/[0.055]
              backdrop-blur-xl
              hover:bg-red-500/15
              hover:border-red-300/20
              hover:-translate-y-1
              active:scale-95
              transition-all
              font-semibold
              text-white/80
            "
          >
            Logout
          </button>
        </div>

        {/* =================================================
            HISTORY MODAL
        ================================================= */}

        {showHistory && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              p-4
              bg-black/75
              backdrop-blur-xl
              animate-history-overlay
            "
            onClick={() =>
              setShowHistory(false)
            }
          >
            <div
              className="
                relative
                w-full
                max-w-4xl
                max-h-[85vh]
                overflow-hidden
                rounded-[32px]
                border
                border-white/10
                bg-[#07111f]/95
                backdrop-blur-3xl
                shadow-[0_40px_150px_rgba(0,0,0,0.7)]
                animate-history-panel
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-6
                  md:px-8
                  py-6
                  border-b
                  border-white/10
                "
              >
                <div>
                  <div
                    className="
                      text-[10px]
                      tracking-[0.35em]
                      uppercase
                      text-cyan-200/40
                    "
                  >
                    Memory Core
                  </div>

                  <h2
                    className="
                      text-2xl
                      md:text-3xl
                      font-black
                      bg-gradient-to-r
                      from-white
                      via-cyan-100
                      to-blue-300
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Conversation History
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {history?.length >
                    0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed =
                          window.confirm(
                            "Clear all conversation history?"
                          );

                        if (
                          confirmed
                        ) {
                          await clearHistory();
                        }
                      }}
                      className="
                        px-4
                        py-2
                        rounded-xl
                        border
                        border-red-300/10
                        bg-red-400/[0.05]
                        text-xs
                        text-red-200/70
                        hover:bg-red-400/10
                      "
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowHistory(
                        false
                      )
                    }
                    className="
                      w-10
                      h-10
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      text-white/60
                      hover:text-white
                      hover:bg-white/[0.08]
                    "
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* HISTORY */}

              <div
                className="
                  overflow-y-auto
                  max-h-[65vh]
                  px-5
                  md:px-8
                  py-6
                "
              >
                {loadingHistory ? (
                  <div
                    className="
                      py-16
                      text-center
                      text-white/40
                    "
                  >
                    <div
                      className="
                        mx-auto
                        w-10
                        h-10
                        rounded-full
                        border-2
                        border-cyan-300/20
                        border-t-cyan-300
                        animate-spin
                      "
                    />

                    <p className="mt-4">
                      Loading memory...
                    </p>
                  </div>
                ) : !history?.length ? (
                  <div
                    className="
                      py-16
                      text-center
                      text-white/35
                    "
                  >
                    <div className="text-5xl mb-4">
                      ◇
                    </div>

                    <p className="text-lg">
                      No conversations yet
                    </p>

                    <p className="text-sm mt-2 text-white/25">
                      Your conversations with{" "}
                      {assistantName}{" "}
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {history.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item?._id ||
                            `${index}-${item?.userMessage}`
                          }
                          className="
                            group
                            relative
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/[0.035]
                            p-5
                            md:p-6
                            hover:bg-white/[0.055]
                            hover:border-cyan-300/15
                            transition-all
                          "
                        >
                          {/* NUMBER */}

                          <div
                            className="
                              absolute
                              top-5
                              right-5
                              text-[9px]
                              tracking-widest
                              text-white/20
                            "
                          >
                            #
                            {history.length -
                              index}
                          </div>

                          {/* USER */}

                          <div className="flex gap-4">
                            <div
                              className="
                                shrink-0
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                border
                                border-cyan-300/15
                                bg-cyan-400/[0.07]
                              "
                            >
                              🎙
                            </div>

                            <div className="min-w-0">
                              <div
                                className="
                                  text-[9px]
                                  tracking-[0.25em]
                                  uppercase
                                  text-cyan-200/40
                                  mb-1
                                "
                              >
                                You
                              </div>

                              <p
                                className="
                                  text-white/85
                                  leading-relaxed
                                  break-words
                                "
                              >
                                {item?.userMessage ||
                                  "No message"}
                              </p>
                            </div>
                          </div>

                          {/* DIVIDER */}

                          <div
                            className="
                              my-5
                              h-px
                              bg-gradient-to-r
                              from-transparent
                              via-white/10
                              to-transparent
                            "
                          />

                          {/* ASSISTANT */}

                          <div className="flex gap-4">
                            <div
                              className="
                                shrink-0
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                border
                                border-purple-300/15
                                bg-purple-400/[0.07]
                              "
                            >
                              ✦
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  text-[9px]
                                  tracking-[0.25em]
                                  uppercase
                                  text-purple-200/40
                                  mb-1
                                "
                              >
                                {assistantName}
                              </div>

                              <p
                                className="
                                  text-white/75
                                  leading-relaxed
                                  break-words
                                "
                              >
                                {item?.assistantResponse ||
                                  "No response"}
                              </p>

                              {/* META */}

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-3
                                  mt-4
                                  text-[9px]
                                  text-white/25
                                "
                              >
                                {item?.action && (
                                  <span
                                    className="
                                      px-2.5
                                      py-1
                                      rounded-full
                                      bg-white/[0.04]
                                      border
                                      border-white/5
                                    "
                                  >
                                    {
                                      item.action
                                    }
                                  </span>
                                )}

                                {item?.language && (
                                  <span>
                                    {
                                      item.language
                                    }
                                  </span>
                                )}

                                {item?.createdAt && (
                                  <span>
                                    {new Date(
                                      item.createdAt
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* DELETE */}

                            {item?._id && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteHistory(
                                    item._id
                                  )
                                }
                                className="
                                  self-start
                                  opacity-0
                                  group-hover:opacity-100
                                  transition
                                  text-white/20
                                  hover:text-red-300/70
                                "
                                title="Delete"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM LINE */}

        <div
          className="
            absolute
            bottom-5
            left-1/2
            -translate-x-1/2
            w-40
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-300/30
            to-transparent
          "
        />
      </main>

      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>{`
        /* ================================================
           FLOAT
        ================================================ */

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation:
            float
            4s
            ease-in-out
            infinite;
        }

        /* ================================================
           ROTATION
        ================================================ */

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation:
            spinSlow
            12s
            linear
            infinite;
        }

        .animate-spin-slow-fast {
          animation:
            spinSlow
            7s
            linear
            infinite;
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-reverse {
          animation:
            spinReverse
            18s
            linear
            infinite;
        }

        /* ================================================
           PARTICLES
        ================================================ */

        @keyframes particle {
          0% {
            transform:
              translateY(20px)
              scale(0.6);
            opacity: 0;
          }

          20% {
            opacity: 0.6;
          }

          80% {
            opacity: 0.3;
          }

          100% {
            transform:
              translateY(-120px)
              scale(1.1);
            opacity: 0;
          }
        }

        .animate-particle {
          animation:
            particle
            7s
            ease-in-out
            infinite;
        }

        /* ================================================
           CORE STATES
        ================================================ */

        .core-standby {
          animation:
            premiumIdle
            4s
            ease-in-out
            infinite;
        }

        .core-listening {
          animation:
            premiumListening
            1.8s
            ease-in-out
            infinite;
        }

        .core-thinking {
          animation:
            premiumThinking
            2.2s
            ease-in-out
            infinite;
        }

        .core-speaking {
          animation:
            premiumSpeaking
            1.15s
            ease-in-out
            infinite;
        }

        @keyframes premiumIdle {
          0%, 100% {
            transform:
              scale(1)
              rotate(0deg);
          }

          50% {
            transform:
              scale(1.015)
              rotate(0.4deg);
          }
        }

        @keyframes premiumListening {
          0%, 100% {
            transform:
              scale(1.02);
          }

          50% {
            transform:
              scale(1.065);
          }
        }

        @keyframes premiumThinking {
          0%, 100% {
            transform:
              scale(1.015);
          }

          50% {
            transform:
              scale(1.045);
          }
        }

        @keyframes premiumSpeaking {
          0%, 100% {
            transform:
              scale(1.02);
          }

          50% {
            transform:
              scale(1.055);
          }
        }

        /* ================================================
           CORE GLOW
        ================================================ */

        .core-glow {
          background:
            radial-gradient(
              circle,
              rgba(34,211,238,0.18) 0%,
              rgba(37,99,235,0.12) 38%,
              transparent 72%
            );

          transition:
            transform 0.6s ease,
            opacity 0.6s ease,
            filter 0.6s ease;
        }

        .core-listening .core-glow {
          background:
            radial-gradient(
              circle,
              rgba(34,211,238,0.42) 0%,
              rgba(37,99,235,0.20) 42%,
              transparent 75%
            );

          transform:
            scale(1.25);

          filter:
            blur(25px);

          animation:
            coreGlowListening
            1.6s
            ease-in-out
            infinite;
        }

        .core-thinking .core-glow {
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,0.34) 0%,
              rgba(37,99,235,0.16) 45%,
              transparent 75%
            );

          animation:
            coreGlowThinking
            2s
            ease-in-out
            infinite;
        }

        .core-speaking .core-glow {
          background:
            radial-gradient(
              circle,
              rgba(168,85,247,0.30) 0%,
              rgba(59,130,246,0.15) 45%,
              transparent 75%
            );

          animation:
            coreGlowSpeaking
            1.5s
            ease-in-out
            infinite;
        }

        @keyframes coreGlowListening {
          0%, 100% {
            transform:
              scale(1);
            opacity: 0.75;
          }

          50% {
            transform:
              scale(1.28);
            opacity: 1;
          }
        }

        @keyframes coreGlowThinking {
          0%, 100% {
            transform:
              scale(1);
            opacity: 0.6;
          }

          50% {
            transform:
              scale(1.15);
            opacity: 0.95;
          }
        }

        @keyframes coreGlowSpeaking {
          0%, 100% {
            transform:
              scale(1);
            opacity: 0.65;
          }

          50% {
            transform:
              scale(1.18);
            opacity: 1;
          }
        }

        /* ================================================
           RADAR
        ================================================ */

        .listening-radar,
        .listening-radar-delay {
          opacity: 0;
          transform:
            scale(0.7);
        }

        .core-listening
        .listening-radar {
          animation:
            listeningRadar
            2.1s
            ease-out
            infinite;
        }

        .core-listening
        .listening-radar-delay {
          animation:
            listeningRadar
            2.1s
            ease-out
            infinite;

          animation-delay:
            0.7s;
        }

        @keyframes listeningRadar {
          0% {
            opacity: 0;
            transform:
              scale(0.65);
          }

          15% {
            opacity: 0.55;
          }

          75% {
            opacity: 0.1;
          }

          100% {
            opacity: 0;
            transform:
              scale(1.45);
          }
        }

        /* ================================================
           WAVEFORM
        ================================================ */

        .waveform-container {
          opacity: 0.45;

          transform:
            translateY(4px)
            scale(0.94);

          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .core-listening
        .waveform-container {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }

        .core-speaking
        .waveform-container {
          opacity: 1;
        }

        .wave-bar {
          display: block;

          width: 3px;

          height: 8px;

          border-radius:
            999px;

          background:
            rgba(
              165,
              243,
              252,
              0.85
            );

          box-shadow:
            0 0 10px
            rgba(
              34,
              211,
              238,
              0.55
            );

          animation:
            voiceWave
            0.75s
            ease-in-out
            infinite;
        }

        @keyframes voiceWave {
          0%, 100% {
            height: 7px;
            opacity: 0.45;
          }

          50% {
            height: 28px;
            opacity: 1;
          }
        }

        /* ================================================
           CONVERSATION
        ================================================ */

        @keyframes conversationIn {
          0% {
            opacity: 0;

            transform:
              translateY(18px)
              scale(0.97);

            filter:
              blur(6px);
          }

          100% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);

            filter:
              blur(0);
          }
        }

        .animate-conversation-in {
          animation:
            conversationIn
            0.45s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        @keyframes responseIn {
          0% {
            opacity: 0;

            transform:
              translateY(20px)
              scale(0.96);

            filter:
              blur(8px);
          }

          60% {
            opacity: 1;
          }

          100% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);

            filter:
              blur(0);
          }
        }

        .animate-response-in {
          animation:
            responseIn
            0.65s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        /* ================================================
           HISTORY
        ================================================ */

        @keyframes historyOverlay {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .animate-history-overlay {
          animation:
            historyOverlay
            0.3s
            ease-out;
        }

        @keyframes historyPanel {
          0% {
            opacity: 0;

            transform:
              translateY(30px)
              scale(0.94);

            filter:
              blur(8px);
          }

          100% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);

            filter:
              blur(0);
          }
        }

        .animate-history-panel {
          animation:
            historyPanel
            0.45s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        /* ================================================
           SCROLLBAR
        ================================================ */

        * {
          scrollbar-width:
            thin;

          scrollbar-color:
            rgba(
              103,
              232,
              249,
              0.25
            )
            transparent;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background:
            transparent;
        }

        ::-webkit-scrollbar-thumb {
          background:
            rgba(
              103,
              232,
              249,
              0.25
            );

          border-radius:
            999px;
        }

        /* ================================================
           REDUCED MOTION
        ================================================ */

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;