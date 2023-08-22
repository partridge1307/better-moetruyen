import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentVoteValidator } from '@/lib/validators/comment';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { commentId, voteType } = CommentVoteValidator.parse(
      await req.json()
    );

    const [, existingVote] = await db.$transaction([
      db.comment.findFirstOrThrow({
        where: {
          id: commentId,
        },
        select: {
          id: true,
        },
      }),
      db.commentVote.findFirst({
        where: {
          userId: session.user.id,
          commentId,
        },
        select: {
          type: true,
        },
      }),
    ]);

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });

        return new Response('OK');
      }

      await db.commentVote.update({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
        data: {
          type: voteType,
        },
      });

      return new Response('OK');
    } else {
      await db.commentVote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          commentId,
        },
      });

      return new Response('OK');
    }
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
