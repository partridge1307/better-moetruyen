import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { chapterIndex, name, images } = await req.json();
    await db.chapter.create({
      data: {
        chapterIndex,
        name,
        images: [...images],
        manga: {
          connect: { id: +context.params.id },
        },
      },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
