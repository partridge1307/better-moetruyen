import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { commentVoteValidator } from '@/lib/validators/vote';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { voteType, commentId } = commentVoteValidator.parse(
      await req.json()
    );

    const [existingVote] = await db.$transaction([
      db.commentVote.findFirst({
        where: {
          userId: session.user.id,
          commentId,
        },
        select: {
          type: true,
        },
      }),
      db.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });

        return new Response('OK');
      }
      await db.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id,
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
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not Found', { status: 404 });
      }
    }

    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
