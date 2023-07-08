import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { disRegex, fbRegex } from '@/lib/utils';
import { authorInfo, tagInfo } from '@/lib/validators/upload';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodType, z } from 'zod';
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
  image: zfd.file(z.any() as ZodType<File | string>),
  name: zfd.text(z.string().min(3).max(255)),
  description: zfd.json(descriptionInfo),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
  facebook: zfd.text(z.string().optional()),
  discord: zfd.text(z.string().optional()),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
    });
    const targetManga = await db.manga.findFirstOrThrow({
      where: {
        id: +context.params.id,
        creatorId: user.id,
      },
    });

    const form = await req.formData();
    const {
      image: img,
      name,
      description,
      author,
      tag,
      facebook,
      discord,
    } = mangaFormValidator.parse(form);

    let image: string;
    if (typeof img === 'string') {
      image = img;
    } else {
      image = await upload({ blobImage: img, retryCount: 5 });
    }

    if (facebook && !fbRegex.test(facebook))
      return new Response('Invalid FB link', { status: 406 });
    if (discord && !disRegex.test(discord))
      return new Response('Invalid Discord link', { status: 406 });

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        image,
        name,
        description,
        facebookLink: !facebook ? null : facebook,
        discordLink: !discord ? null : discord,
        tags: {
          set: [],
          connect: tag.map((t) => ({ id: t.id })),
        },
        author: {
          set: [],
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