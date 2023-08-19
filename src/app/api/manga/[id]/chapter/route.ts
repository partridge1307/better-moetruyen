import { getAuthSession } from '@/lib/auth';
import { UploadChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { ChapterFormUploadValidator } from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, volume, chapterIndex, chapterName } =
      ChapterFormUploadValidator.parse(await req.formData());

    const [manga, team] = await db.$transaction([
      db.manga.findFirstOrThrow({
        where: {
          id: +context.params.id,
          creatorId: session.user.id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.memberOnTeam.findFirst({
        where: {
          userId: session.user.id,
        },
        select: {
          teamId: true,
        },
      }),
    ]);

    let index;
    if (chapterIndex === 0) {
      index = (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
          },
          orderBy: {
            chapterIndex: 'desc',
          },
          select: {
            chapterIndex: true,
          },
        })
      )?.chapterIndex;

      if (!index) index = 1;
      else index++;
    } else {
      index = chapterIndex;

      if (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
            chapterIndex: index,
          },
          select: {
            id: true,
          },
        })
      )
        return new Response('Forbidden', { status: 403 });
    }

    const uploadedImages = await UploadChapterImage(images, manga.id, index);

    if (team) {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages,
          manga: {
            connect: { id: manga.id },
          },
          team: {
            connect: { id: team.teamId },
          },
        },
      });
    } else {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages,
          manga: {
            connect: { id: manga.id },
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response(error.message, { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
