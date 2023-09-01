import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { id } = z
      .object({
        id: z.number(),
      })
      .parse(await req.json());

    const chapter = await db.chapter.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        mangaId: true,
        teamId: true,
      },
    });

    if (chapter.teamId !== null) {
      await db.$transaction([
        db.view.update({
          where: {
            mangaId: chapter.mangaId,
          },
          data: {
            dailyView: {
              create: {
                chapterId: chapter.id,
                teamId: chapter.teamId,
              },
            },
            weeklyView: {
              create: {
                chapterId: chapter.id,
                teamId: chapter.teamId,
              },
            },
            totalView: {
              increment: 1,
            },
          },
        }),
        db.team.update({
          where: {
            id: chapter.teamId,
          },
          data: {
            totalView: {
              increment: 1,
            },
          },
        }),
      ]);
    } else {
      await db.view.update({
        where: {
          mangaId: chapter.mangaId,
        },
        data: {
          dailyView: {
            create: {
              chapterId: chapter.id,
            },
          },
          weeklyView: {
            create: {
              chapterId: chapter.id,
            },
          },
          totalView: {
            increment: 1,
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
