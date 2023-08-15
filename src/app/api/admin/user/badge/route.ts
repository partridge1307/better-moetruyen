import { UploadBadgeImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { AddBadgeFormValidator } from '@/lib/validators/admin';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
        role: 'ADMIN',
      },
      select: {
        name: true,
      },
    });

    const { image, name, description, color } = AddBadgeFormValidator.parse(
      await req.formData()
    );

    const uploadedImage = await UploadBadgeImage(image, null);

    await db.$transaction([
      db.badge.create({
        data: {
          image: uploadedImage,
          name,
          description,
          color,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} đã tạo Badge ${name}`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
