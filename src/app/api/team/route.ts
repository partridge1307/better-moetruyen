import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { image, name, description } = TeamFormValidator.parse(
      await req.formData()
    );

    const createdTeam = await db.team.create({
      data: {
        image: '',
        name,
        description,
        owner: {
          connect: { id: session.user.id },
        },
        member: {
          create: { userId: session.user.id },
        },
      },
    });

    let uploadedImage;
    if (image instanceof File)
      uploadedImage = await UploadTeamImage(image, createdTeam.id, null);
    else uploadedImage = image;

    await db.team.update({
      where: {
        id: createdTeam.id,
      },
      data: {
        image: uploadedImage,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response(
        'Team already created or someone has created this team',
        { status: 400 }
      );
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
