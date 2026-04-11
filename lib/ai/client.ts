import type { ActionResponse } from "@/types";

interface GenerateAIAnswerParams {
  question: string;
  content: string;
  userAnswer?: string;
}

export async function generateAIAnswer(
  params: GenerateAIAnswerParams
): Promise<ActionResponse<string>> {
  const response = await fetch("/api/ai/answers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => null)) as ActionResponse<string> | null;

  if (!response.ok) {
    return (
      payload ?? {
        success: false,
        status: response.status,
        error: {
          message: `HTTP error: ${response.status}`,
        },
      }
    );
  }

  return payload ?? { success: false, error: { message: "Empty response body" } };
}
