import { z } from 'zod';

export const VoteValidator = z.object({
  id: z.number(),
  voteType: z.enum(['UP_VOTE', 'DOWN_VOTE']),
});
export type VotePayload = z.infer<typeof VoteValidator>;
