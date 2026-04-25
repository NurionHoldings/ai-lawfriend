import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient() {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  _client = new OpenAI({ apiKey });
  return _client;
}

export function getParagraphRewriteModel() {
  return process.env.OPENAI_PARAGRAPH_REWRITE_MODEL || "gpt-5.2";
}
