import { z } from "zod";

import { PaginatedSearchParamsSchema } from "./common";

export const AnswerSchema = z.object({
  content: z.string().min(100, { message: "Minimum of 100 characters." }),
});

export const AnswerServerSchema = AnswerSchema.extend({
  questionId: z.string().min(1, "Question ID is required"),
});

export const GetAnswersSchema = PaginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, "Question ID is required"),
});

export const AIAnswerSchema = z.object({
  question: z
    .string()
    .min(5, {
      message: "Question title must be at least 5 characters.",
    })
    .max(130, {
      message: "Question title musn't be longer then 130 characters.",
    }),
  content: z.string().min(100, {
    message: "Question description must have Minimum of 100 characters.",
  }),
  userAnswer: z.string().optional(),
});

export const DeleteAnswerSchema = z.object({
  answerId: z.string().min(1, "Answer ID is required"),
});
