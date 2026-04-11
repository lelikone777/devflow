import { generateText } from "ai";
import { NextResponse } from "next/server";

import { getAIAnswerModel } from "@/lib/ai/provider";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validations";
import type { APIErrorResponse } from "@/types";

export async function POST(req: Request) {
  const { question, content, userAnswer } = await req.json();

  try {
    const validatedData = AIAnswerSchema.safeParse({
      question,
      content,
      userAnswer,
    });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { model } = getAIAnswerModel();
    const { question: validatedQuestion, content: validatedContent } =
      validatedData.data;
    const draftAnswer = validatedData.data.userAnswer?.trim();

    const { text } = await generateText({
      model,
      prompt: `Generate a concise markdown answer for the following developer question.

Question:
${validatedQuestion}

Question details:
${validatedContent}
${
  draftAnswer
    ? `
Existing draft answer from the user:
${draftAnswer}
`
    : ""
}
Rules:
- Prefer the user's draft only when it is correct.
- If the draft is incomplete or wrong, fix it.
- Keep the answer practical and concise.
- Use markdown.
- Use fenced code blocks only when code is genuinely helpful.`,
      system:
        "You are a helpful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. For code blocks, use short-form smaller case language identifiers (e.g., 'js' for JavaScript, 'py' for Python, 'ts' for TypeScript, 'html' for HTML, 'css' for CSS, etc.).",
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
