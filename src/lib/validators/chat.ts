import { z } from 'zod';

export const ChatValidator = z.object({
  conversationId: z.number(),
  content: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(1024, 'Tối đa 1024 kí tự'),
  senderId: z.string(),
});

export type ChatPayload = z.infer<typeof ChatValidator>;
