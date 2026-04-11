import { z } from "zod";

export const CollectionBaseSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
});
