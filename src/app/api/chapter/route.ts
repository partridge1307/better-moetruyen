import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const chapterValidator = z.object({
  images: z.string().array(),
  chapterName: z.string(),
  chapterIndex: z.number(),
  volume: z.number(),
});

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    if (
      !(await db.manga.findFirst({
        where: {
          id: parseInt(context.params.id, 10),
          creatorId: session.user.id,
        },
      }))
    )
      return new Response('Forbidden', { status: 400 });

    const {
      chapterIndex,
      chapterName: name,
      images,
      volume,
    } = chapterValidator.parse(await req.json());

    let index;
    if (chapterIndex === 0) {
      index = (
        await db.chapter.findFirst({
          where: {
            mangaId: parseInt(context.params.id, 10),
          },
          orderBy: {
            chapterIndex: 'desc',
          },
        })
      )?.chapterIndex;

      if (!index) index = 1;
      else index++;
    } else {
      index = chapterIndex;
    }

    if (
      await db.chapter.findFirst({
        where: {
          mangaId: parseInt(context.params.id, 10),
          chapterIndex: index,
        },
      })
    )
      return new Response('Forbidden', { status: 403 });

    await db.chapter.create({
      data: {
        chapterIndex: index,
        name,
        volume,
        images: [...images],
        manga: {
          connect: { id: parseInt(context.params.id, 10) },
        },
      },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response(error.message, { status: 422 });
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
