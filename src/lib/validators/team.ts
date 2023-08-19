import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';

export const TeamEditValidator = z.object({
  image: z.string(),
  name: z.string().min(3, 'Tối thiểu 3 kí tự').max(64, 'Tối đa 64 kí tự'),
  description: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(255, 'Tối đa 255 kí tự'),
});
export type TeamEditPayload = z.infer<typeof TeamEditValidator>;

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

export const TeamCreateValidator = z.object({
  image: z
    .any()
    .refine(
      (file) => ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type),
      'Chỉ nhận định dạng ảnh .jpg, .jpeg, .png'
    )
    .refine(
      (file) => file.size < 4 * 1000 * 1000,
      'Ảnh phải nhỏ hơn 4MB'
    ) as ZodType<File>,
  name: z.string().min(3, 'Tối thiểu 3 kí tự').max(64, 'Tối đa 64 kí tự'),
  description: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(255, 'Tối đa 255 kí tự'),
});
export type TeamCreatePayload = z.infer<typeof TeamCreateValidator>;
