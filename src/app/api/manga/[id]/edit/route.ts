import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { MangaFormValidator } from '@/lib/validators/upload';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

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
      altName,
      author,
      tag,
      facebookLink,
      discordLink,
    } = MangaFormValidator.parse(form);

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

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        image,
        name,
        description,
        review,
        altName,
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
