import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';

export const authorInfo = z.object({
  id: z.number(),
  name: z.string(),
});
export type authorInfoProps = z.infer<typeof authorInfo>;

export const tagInfo = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});
export type tagInfoProps = z.infer<typeof tagInfo>;

const blocksInfo = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
});
const descriptionInfo = z.object({
  time: z.number(),
  blocks: z.array(blocksInfo),
  version: z.string(),
});

export const MangaUploadValidator = z
  .object({
    image: z
      .any()
      .refine(
        (file) =>
          typeof file === 'string' ||
          (file?.size <= 4 * 1000 * 1000 &&
            ['image/jpeg', 'image/png', 'image/jpg'].includes(file?.type)),
        'Ảnh phải dưới 4MB và có định dạng là .jpg, .png, .jpeg'
      ) as ZodType<File | string>,
    name: z
      .string()
      .min(3, { message: 'Tối thiểu 3 kí tự' })
      .max(255, { message: 'Tối đa 255 kí tự' }),
    description: z.any(descriptionInfo),
    review: z.string().min(5, 'Tối thiểu 5 kí tự').max(512, 'Tối đa 512 kí tự'),
    author: z.array(authorInfo).min(1, { message: 'Tối thiểu một tác giả' }),
    tag: z.array(tagInfo).min(1, { message: 'Tối thiểu có một thể loại' }),
    facebookLink: z.string().optional(),
    discordLink: z.string().optional(),
  })
  .required()
  .refine((schema) => schema.image, {
    message: 'Phải chứa ảnh',
    path: ['image'],
  });
export type MangaUploadPayload = z.infer<typeof MangaUploadValidator>;

export const ChapterUploadValidator = z.object({
  chapterIndex: z
    .number()
    .min(0, { message: 'Số thứ tự chapter phải lớn hơn 0' }),
  chapterName: z.string().optional(),
  volume: z.number().min(1, { message: 'Volume phải là số dương' }),
  image: z.any() as ZodType<FileList | string[]>,
});
export type ChapterUploadPayload = z.infer<typeof ChapterUploadValidator>;

export const CommentContentValidator = z.object({
  content: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  oEmbed: z
    .object({
      link: z.string(),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        image: z.object({ url: z.string() }),
      }),
    })
    .optional(),
  commentId: z.number().optional(),
});
export type CommentContentPayload = z.infer<typeof CommentContentValidator>;
