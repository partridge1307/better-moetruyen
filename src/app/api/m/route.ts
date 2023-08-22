import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateThreadValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { title } = CreateThreadValidator.parse(await req.json());

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
        },
      }),
    ]);

    return new Response(JSON.stringify(createdSubForum.id));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return new Response('Existed sub forum', { status: 406 });
      if (error.code === 'P2022')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
