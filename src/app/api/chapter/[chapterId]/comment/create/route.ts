import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodType, z } from 'zod';

const CommentContentValidator = z.object({
  content: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  oEmbed: z
    .object({
      link: z.string(),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        image: z.object({ url: z.string() }),
      }),
    })
    .optional(),
  commentId: z.number().optional(),
  id: z.string(),
});

export async function PUT(
  req: NextRequest,
  context: { params: { chapterId: string } }
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

    const { content, oEmbed, commentId, id } = CommentContentValidator.parse(
      await req.json()
    );

    let createdComment;
    if (commentId) {
      createdComment = await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: user.id,
          mangaId: +id,
          chapterId: +context.params.chapterId,
          replyToId: commentId,
        },
      });
    } else {
      createdComment = await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: user.id,
          mangaId: +id,
          chapterId: +context.params.chapterId,
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
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
