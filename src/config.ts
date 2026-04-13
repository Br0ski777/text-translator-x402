import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "text-translator",
  slug: "text-translator",
  description: "Translate text between 50+ languages with auto-detection. Fast, accurate translations for agents and apps.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/translate",
      price: "$0.005",
      description: "Translate text between languages with automatic source language detection",
      toolName: "text_translate",
      toolDescription: `Use this when you need to translate text from one language to another. Supports 50+ languages with automatic source language detection. Returns translated text with metadata.

1. translatedText: the translated output text
2. detectedLanguage: source language code detected (e.g. "fr", "de", "ja")
3. confidence: detection confidence score 0-1
4. sourceLanguage: confirmed source language name (e.g. "French")
5. targetLanguage: target language name (e.g. "English")
6. characterCount: number of characters translated

Example output: {"translatedText":"Hello, how are you?","detectedLanguage":"fr","confidence":0.98,"sourceLanguage":"French","targetLanguage":"English","characterCount":23}

Use this FOR multilingual content localization, cross-language customer support, or translating user-submitted text. Essential BEFORE presenting foreign-language content to users.

Do NOT use for language detection only -- use text_detect_language. Do NOT use for summarization -- use ai_summarize_text. Do NOT use for sentiment analysis -- use text_analyze_sentiment.`,
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
      outputSchema: {
          "type": "object",
          "properties": {
            "translatedText": {
              "type": "string",
              "description": "Translated text"
            },
            "sourceLanguage": {
              "type": "string",
              "description": "Detected or specified source language"
            },
            "targetLanguage": {
              "type": "string",
              "description": "Target language"
            },
            "confidence": {
              "type": "number",
              "description": "Translation confidence"
            }
          },
          "required": [
            "translatedText",
            "targetLanguage"
          ]
        },
    },
  ],
};
