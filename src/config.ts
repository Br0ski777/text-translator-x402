import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "text-translator",
  slug: "text-translator",
  description: "Translate text between 50+ languages with auto-detection via MyMemory API.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/translate",
      price: "$0.005",
      description: "Translate text between languages with automatic source language detection",
      toolName: "text_translate",
      toolDescription:
        "Use this when you need to translate text from one language to another. Supports 50+ languages with automatic source language detection. Returns translated text, detected source language, and confidence score. Ideal for multilingual content, localization, and cross-language communication. Do NOT use for summarization — use ai_summarize_text. Do NOT use for sentiment — use text_analyze_sentiment.",
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to translate (max 5000 characters)",
          },
          from: {
            type: "string",
            description: "Source language code (e.g. 'en', 'fr', 'de') or 'auto' for detection. Default: 'auto'",
          },
          to: {
            type: "string",
            description: "Target language code (e.g. 'en', 'fr', 'de', 'es', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'). Default: 'en'",
          },
        },
        required: ["text"],
      },
    },
  ],
};
