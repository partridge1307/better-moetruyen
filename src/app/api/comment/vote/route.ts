import { db } from '@/lib/db';
import { commentVoteValidator } from '@/lib/validators/vote';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
      },
    });

    const { voteType, commentId } = commentVoteValidator.parse(
      await req.json()
    );

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: user.id,
        commentId,
      },
      select: {
        type: true,
      },
    });

    await db.comment.findUniqueOrThrow({
      where: {
        id: commentId,
      },
      select: {
        id: true,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: user.id,
            },
          },
        });

        return new Response('OK');
      }
      await db.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: user.id,
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
          userId: user.id,
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
