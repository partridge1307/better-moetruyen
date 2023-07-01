import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { authorInfo, tagInfo } from '@/lib/validators/upload';

const mangaFormValidator = zfd.formData({
  image: zfd.file(),
  name: zfd.text(),
  description: zfd.text(),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const form = await req.formData();
    const {
      image: img,
      name,
      description,
      author,
      tag,
    } = mangaFormValidator.parse(form);

    const user = await db.user.findFirst({
      where: {
        id: session.user.id,
      },
    });
    if (!user) return new Response('User does not exists', { status: 404 });

    const checkManga = await db.manga.findFirst({
      where: {
        creatorId: user.id,
      },
    });
    if (!user.verified && checkManga)
      return new Response('Need verify', { status: 400 });

    const image = await upload(img);

    await db.manga.create({
      data: {
        name,
        description,
        image,
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

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new Response('Duplicated manga', { status: 409 });
      }
    }
    return new Response('Forbidden', { status: 500 });
  }
}
