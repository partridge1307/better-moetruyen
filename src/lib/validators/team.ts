import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const TeamFormValidator = zfd.formData({
  image: zfd
    .file()
    .or(zfd.text())
    .refine((file) => {
      if (typeof file === 'string') {
        return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else
        return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    }, 'Ảnh phải là định dạng .jpg, .jpeg, .png')
    .refine((file) => {
      if (typeof file === 'string') {
        return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else return file.size < 4 * 1000 * 1000;
    }, 'Ảnh phải nhỏ hơn 4MB'),
  name: zfd.text(
    z.string().min(3, 'Tối thiểu 3 kí tự').max(64, 'Tối đa 64 kí tự')
  ),
  description: zfd.text(
    z.string().min(5, 'Tối thiểu 5 kí tự').max(255, 'Tối thiểu 255 kí tự')
  ),
});

export const TeamValidator = z.object({
  image: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') || value.startsWith('https://i.moetruyen.net'),
      'Ảnh không hợp lệ'
    ),
  name: z.string().min(3, 'Tối thiểu 3 kí tự').max(64, 'Tối đa 64 kí tự'),
  description: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(255, 'Tối đa 255 kí tự'),
});
export type TeamPayload = z.infer<typeof TeamValidator>;
