import { getAuthSession } from '@/lib/auth';
import { UploadUserImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { UserFormUpdateValidator } from '@/lib/validators/user';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        image: true,
        banner: true,
        color: true,
      },
    });

    const { avatar, banner, name, color } = UserFormUpdateValidator.parse(
      await req.formData()
    );

    let avatarUrl: string | null = null,
      bannerUrl: string | null = null;
    if (avatar)
      avatarUrl = await UploadUserImage(avatar, user.image, user.id, 'avatar');
    if (banner)
      bannerUrl = await UploadUserImage(banner, user.banner, user.id, 'banner');

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        image: avatarUrl ? avatarUrl : user.image,
        banner: bannerUrl ? bannerUrl : user.banner,
        // @ts-ignore
        color: color ? color : user.color,
      },
    });

    return new Response(
      JSON.stringify({
        avatar: updatedUser.image,
        banner: updatedUser.banner,
        name: updatedUser.name,
        color: updatedUser.color,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.account.deleteMany({
        where: {
          userId: session.user.id,
        },
      }),
      db.discordChannel.deleteMany({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
