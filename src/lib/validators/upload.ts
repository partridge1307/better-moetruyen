import { ZodType, z } from 'zod';

export const MangaUploadValidator = z
  .object({
    image: z.any() as ZodType<File | Blob>,
    name: z
      .string()
      .min(3, { message: 'Tối thiểu 3 kí tự' })
      .max(255, { message: 'Tối đa 255 kí tự' }),
    description: z
      .string()
      .min(20, { message: 'Tối thiểu 20 kí tự' })
      .max(2048, { message: 'Tối đa 2048 kí tự' }),
    author: z.string().min(1, { message: 'Phải có tên tác giả' }),
    tag: z.string().array().min(1, { message: 'Tối thiểu có một Tag' }),
  })
  .required()
  .refine((schema) => schema.image, {
    message: 'Phải chứa ảnh',
    path: ['image'],
  });

export type CreateMangaUploadPayload = z.infer<typeof MangaUploadValidator>;
