import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { TagEditValidator } from '@/lib/validators/admin';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, name, description, category } = TagEditValidator.parse(
      await req.json()
    );

    const [user, targetTag] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          OR: [{ role: 'ADMIN' }, { role: 'MOD' }],
        },
        select: { name: true },
      }),
      db.tag.findFirstOrThrow({ where: { id } }),
    ]);

    await db.$transaction([
      db.tag.update({
        where: { id: targetTag.id },
        data: { name, description, category },
      }),
      db.log.create({
        data: {
          content: `${user.name} đã chỉnh sửa Tag ${targetTag.name}`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { name, description, category } = TagEditValidator.parse(
      await req.json()
    );

    const user = await db.user.findFirstOrThrow({
      where: { id: session.user.id, OR: [{ role: 'ADMIN' }, { role: 'MOD' }] },
      select: { name: true },
    });

    await db.$transaction([
      db.tag.create({ data: { name, description, category } }),
      db.log.create({ data: { content: `${user.name} đã tạo Tag ${name}` } }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z.object({ id: z.number() }).parse(await req.json());

    const [user, targetTag] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          OR: [{ role: 'ADMIN' }, { role: 'MOD' }],
        },
        select: { name: true },
      }),
      db.tag.findFirstOrThrow({
        where: { id },
      }),
    ]);

    await db.$transaction([
      db.tag.delete({ where: { id: targetTag.id } }),
      db.log.create({
        data: { content: `${user.name} đã xóa Badge ${targetTag.name}` },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
