import { ZodType, z } from 'zod';

export const authorInfo = z.object({
  id: z.number(),
  name: z.string(),
});

export type authorInfoProps = z.infer<typeof authorInfo>;

export const tagInfo = z.object({
  id: z.number(),
  name: z.string(),
});

export type tagInfoProps = z.infer<typeof tagInfo>;

export const MangaUploadValidator = z
  .object({
    image: z.any() as ZodType<File>,
    name: z
      .string()
      .min(3, { message: 'Tối thiểu 3 kí tự' })
      .max(255, { message: 'Tối đa 255 kí tự' }),
    description: z.any(),
    author: z.array(authorInfo).min(1, { message: 'Tối thiểu một tác giả' }),
    tag: z.array(tagInfo).min(1, { message: 'Tối thiểu có một thể loại' }),
  })
  .required()
  .refine((schema) => schema.image, {
    message: 'Phải chứa ảnh',
    path: ['image'],
  });

export type MangaUploadPayload = z.infer<typeof MangaUploadValidator>;

export const ChapterUploadValidator = z
  .object({
    chapterIndex: z
      .number()
      .min(0, { message: 'Số thứ tự chapter phải lớn hơn 0' }),
    chapterName: z
      .string()
      .min(3, { message: 'Tối thiểu 3 ký tự' })
      .max(255, { message: 'Tối đa 255 ký tự' }),
    volume: z.number().min(0, { message: 'Volume phải là số dương' }),
    image: z.any() as ZodType<FileList>,
  })
  .refine((schema) => schema.image.length >= 5, {
    message: 'Phải chứa ít nhất 5 ảnh',
    path: ['image'],
  });

export type ChapterUploadPayload = z.infer<typeof ChapterUploadValidator>;
