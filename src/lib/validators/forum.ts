import { z } from 'zod';

export const CreateThreadValidator = z.object({
  title: z
    .string()
    .min(3, 'Tối thiểu 3 kí tự')
    .max(64, 'Tối đa 64 kí tự')
    .refine(
      (value) => /^[A-Za-z0-9\s]+$/.test(value),
      'Chỉ chấp nhận kí tự in hoa, in thường, khoảng cách hoặc số'
    ),
});
export type CreateThreadPayload = z.infer<typeof CreateThreadValidator>;
