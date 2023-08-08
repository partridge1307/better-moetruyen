import { z } from 'zod';

export const commentVoteValidator = z.object({
  voteType: z.enum(['UP_VOTE', 'DOWN_VOTE']),
  commentId: z.number(),
});
export type CommentVotePayload = z.infer<typeof commentVoteValidator>;

export const userFollowValidator = z.object({
  id: z.number().or(z.string()),
  target: z.enum(['USER', 'MANGA']),
});
export type FollowPayload = z.infer<typeof userFollowValidator>;
