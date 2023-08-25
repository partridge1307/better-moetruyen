import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage, UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { CreateThreadFormValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();
  let followedSubForumIds: number[] = [];

  if (session) {
    const followedSubForums = await db.subscription.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { subForum: { creatorId: session.user.id } },
        ],
      },
      select: {
        subForumId: true,
      },
    });

    followedSubForumIds = followedSubForums.map((sub) => sub.subForumId);
  }

  try {
    const { page, limit, sortBy } = z
      .object({
        page: z.string(),
        limit: z.string(),
        sortBy: z.enum(['asc', 'desc', 'hot']),
      })
      .parse({
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
        sortBy: url.searchParams.get('sortBy'),
      });

    const orderBy: Prisma.PostOrderByWithRelationAndSearchRelevanceInput =
      sortBy === 'hot' ? { votes: { _count: 'desc' } } : { createdAt: sortBy };
    const whereClause: Prisma.PostWhereInput = session
      ? { subForum: { id: { in: followedSubForumIds } } }
      : {};

    const posts = await db.post.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        votes: true,
        subForum: {
          select: {
            title: true,
          },
        },
        author: {
          select: {
            name: true,
            color: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { thumbnail, title, canSend } = CreateThreadFormValidator.parse(
      await req.formData()
    );

    const [, createdSubForum] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          verified: true,
        },
      }),
      db.subForum.create({
        data: {
          title,
          creatorId: session.user.id,
          canSend: canSend === 'true' ? true : false,
        },
      }),
    ]);

    if (thumbnail) {
      const image =
        thumbnail instanceof File
          ? await UploadForumImage(thumbnail, createdSubForum.id, null)
          : thumbnail;

      await db.subForum.update({
        where: {
          id: createdSubForum.id,
        },
        data: {
          banner: image,
        },
      });
    }

    return new Response(
      JSON.stringify(createdSubForum.title.split(' ').join('-'))
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return new Response('Existed sub forum', { status: 406 });
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { subForumId } = z
      .object({ subForumId: z.number() })
      .parse(await req.json());

    await Promise.all([
      db.subForum.findFirstOrThrow({
        where: {
          id: subForumId,
          creatorId: session.user.id,
        },
      }),
      db.subForum.delete({
        where: {
          id: subForumId,
        },
      }),
      DeleteSubForumImage(subForumId),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
