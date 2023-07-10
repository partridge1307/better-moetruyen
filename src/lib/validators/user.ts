import { ZodType, z } from 'zod';

export const UserProfileEditValidator = z.object({
  avatar: z.any() as ZodType<Blob | undefined>,
  banner: z.any() as ZodType<Blob | undefined>,
  name: z.string().min(5).max(30),
  color: z.string().optional(),
});
export type UserProfileEditPayload = z.infer<typeof UserProfileEditValidator>;
