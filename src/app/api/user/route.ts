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

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        image: !avatarUrl ? user.image : avatarUrl,
        banner: !bannerUrl ? user.banner : bannerUrl,
        color: color ? (color as any) : user.color,
      },
    });

    return new Response('OK');
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
