import { z } from "zod";

export const newsSchema = z.object({
  topic: z
    .string()
    .min(3, "Topic is too short. Minimum 3 characters required.")
    .max(64, "Topic is too long. Maximum 64 characters allowed."),
  filterBy: z
    .enum(["relevancy", "popularity", "publishedAt"], {
      message: 'Invalid option: expected one of "relevancy", "popularity" or "publishedAt"',
    })
    .optional(),
  page: z.number().int().min(1).optional(),
});
