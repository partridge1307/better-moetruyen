import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { MangaUploadValidator } from '@/lib/validators/upload';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as string;
    const name = form.get('name') as string;
    const description = form.get('description') as string;
    const author = form.get('author') as string;
    const tag = form.getAll('tag') as Array<string>;

    const imageURL = await upload(file);

    const user = await db.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!user) return new Response('User does not exists', { status: 401 });

    if (user.isFirstUpload)
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          isFirstUpload: false,
        },
      });

    await db.manga.create({
      data: {
        name,
        author,
        description,
        image: imageURL,
        creatorId: user.id,
        tags: {
          connect: tag.map((id) => ({
            id: +id,
          })),
        },
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Không thể upload manga', { status: 500 });
  }
}
