import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { TeamEditValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

const formValidator = zfd.formData(TeamEditValidator);

export async function PATCH(
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
    const team = await db.team.findFirstOrThrow({
      where: {
        id: +context.params.id,
        ownerId: user.id,
      },
      select: {
        id: true,
        image: true,
      },
    });

    const form = await req.formData();
    const { image, name } = formValidator.parse(form);
    let imageUrl: string | null = null;

    if (image) await upload({ blobImage: image, retryCount: 5 });

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        image: imageUrl ? imageUrl : team.image,
        name: name,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
