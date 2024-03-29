import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';
import { disRegex, fbRegex, vieRegex } from '../utils';

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

export const MangaUploadValidator = z.object({
  image: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') || value.startsWith('https://i.moetruyen.net'),
      'Ảnh không hợp lệ'
    ),
  name: z
    .string()
    .min(3, { message: 'Tối thiểu 3 kí tự' })
    .max(255, { message: 'Tối đa 255 kí tự' })
    .refine(
      (value) => vieRegex.test(value),
      'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
    ),
  description: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  review: z.string().min(5, 'Tối thiểu 5 kí tự').max(256, 'Tối đa 256 kí tự'),
  altName: z
    .string()
    .optional()
    .refine((name) => {
      if (name) {
        return name.length > 4;
      } else return true;
    }, 'Tối thiểu 5 kí tự')
    .refine((name) => {
      if (name) {
        return name.length < 513;
      } else return true;
    }, 'Tối đa 512 kí tự'),
  author: z.array(authorInfo).min(1, { message: 'Tối thiểu một tác giả' }),
  tag: z.array(tagInfo).min(1, { message: 'Tối thiểu có một thể loại' }),
  facebookLink: z
    .string()
    .optional()
    .refine((link) => {
      if (link) {
        return fbRegex.test(link);
      } else return true;
    }, 'Chỉ chấp nhận link Page hoặc Profile'),
  discordLink: z
    .string()
    .optional()
    .refine((link) => {
      if (link) {
        return disRegex.test(link);
      } else return true;
    }, 'Chỉ chấp nhận link Invite'),
});
export type MangaUploadPayload = z.infer<typeof MangaUploadValidator>;

export const MangaFormValidator = zfd.formData({
  image: zfd
    .file()
    .refine((file) => file.size <= 4 * 1000 * 1000, 'Tối đa 4MB')
    .refine(
      (file) => ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type),
      'Chỉ nhận ảnh có định dạng .jpg, .png, .jpeg'
    )
    .or(
      zfd
        .text()
        .refine(
          (endpoint) => endpoint.startsWith(`${process.env.IMG_DOMAIN}`),
          'Ảnh có đường dẫn không hợp lệ'
        )
    ),
  name: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(255, 'Tối đa 255 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
      )
  ),
  description: zfd.json(
    z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>
  ),
  review: zfd.text(
    z.string().min(5, 'Tối thiểu 5 kí tự').max(255, 'Tối đa 255 kí tự')
  ),
  altName: zfd
    .text(z.string().min(5, 'Tối thiểu 5 kí tự').max(512, 'Tối đa 512 kí tự'))
    .optional(),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
  facebookLink: zfd.text(
    z
      .string()
      .optional()
      .refine((link) => {
        if (link) {
          return fbRegex.test(link);
        } else return true;
      }, 'Chỉ chấp nhận link Page hoặc Profile')
  ),
  discordLink: zfd.text(
    z
      .string()
      .optional()
      .refine((link) => {
        if (link) {
          return disRegex.test(link);
        } else return true;
      }, 'Chỉ chấp nhận link Invite')
  ),
});
