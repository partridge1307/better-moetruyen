import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';

export const TeamEditValidator = z.object({
  image: z.any() as ZodType<Blob | undefined>,
  name: z.string().min(5).max(30),
});
export type TeamEditPayload = z.infer<typeof TeamEditValidator>;

export const TeamFormEditValidator = zfd.formData({
  image: zfd
    .file()
    .optional()
    .refine((file) => {
      if (file) {
        return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      } else return true;
    }, 'Ảnh phải là định dạng .jpg, .jpeg, .png')
    .refine((file) => {
      if (file) {
        return file.size < 4 * 1000 * 1000;
      } else return true;
    }, 'Ảnh phải nhỏ hơn 4MB'),
  name: zfd.text(
    z.string().min(5, 'Tối thiểu 5 kí tự').max(30, 'Tối đa 30 kí tự')
  ),
});
