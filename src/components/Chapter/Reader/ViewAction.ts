'use server';

import { db } from '@/lib/db';
import { limiter } from '@/lib/rate-limit';
import { requestIp } from '@/lib/request-ip';
import { headers } from 'next/headers';

export async function UpdateView(chapterId: number) {
  //if (Math.round(Date.now() - stime) > 1000 * 60) return;

  const HeadersList = new Headers(headers());
  const ip = requestIp(HeadersList) ?? '127.0.0.1';

  try {
    await limiter.check(HeadersList, 50, ip);

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

    if (!chapter.teamId) {
      db.view.update({
        where: {
          mangaId: chapter.mangaId,
        },
        data: {
          totalView: {
            increment: 1,
          },
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
        },
      });
    } else {
      await db.$transaction([
        db.view.update({
          where: {
            mangaId: chapter.mangaId,
          },
          data: {
            totalView: {
              increment: 1,
            },
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
    }
  } catch (error) {
    return;
  }
}
