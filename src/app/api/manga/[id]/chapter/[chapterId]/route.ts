import { db } from '@/lib/db';

export async function POST(
  req: Request,
  context: { params: { id: string; chapterId: string } }
) {
  try {
    const view = await db.view.findFirst({
      where: {
        mangaId: parseInt(context.params.id, 10),
      },
    });
    if (!view) return new Response('Something went wrong', { status: 500 });

    await db.view.update({
      where: {
        mangaId: parseInt(context.params.id, 10),
      },
      data: {
        totalView: view.totalView + 1,
        dailyView: {
          create: { chapterId: parseInt(context.params.chapterId, 10) },
        },
        weeklyView: {
          create: { chapterId: parseInt(context.params.chapterId, 10) },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
