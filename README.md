# Text Translator API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://text-translator.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Translate text between 50+ languages with auto-detection via MyMemory API. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "text-translator": {
      "url": "https://text-translator.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://text-translator.api.klymax402.com/api/translate" \
  -H "Content-Type: application/json" \
  -d '{"text":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `text_translate` | POST | `/api/translate` | $0.012 | Translate text between languages with automatic source language detection |

### `text_translate`

Use this when you need to translate text from one language to another. Supports 50+ languages with automatic source language detection. Returns translated text, detected source language, and confidence score. Ideal for multilingual content, localization, and cross-language communication. Do NOT use for summarization — use ai_summarize_text. Do NOT use for sentiment — use text_analyze_sentiment.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `text` | string | yes | The text to translate (max 5000 characters) |
| `from` | string | no | Source language code (e.g. 'en', 'fr', 'de') or 'auto' for detection. Default: 'auto' |
| `to` | string | no | Target language code (e.g. 'en', 'fr', 'de', 'es', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'). Default: 'en' |

## Example agent prompts

- "Translate text from one language to another"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
