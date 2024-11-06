import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
});
