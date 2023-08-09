import { db } from '@/lib/db';
import { CommentContentValidator } from '@/lib/validators/upload';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
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

    const { content, oEmbed, commentId } = CommentContentValidator.parse(
      await req.json()
    );

    let createdComment;
    if (commentId) {
      createdComment = await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: user.id,
          mangaId: +context.params.id,
          replyToId: commentId,
        },
      });
    } else {
      createdComment = await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: user.id,
          mangaId: +context.params.id,
        },
      });
    }

    return new Response(JSON.stringify(createdComment.id));
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
