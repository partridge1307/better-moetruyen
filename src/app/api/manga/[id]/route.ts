import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { normalizeText } from '@/lib/utils';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

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
    } = MangaFormValidator.parse(await req.formData());

    const targetManga = await db.manga.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        image: true,
      },
    });

    let image: string;
    if (img instanceof File) {
      image = await UploadMangaImage(img, targetManga.id, targetManga.image);
    } else {
      image = img;
    }

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        image,
        slug: `${normalizeText(name)
          .toLowerCase()
          .slice(0, 32)
          .trim()
          .split(' ')
          .join('-')}-${targetManga.id}`,
        name,
        description: { ...description },
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
