import { getAuthSession } from '@/lib/auth';
import { EditChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { ChapterFormEditValidator } from '@/lib/validators/upload';
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

    const chapter = await db.chapter.findFirstOrThrow({
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
