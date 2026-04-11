import { createOpenAI } from "@ai-sdk/openai";

import { RequestError } from "@/lib/http-errors";

const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_XAI_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_XAI_MODEL = "grok-4.20-beta-latest-non-reasoning";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

type AIProviderName = "groq" | "xai" | "openai";

export interface ResolvedAIProviderConfig {
  provider: AIProviderName;
  apiKey: string;
  baseURL?: string;
  modelId: string;
}

const readEnv = (
  env: NodeJS.ProcessEnv,
  key: keyof NodeJS.ProcessEnv
): string | undefined => {
  const value = env[key]?.trim();

  return value ? value : undefined;
};

export function resolveAIProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): ResolvedAIProviderConfig {
  const groqApiKey = readEnv(env, "GROQ_API_KEY");

  if (groqApiKey) {
    return {
      provider: "groq",
      apiKey: groqApiKey,
      baseURL: readEnv(env, "GROQ_BASE_URL") ?? DEFAULT_GROQ_BASE_URL,
      modelId: readEnv(env, "GROQ_MODEL") ?? DEFAULT_GROQ_MODEL,
    };
  }

  const xaiApiKey = readEnv(env, "XAI_API_KEY");

  if (xaiApiKey) {
    return {
      provider: "xai",
      apiKey: xaiApiKey,
      baseURL: readEnv(env, "XAI_BASE_URL") ?? DEFAULT_XAI_BASE_URL,
      modelId: readEnv(env, "XAI_MODEL") ?? DEFAULT_XAI_MODEL,
    };
  }

  const openAIApiKey = readEnv(env, "OPENAI_API_KEY");

  if (openAIApiKey) {
    return {
      provider: "openai",
      apiKey: openAIApiKey,
      baseURL: readEnv(env, "OPENAI_BASE_URL"),
      modelId: readEnv(env, "OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL,
    };
  }

  throw new RequestError(
    500,
    "AI provider is not configured. Set GROQ_API_KEY, XAI_API_KEY, or OPENAI_API_KEY."
  );
}

export function getAIAnswerModel(env: NodeJS.ProcessEnv = process.env) {
  const config = resolveAIProviderConfig(env);
  const provider = createOpenAI({
    name: config.provider,
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });

  return {
    ...config,
    model: provider(config.modelId),
  };
}
