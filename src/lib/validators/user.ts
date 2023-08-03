import { ZodType, z } from 'zod';

export const UserProfileEditValidator = z.object({
  avatar: z.any() as ZodType<Blob | undefined>,
  banner: z.any() as ZodType<Blob | undefined>,
  name: z.string().min(5, 'Tối thiểu 5 kí tự').max(30, 'Tối đa 30 kí tự'),
  color: z.string().nullable(),
});
export type UserProfileEditPayload = z.infer<typeof UserProfileEditValidator>;
