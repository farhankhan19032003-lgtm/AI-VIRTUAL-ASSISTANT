import "dotenv/config";
import OpenAI from "openai";

// =====================================================
// OPENAI CLIENT
// =====================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================================================
// CURRENT INDIA DATE / TIME
// =====================================================

const getIndiaDateTime = () => {
  const now = new Date();

  return {
    date: now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),

    day: now.toLocaleDateString("en-IN", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }),

    time: now.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }),
  };
};

// =====================================================
// WEB SEARCH
// =====================================================

const webSearch = async (
  query,
  language = "English"
) => {
  const cleanQuery =
    String(query || "").trim();

  if (!cleanQuery) {
    return {
      success: false,
      answer: "",
      sources: [],
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "❌ OPENAI_API_KEY is missing."
    );

    return {
      success: false,
      answer:
        "Web search is not available because the OpenAI API key is missing.",
      sources: [],
    };
  }

  const model =
    process.env.OPENAI_MODEL ||
    "gpt-5.6-luna";

  const current =
    getIndiaDateTime();

  try {
    console.log(
      "===================================="
    );

    console.log(
      "🌐 WEB SEARCH"
    );

    console.log(
      "QUERY:",
      cleanQuery
    );

    console.log(
      "MODEL:",
      model
    );

    console.log(
      "===================================="
    );

    const response =
      await openai.responses.create({
        model,

        tools: [
          {
            type: "web_search",
          },
        ],

        instructions: `
You are the web research engine for a personal AI assistant.

Current India date:
${current.date}

Current India day:
${current.day}

Current India time:
${current.time}

Timezone:
Asia/Kolkata

Your job is to find reliable, current information
from the web.

IMPORTANT:

1. Search the web for current information.
2. Prefer reliable and authoritative sources.
3. Prefer official sources when available.
4. For news, prefer recent reputable news sources.
5. Do not invent facts.
6. Do not present old information as current.
7. If information cannot be verified, clearly say so.
8. Answer in the user's requested language.
9. Keep the answer concise because it will be spoken
   by a voice assistant.
10. Do not use Markdown tables.
11. Do not include unnecessary introductions.

User language:
${language}

Return a concise factual answer.

If useful, mention the source names naturally,
but do not dump a huge list of URLs.
`,

        input: cleanQuery,
      });

    const answer =
      response?.output_text?.trim() || "";

    console.log(
      "WEB SEARCH ANSWER:",
      answer
    );

    // =================================================
    // EXTRACT SOURCES
    // =================================================

    const sources = [];

    const output =
      Array.isArray(response?.output)
        ? response.output
        : [];

    for (const item of output) {
      if (!item) continue;

      if (
        Array.isArray(item.content)
      ) {
        for (const content of item.content) {
          if (!content) continue;

          if (
            Array.isArray(
              content.annotations
            )
          ) {
            for (
              const annotation of
                content.annotations
            ) {
              if (
                annotation?.type ===
                  "url_citation" &&
                annotation?.url
              ) {
                sources.push({
                  title:
                    annotation.title ||
                    "Source",

                  url:
                    annotation.url,
                });
              }
            }
          }
        }
      }
    }

    // =================================================
    // REMOVE DUPLICATE SOURCES
    // =================================================

    const uniqueSources = Array.from(
      new Map(
        sources.map((source) => [
          source.url,
          source,
        ])
      ).values()
    );

    console.log(
      "WEB SOURCES:",
      uniqueSources
    );

    return {
      success: true,
      answer,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ WEB SEARCH ERROR"
    );

    console.error(
      "STATUS:",
      error?.status
    );

    console.error(
      "CODE:",
      error?.code
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "===================================="
    );

    let message =
      "I couldn't retrieve the latest information right now.";

    if (error?.status === 401) {
      message =
        "The OpenAI API key is invalid.";
    }

    if (error?.status === 403) {
      message =
        "Web search is not available for this API configuration.";
    }

    if (error?.status === 429) {
      message =
        "The OpenAI API rate limit or quota has been reached.";
    }

    return {
      success: false,
      answer: message,
      sources: [],
    };
  }
};

// =====================================================
// EXPORT
// =====================================================

export default webSearch;