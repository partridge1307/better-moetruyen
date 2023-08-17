import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormEditValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const team = await db.team.findFirstOrThrow({
      where: {
        id: +context.params.id,
        ownerId: session.user.id,
      },
      select: {
        id: true,
        image: true,
      },
    });

    const form = await req.formData();
    const { image, name } = TeamFormEditValidator.parse(form);
    let imageUrl: string | null = null;

    if (image) imageUrl = await UploadTeamImage(image, team.id, team.image);

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
