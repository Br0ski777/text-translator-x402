import type { Hono } from "hono";

// --------------- Cache ---------------
interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// --------------- Language detection heuristic ---------------
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  fr: [/\b(le|la|les|un|une|des|et|est|dans|pour|avec|sur|que|qui|ce|cette|pas|nous|vous|ils)\b/gi],
  de: [/\b(der|die|das|und|ist|ein|eine|nicht|mit|auf|den|dem|von|zu|für|sich)\b/gi],
  es: [/\b(el|la|los|las|un|una|de|en|que|es|por|con|del|para|como|pero|más)\b/gi],
  it: [/\b(il|la|le|un|una|di|che|in|per|con|non|sono|del|della|questo|anche)\b/gi],
  pt: [/\b(o|a|os|as|um|uma|de|em|que|para|com|não|por|mais|como|ser|está)\b/gi],
  nl: [/\b(de|het|een|van|in|is|dat|op|te|en|voor|met|niet|zijn|dit|ook)\b/gi],
  ru: [/[а-яА-ЯёЁ]/g],
  zh: [/[\u4e00-\u9fff]/g],
  ja: [/[\u3040-\u309f\u30a0-\u30ff]/g],
  ko: [/[\uac00-\ud7af\u1100-\u11ff]/g],
  ar: [/[\u0600-\u06ff\u0750-\u077f]/g],
  hi: [/[\u0900-\u097f]/g],
};

function detectLanguage(text: string): { language: string; confidence: number } {
  const scores: Record<string, number> = {};
  const textLen = text.length;

  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) matchCount += matches.length;
    }
    scores[lang] = matchCount / Math.max(textLen / 5, 1);
  }

  // Default to English if no strong match
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0.1) {
    return { language: best[0], confidence: Math.min(best[1] * 2, 0.95) };
  }
  return { language: "en", confidence: 0.5 };
}

// --------------- Translation via MyMemory ---------------

async function translateText(
  text: string,
  from: string = "auto",
  to: string = "en"
): Promise<{
  translatedText: string;
  detectedLanguage: string;
  confidence: number;
  from: string;
  to: string;
  charCount: number;
}> {
  const cacheKey = `translate_${from}_${to}_${text.slice(0, 100)}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  // Detect language if auto
  let sourceLang = from;
  let detectionConfidence = 1.0;

  if (from === "auto") {
    const detection = detectLanguage(text);
    sourceLang = detection.language;
    detectionConfidence = detection.confidence;
  }

  // Call MyMemory API
  const encodedText = encodeURIComponent(text.slice(0, 5000));
  const langPair = `${sourceLang}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`MyMemory API returned ${resp.status}`);

  const data: any = await resp.json();

  if (data.responseStatus !== 200 && data.responseStatus !== "200") {
    throw new Error(data.responseDetails || "Translation failed");
  }

  const translatedText = data.responseData?.translatedText || "";
  const matchScore = data.responseData?.match || 0;

  // Try to get detected language from response
  const detectedFromResponse = data.responderId || sourceLang;

  const result = {
    translatedText,
    detectedLanguage: sourceLang,
    confidence: from === "auto" ? detectionConfidence : matchScore,
    from: sourceLang,
    to,
    charCount: text.length,
  };

  setCache(cacheKey, result);
  return result;
}

// --------------- Routes ---------------

export function registerRoutes(app: Hono) {
  app.post("/api/translate", async (c) => {
    let body: any;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { text, from = "auto", to = "en" } = body;

    if (!text || typeof text !== "string") {
      return c.json({
        error: "Missing required parameter 'text'",
        example: { text: "Bonjour le monde", from: "auto", to: "en" },
      }, 400);
    }

    if (text.length > 5000) {
      return c.json({ error: "Text too long. Maximum 5000 characters." }, 400);
    }

    try {
      const result = await translateText(text, from, to);
      return c.json({
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return c.json({ error: "Translation failed", details: err.message }, 502);
    }
  });
}
