'use server';

import { db } from '@/lib/db';
import { limiter } from '@/lib/rate-limit';
import { requestIp } from '@/lib/request-ip';
import { headers } from 'next/headers';

export async function UpdateView(chapterId: number) {
  const header = headers();
  const headersList = new Headers(header);
  const ip = requestIp(header) ?? '127.0.0.1';

  try {
    await limiter.check(headersList, 50, ip);

    const chapter = await db.chapter.findUniqueOrThrow({
      where: {
        id: chapterId,
      },
      select: {
        id: true,
        mangaId: true,
        teamId: true,
      },
    });

    if (!!chapter.teamId) {
      await db.$transaction([
        db.view.update({
          where: {
            mangaId: chapter.mangaId,
          },
          data: {
            dailyView: {
              create: {
                chapterId,
                teamId: chapter.teamId,
              },
            },
            weeklyView: {
              create: {
                chapterId,
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
      db.view.update({
        where: {
          mangaId: chapter.mangaId,
        },
        data: {
          dailyView: {
            create: {
              chapterId,
              teamId: chapter.teamId,
            },
          },
          weeklyView: {
            create: {
              chapterId,
              teamId: chapter.teamId,
            },
          },
          totalView: {
            increment: 1,
          },
        },
      });
    }

    return;
  } catch (error) {
    return;
  }
}
