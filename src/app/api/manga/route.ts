import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [user, existedManga] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          verified: true,
        },
      }),
      db.manga.findFirst({
        where: {
          creatorId: session.user.id,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!user.verified && existedManga)
      return new Response('Need verify', { status: 400 });

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

    const mangaCreated = await db.manga.create({
      data: {
        name,
        description,
        review,
        image: '',
        altName,
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

    let uploadedImage;
    if (typeof img === 'string') {
      uploadedImage = img;
    } else uploadedImage = await UploadMangaImage(img, mangaCreated.id, null);

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
