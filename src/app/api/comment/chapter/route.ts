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

    const targetChapter = await db.chapter.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        mangaId: true,
      },
    });

    let createdComment;
    if (type === 'SUB_COMMENT') {
      const targetComment = await db.comment.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          authorId: true,
          chapterId: true,
        },
      });

      [createdComment] = await db.$transaction([
        db.comment.create({
          data: {
            chapterId: targetChapter.id,
            mangaId: targetChapter.mangaId,
            authorId: session.user.id,
            replyToId: targetComment.id,
            content: { ...content },
            oEmbed,
          },
        }),
        ...(session.user.id !== targetComment.authorId
          ? [
              db.notify.create({
                data: {
                  type: 'GENERAL',
                  toUserId: targetComment.authorId,
                  content: `${session.user.name} vừa phản hồi bình luận của bạn`,
                  endPoint: `${process.env.NEXTAUTH_URL}/chapter/${targetComment.chapterId}`,
                },
              }),
            ]
          : []),
      ]);
    } else {
      createdComment = await db.comment.create({
        data: {
          chapterId: targetChapter.id,
          mangaId: targetChapter.mangaId,
          authorId: session.user.id,
          content: { ...content },
          oEmbed,
        },
      });
    }

    return new Response(JSON.stringify(createdComment.id));
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
