import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { disRegex, fbRegex } from '@/lib/utils';
import { authorInfo, tagInfo } from '@/lib/validators/upload';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

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

const mangaFormValidator = zfd.formData({
  image: zfd
    .file()
    .refine((file) => file.size <= 4 * 1000 * 1000, 'Tối đa 4MB')
    .refine((file) =>
      ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)
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
    z.string().min(5, 'Tối thiểu 5 kí tự').max(512, 'Tối đa 512 kí tự')
  ),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
  facebookLink: zfd.text(z.string().optional()),
  discordLink: zfd.text(z.string().optional()),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const form = await req.formData();
    const {
      image: img,
      name,
      description,
      review,
      author,
      tag,
      facebookLink,
      discordLink,
    } = mangaFormValidator.parse(form);

    const [, targetManga] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: token.id,
        },
        select: {
          id: true,
        },
      }),
      db.manga.findFirstOrThrow({
        where: {
          id: +context.params.id,
          creatorId: token.id,
        },
        select: {
          id: true,
          image: true,
        },
      }),
    ]);

    let image: string;
    if (typeof img === 'string') {
      image = img;
    } else {
      image = await UploadMangaImage(img, targetManga.id, targetManga.image);
    }

    if (facebookLink && !fbRegex.test(facebookLink))
      return new Response('Invalid FB link', { status: 406 });
    if (discordLink && !disRegex.test(discordLink))
      return new Response('Invalid Discord link', { status: 406 });

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        image,
        name,
        description,
        review,
        facebookLink: !facebookLink ? null : facebookLink,
        discordLink: !discordLink ? null : discordLink,
        tags: {
          connect: tag.map((t) => ({ id: t.id })),
        },
        author: {
          connectOrCreate: author.map((a) => ({
            where: { id: a.id },
            create: { name: a.name },
          })),
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
