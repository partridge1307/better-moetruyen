import { z } from 'zod';

export const UserVerifyValidator = z.object({
  isChecked: z.boolean().refine((value) => value, 'Accept is required'),
});
export type UserVerifyPayload = z.infer<typeof UserVerifyValidator>;
