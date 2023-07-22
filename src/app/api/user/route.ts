import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { UserProfileEditValidator } from '@/lib/validators/user';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

const formValidator = zfd.formData(UserProfileEditValidator);

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
        image: true,
        banner: true,
        color: true,
      },
    });

    const form = await req.formData();
    const { avatar, banner, name, color } = formValidator.parse(form);

    let avatarUrl: string | null = null,
      bannerUrl: string | null = null;
    if (avatar) avatarUrl = await upload({ blobImage: avatar, retryCount: 5 });
    if (banner) bannerUrl = await upload({ blobImage: banner, retryCount: 5 });

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        image: avatarUrl ? avatarUrl : user.image,
        banner: bannerUrl ? bannerUrl : user.banner,
        color: color ? color : user.color,
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
