import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateCommentValidator } from '@/lib/validators/comment';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, id, content, oEmbed } = CreateCommentValidator.parse(
      await req.json()
    );

    if (type === 'SUB_COMMENT') {
      const targetComment = await db.comment.findFirstOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          mangaId: true,
        },
      });

      await db.comment.create({
        data: {
          replyToId: targetComment.id,
          mangaId: targetComment.mangaId,
          authorId: session.user.id,
          content: { ...content },
          oEmbed,
        },
      });
    } else {
      await db.comment.create({
        data: {
          mangaId: id,
          authorId: session.user.id,
          content: { ...content },
          oEmbed,
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
