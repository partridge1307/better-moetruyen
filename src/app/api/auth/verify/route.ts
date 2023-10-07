import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserVerifyValidator } from '@/lib/validators/user';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { isChecked } = UserVerifyValidator.parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        verified: true,
      },
    });

    if (!isChecked) return new Response('Need check', { status: 406 });
    if (user.verified) return new Response('Already verified', { status: 403 });

    await db.verifyList.create({
      data: {
        userId: session.user.id,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return new Response('Already submit verify request', { status: 409 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
