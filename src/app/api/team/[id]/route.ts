import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';
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

    const { image, name, description } = TeamFormValidator.parse(
      await req.formData()
    );

    let imageUrl;
    if (image instanceof File)
      imageUrl = await UploadTeamImage(image, team.id, team.image);
    else imageUrl = image;

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        image: imageUrl,
        name,
        description,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const team = await db.team.findFirstOrThrow({
      where: {
        id: +context.params.id,
        member: {
          some: {
            userId: session.user.id,
          },
        },
        NOT: { ownerId: session.user.id },
      },
    });

    await db.memberOnTeam.delete({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: team.id,
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof AxiosError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [hasTeam, inTeamJoinRequest] = await db.$transaction([
      db.memberOnTeam.findFirst({
        where: {
          userId: session.user.id,
        },
      }),
      db.teamJoinRequest.findFirst({
        where: {
          userId: session.user.id,
          teamId: +context.params.id,
        },
      }),
    ]);

    if (hasTeam)
      return new Response('You already joined in this or another Team', {
        status: 406,
      });
    if (inTeamJoinRequest)
      return new Response('You already send join request to this Team', {
        status: 400,
      });

    await db.teamJoinRequest.create({
      data: {
        userId: session.user.id,
        teamId: +context.params.id,
      },
    });

    return new Response('Ok');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, userId } = z
      .object({
        type: z.enum(['ACCEPT', 'REJECT']),
        userId: z.string(),
      })
      .parse(await req.json());

    const [team, , isInTeam] = await db.$transaction([
      db.team.findFirstOrThrow({
        where: {
          ownerId: session.user.id,
        },
      }),
      db.teamJoinRequest.findFirstOrThrow({
        where: {
          teamId: +context.params.id,
          userId,
        },
      }),
      db.memberOnTeam.findFirst({
        where: {
          userId,
        },
      }),
    ]);

    if (isInTeam) {
      await db.teamJoinRequest.delete({
        where: {
          userId,
        },
      });

      return new Response('Target user already in other Team', { status: 406 });
    }

    if (type === 'ACCEPT') {
      await db.$transaction([
        db.memberOnTeam.create({
          data: {
            userId,
            teamId: team.id,
          },
        }),
        db.teamJoinRequest.delete({
          where: {
            userId,
          },
        }),
      ]);
    } else {
      await db.$transaction([
        db.teamJoinRequest.delete({
          where: {
            teamId_userId: {
              teamId: team.id,
              userId,
            },
          },
        }),
      ]);
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
