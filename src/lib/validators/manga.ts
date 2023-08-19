import { ZodType, z } from 'zod';
import { disRegex, fbRegex } from '../utils';
import { zfd } from 'zod-form-data';

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
  })
  .required()
  .refine((schema) => schema.image, {
    message: 'Phải chứa ảnh',
    path: ['image'],
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
    z.string().min(3, 'Tối thiểu 3 kí tự').max(255, 'Tối đa 255 kí tự')
  ),
  description: zfd.json(descriptionInfo),
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
