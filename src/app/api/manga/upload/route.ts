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
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Chỉ nhận định dạng .jpg, .png, .jpeg'
    ),
  name: zfd.text(z.string().min(3).max(255)),
  description: zfd.json(descriptionInfo),
  review: zfd
    .text(z.string().min(5, 'Tối thiểu 5 kí tự').max(512, 'Tối đa 512 kí tự'))
    .optional(),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
  facebookLink: zfd.text(z.string().optional()),
  discordLink: zfd.text(z.string().optional()),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
        verified: true,
      },
    });

    const existedManga = await db.manga.findFirst({
      where: {
        creatorId: user.id,
      },
      select: {
        id: true,
      },
    });
    if (!user.verified && existedManga)
      return new Response('Need verify', { status: 400 });

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

    if (facebookLink && !fbRegex.test(facebookLink))
      return new Response('Invalid FB link', { status: 406 });
    if (discordLink && !disRegex.test(discordLink))
      return new Response('Invalid Discord link', { status: 406 });

    const mangaCreated = await db.manga.create({
      data: {
        name,
        description,
        review,
        image: '',
        facebookLink: !facebookLink ? null : facebookLink,
        discordLink: !discordLink ? null : discordLink,
        creatorId: user.id,
        tags: {
          connect: tag.map((t) => ({
            id: t.id,
          })),
        },
        author: {
          connectOrCreate: author.map((a) => ({
            where: { id: a.id },
            create: { name: a.name },
          })),
        },
      },
    });

    const uploadedImage = await UploadMangaImage(img, mangaCreated.id, null);
    await db.manga.update({
      where: {
        id: mangaCreated.id,
      },
      data: {
        image: uploadedImage,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new Response('Duplicated manga', { status: 409 });
      }
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
