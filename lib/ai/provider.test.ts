import { describe, expect, it } from "vitest";

import { RequestError } from "@/lib/http-errors";

import { resolveAIProviderConfig } from "./provider";

describe("lib/ai/provider", () => {
  it("prefers Groq when a Groq API key is configured", () => {
    expect(
      resolveAIProviderConfig({
        GROQ_API_KEY: "groq-secret",
        GROQ_MODEL: "openai/gpt-oss-20b",
        XAI_API_KEY: "xai-secret",
        OPENAI_API_KEY: "openai-secret",
      })
    ).toEqual({
      provider: "groq",
      apiKey: "groq-secret",
      baseURL: "https://api.groq.com/openai/v1",
      modelId: "openai/gpt-oss-20b",
    });
  });

  it("prefers xAI when a Grok API key is configured", () => {
    expect(
      resolveAIProviderConfig({
        XAI_API_KEY: "xai-secret",
        XAI_MODEL: "grok-custom",
        OPENAI_API_KEY: "openai-secret",
      })
    ).toEqual({
      provider: "xai",
      apiKey: "xai-secret",
      baseURL: "https://api.x.ai/v1",
      modelId: "grok-custom",
    });
  });

  it("falls back to OpenAI when xAI is not configured", () => {
    expect(
      resolveAIProviderConfig({
        OPENAI_API_KEY: "openai-secret",
        OPENAI_MODEL: "gpt-custom",
      })
    ).toEqual({
      provider: "openai",
      apiKey: "openai-secret",
      baseURL: undefined,
      modelId: "gpt-custom",
    });
  });

  it("throws a clear error when no AI provider is configured", () => {
    expect(() => resolveAIProviderConfig({})).toThrowError(RequestError);
    expect(() => resolveAIProviderConfig({})).toThrow(
      "AI provider is not configured. Set GROQ_API_KEY, XAI_API_KEY, or OPENAI_API_KEY."
    );
  });
});
