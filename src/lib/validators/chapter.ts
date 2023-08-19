import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';

export const ChapterUploadValidator = z.object({
  chapterIndex: z
    .number()
    .min(0, { message: 'Số thứ tự chapter phải lớn hơn 0' }),
  chapterName: z.string().optional(),
  volume: z.number().min(1, { message: 'Volume phải là số dương' }),
  image: z.any() as ZodType<FileList | string[]>,
});
export type ChapterUploadPayload = z.infer<typeof ChapterUploadValidator>;

export const ChapterFormEditValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd
        .file()
        .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
        .refine((file) => {
          return ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type);
        }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
        .or(
          zfd
            .text()
            .refine(
              (image) => image.startsWith(`${process.env.IMG_DOMAIN}/chapter`),
              'Ảnh không hợp lệ'
            )
        )
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(256, 'Tối đa 256 kí tự'))
    .optional(),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
  volume: zfd.numeric(z.number().min(1, 'Volume phải lớn hơn 0')),
});

export const ChapterFormUploadValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd
        .file()
        .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
        .refine(
          (file) =>
            ['image/jpg', 'image/png', 'image/jpeg'].includes(file.type),
          'Chỉ nhận định dạng .jpg, .png, .jpeg'
        )
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  volume: zfd.numeric(z.number().min(1, 'Số volume phải lớn hơn 0')),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(256, 'Tối đa 256 kí tự'))
    .optional(),
});

export const ChapterReportValidator = z.object({
  id: z.number(),
  type: z.enum(['violate', 'image-die']),
  content: z.string().min(5, 'Tối thiểu 5 kí tự').max(255, 'Tối đa 255 kí tự'),
});
export type ChapterReportPayload = z.infer<typeof ChapterReportValidator>;
