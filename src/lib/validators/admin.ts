import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const AddBadgeValidator = z.object({
  image: z.string(),
  name: z.string().min(3, 'Tối thiểu 3 kí tự').max(32, 'Tối đa 32 kí tự'),
  description: z.string(),
  color: z
    .object({ color: z.string() })
    .or(z.object({ from: z.string(), to: z.string() })),
});
export type AddBadgePayload = z.infer<typeof AddBadgeValidator>;

export const AddBadgeFormValidator = zfd.formData({
  image: zfd
    .file()
    .refine((file) => file.size < 4 * 1000 * 1000, 'Tối đa 4MB')
    .refine(
      (file) => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type),
      'Chỉ nhận .jpg, .png, .jpeg'
    ),
  name: zfd.text(
    z.string().min(3, 'Tối thiểu 3 kí tự').max(32, 'Tối đa 32 kí tự')
  ),
  description: zfd.text(z.string()),
  color: zfd.json(
    z
      .object({ color: z.string() })
      .or(z.object({ from: z.string(), to: z.string() }))
  ),
});

export const MuteValidator = z.object({
  id: z.string(),
  name: z.string(),
  expiredAt: z
    .date()
    .or(z.string())
    .refine(
      (date) => new Date(date).getTime() > Date.now(),
      'Time must be higher than current timestamp'
    ),
});
export type MutePayload = z.infer<typeof MuteValidator>;

export const TagEditValidator = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});
export type TagEditPayload = z.infer<typeof TagEditValidator>;
