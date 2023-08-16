import { getAuthSession } from '@/lib/auth';
import { UploadBadgeImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { AddBadgeFormValidator } from '@/lib/validators/admin';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: session.user.id,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z.object({ id: z.number() }).parse(await req.json());

    const [user, badge] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: { id: session.user.id, role: 'ADMIN' },
        select: { name: true },
      }),
      db.badge.findFirstOrThrow({ where: { id } }),
    ]);

    await db.$transaction([
      db.badge.delete({ where: { id: badge.id } }),
      db.log.create({
        data: { content: `${user.name} đã xóa Badge ${badge.name}` },
      }),
    ]);

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
