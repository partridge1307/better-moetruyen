import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';

export const UserProfileEditValidator = z.object({
  avatar: z.any() as ZodType<Blob | undefined>,
  banner: z.any() as ZodType<Blob | undefined>,
  name: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(30, 'Tối đa 30 kí tự')
    .refine(
      (value) => /^[A-Za-z0-9\s]+$/.test(value),
      'Tên chỉ chấp nhận kí tự in hoa, in thường, khoảng cách hoặc số'
    ),
  color: z.string().nullable(),
});
export type UserProfileEditPayload = z.infer<typeof UserProfileEditValidator>;

export const UserFormUpdateValidator = zfd.formData({
  avatar: zfd
    .file()
    .optional()
    .refine((file) => {
      if (file) {
        return ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'].includes(
          file.type
        );
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        return file.size < 4 * 1000 * 1000;
      } else return true;
    }, 'Ảnh phải nhỏ dưới 4MB'),
  banner: zfd
    .file()
    .optional()
    .refine((file) => {
      if (file) {
        return ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'].includes(
          file.type
        );
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        return file.size < 4 * 1000 * 1000;
      } else return true;
    }, 'Ảnh phải nhỏ dưới 4MB'),
  name: zfd.text(
    z
      .string()
      .min(5, 'Tối thiểu 5 kí tự')
      .max(256, 'Tối đa 256 kí tự')
      .refine(
        (value) => /^[A-Za-z0-9\s]+$/.test(value),
        'Tên chỉ chấp nhận kí tự in hoa, in thường, khoảng cách hoặc số'
      )
  ),
  color: zfd
    .json(
      z
        .object({ from: z.string(), to: z.string() })
        .or(z.object({ color: z.string() }))
    )
    .optional(),
});
