import { z } from 'zod';

export const userFollowValidator = z.object({
  id: z.number().or(z.string()),
  target: z.enum(['USER', 'MANGA']),
});
export type FollowPayload = z.infer<typeof userFollowValidator>;
