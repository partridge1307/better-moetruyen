import { ZodType, z } from 'zod';

export const TeamEditValidator = z.object({
  image: z.any() as ZodType<Blob | undefined>,
  name: z.string().min(5).max(30),
});
export type TeamEditPayload = z.infer<typeof TeamEditValidator>;
