import { getAuthSession } from '@/lib/auth';
import { EditChapterImage, UploadChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import {
  ChapterFormEditValidator,
  ChapterFormUploadValidator,
} from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PATCH(
  req: Request,
  context: { params: { chapterId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, chapterIndex, chapterName, volume } =
      ChapterFormEditValidator.parse(await req.formData());

    const chapter = await db.chapter.findUniqueOrThrow({
      where: {
        manga: {
          creatorId: session.user.id,
        },
        id: +context.params.chapterId,
      },
      select: {
        mangaId: true,
        images: true,
      },
    });

    const edittedImages = await EditChapterImage(
      images,
      chapter.images,
      chapter.mangaId,
      chapterIndex
    );

    await db.chapter.update({
      where: {
        id: +context.params.chapterId,
      },
      data: {
        chapterIndex,
        name: chapterName,
        volume,
        images: edittedImages
          .sort((a, b) => a.index - b.index)
          .map((img) => img.image),
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, volume, chapterIndex, chapterName } =
      ChapterFormUploadValidator.parse(await req.formData());

    const [manga, team] = await db.$transaction([
      db.manga.findUniqueOrThrow({
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
      else index = Math.floor(index++);
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
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
